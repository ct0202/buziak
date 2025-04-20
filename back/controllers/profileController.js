const User = require('../models/User');
const mongoose = require('mongoose');
const { s3, BUCKET_NAME } = require('../config/aws');
let fetch;
import('node-fetch').then(module => {
  fetch = module.default;
});
const multer = require('multer');
const crypto = require('crypto');

// Настройка multer для обработки верификационного фото
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
        files: 1
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Только изображения разрешены'), false);
        }
    }
});

// Получение полной информации о пользователе
exports.getProfile = async (req, res) => {
    try {
        const { userId } = req.query;

        if (!userId || userId === 'undefined') {
            return res.status(400).json({ message: 'ID пользователя не указан' });
        }

        // Проверяем, что userId является валидным ObjectId
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: 'Неверный формат ID пользователя' });
        }

        // Находим пользователя и исключаем чувствительные поля
        const user = await User.findById(userId).select('-password -resetPasswordToken -resetPasswordExpires');
        
        if (!user) {
            return res.status(404).json({ message: 'Пользователь не найден' });
        }

        // Генерируем URL для каждой фотографии
        if (user.photos && user.photos.length > 0) {
            console.log("генерируем URL для каждой фотографии");
            const photoUrls = await Promise.all(
                user.photos.map(async (key, position) => {
                    if (!key) return null;
                    
                    const url = await s3.getSignedUrlPromise('getObject', {
                        Bucket: BUCKET_NAME,
                        Key: key,
                        Expires: 3600
                    });

                    return {
                        position,
                        url,
                        key
                    };
                })
            );

            user.photoUrls = photoUrls.filter(photo => photo !== null);
            console.log('user.photoUrls', user.photoUrls);
        }

        // Генерируем URL для верификационного фото, если оно есть
        if (user.verificationPhoto) {
            user.verificationPhotoUrl = await s3.getSignedUrlPromise('getObject', {
                Bucket: BUCKET_NAME,
                Key: user.verificationPhoto,
                Expires: 3600
            });
        }

        // Преобразуем документ Mongoose в обычный объект перед отправкой
        const userObject = user.toObject();
        console.log('userObject', userObject);
        res.json(userObject);
    } catch (error) {
        console.error('Ошибка при получении профиля:', error);
        res.status(500).json({ message: 'Ошибка при получении профиля' });
    }
};

// Загрузка верификационного фото
exports.uploadVerificationPhoto = async (req, res) => {
    try {
        const { userId } = req.body;
        const file = req.file;

        if (!file) {
            return res.status(400).json({ message: 'Файл не предоставлен' });
        }

        if (!userId || userId === 'undefined') {
            return res.status(400).json({ message: 'ID пользователя не указан' });
        }

        // Проверяем, что userId является валидным ObjectId
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: 'Неверный формат ID пользователя' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'Пользователь не найден' });
        }

        // Генерируем уникальное имя файла
        const fileName = `verification/${userId}-${Date.now()}-${crypto.randomBytes(8).toString('hex')}.${file.originalname.split('.').pop()}`;
        const key = fileName;

        // Загружаем файл в S3
        const params = {
            Bucket: BUCKET_NAME,
            Key: key,
            Body: file.buffer,
            ContentType: file.mimetype
        };

        await s3.upload(params).promise();

        // Если у пользователя уже есть верификационное фото, удаляем старое
        if (user.verificationPhoto) {
            try {
                await s3.deleteObject({
                    Bucket: BUCKET_NAME,
                    Key: user.verificationPhoto
                }).promise();
            } catch (error) {
                console.error('Ошибка при удалении старого верификационного фото:', error);
            }
        }

        // Обновляем ссылку на верификационное фото
        user.verificationPhoto = key;
        user.verified = false; // Сбрасываем статус верификации
        await user.save();

        // Генерируем URL для просмотра
        const url = await s3.getSignedUrlPromise('getObject', {
            Bucket: BUCKET_NAME,
            Key: key,
            Expires: 3600
        });

        res.json({
            message: 'Верификационное фото успешно загружено',
            url,
            verificationPhoto: key
        });
    } catch (error) {
        console.error('Ошибка при загрузке верификационного фото:', error);
        res.status(500).json({ message: 'Ошибка при загрузке верификационного фото' });
    }
};

// Получение информации о местоположении по координатам
async function getLocationInfo(latitude, longitude) {
    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`,
            {
                headers: {
                    'User-Agent': 'BuziakApp/1.0'
                }
            }
        );
        
        const data = await response.json();
        
        if (data && data.address) {
            return {
                country: data.address.country,
                city: data.address.city || data.address.town || data.address.village || data.address.municipality
            };
        }
        
        return null;
    } catch (error) {
        console.error('Ошибка при получении информации о местоположении:', error);
        return null;
    }
}

// Обновление геолокации пользователя
exports.updateLocation = async (req, res) => {
    try {
        const { userId, latitude, longitude } = req.body;

        if (!userId || userId === 'undefined') {
            return res.status(400).json({ message: 'ID пользователя не указан' });
        }

        if (!latitude || !longitude) {
            return res.status(400).json({ message: 'Координаты не указаны' });
        }

        // Проверяем, что userId является валидным ObjectId
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: 'Неверный формат ID пользователя' });
        }

        // Проверяем, что координаты являются числами
        const lat = parseFloat(latitude);
        const lng = parseFloat(longitude);

        if (isNaN(lat) || isNaN(lng)) {
            return res.status(400).json({ message: 'Неверный формат координат' });
        }

        // Получаем информацию о местоположении
        const locationInfo = await getLocationInfo(lat, lng);

        // Обновляем геолокацию пользователя
        const updateData = {
            latitude: lat,
            longitude: lng,
            updatedAt: new Date()
        };

        // Добавляем страну и город, если они определены
        if (locationInfo) {
            updateData.country = locationInfo.country;
            updateData.city = locationInfo.city;
        }

        const user = await User.findByIdAndUpdate(
            userId,
            updateData,
            { new: true }
        ).select('-password -resetPasswordToken -resetPasswordExpires');

        if (!user) {
            return res.status(404).json({ message: 'Пользователь не найден' });
        }

        res.json({
            message: 'Геолокация успешно обновлена',
            user
        });
    } catch (error) {
        console.error('Ошибка при обновлении геолокации:', error);
        res.status(500).json({ message: 'Ошибка при обновлении геолокации' });
    }
};

// Обновление информации о пользователе
exports.updateAboutMe = async (req, res) => {
    try {
        const { userId, aboutMe } = req.body;

        if (!userId || userId === 'undefined') {
            return res.status(400).json({ message: 'ID пользователя не указан' });
        }

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: 'Неверный формат ID пользователя' });
        }

        const user = await User.findByIdAndUpdate(
            userId,
            { 
                aboutMe,
                updatedAt: new Date()
            },
            { new: true }
        ).select('-password -resetPasswordToken -resetPasswordExpires');

        if (!user) {
            return res.status(404).json({ message: 'Пользователь не найден' });
        }

        res.json({
            message: 'Информация о пользователе успешно обновлена',
            user
        });
    } catch (error) {
        console.error('Ошибка при обновлении информации о пользователе:', error);
        res.status(500).json({ message: 'Ошибка при обновлении информации о пользователе' });
    }
};

// Обновление настроек профиля пользователя
exports.updateProfileSettings = async (req, res) => {
    try {
        const { 
            userId, 
            whoSeesMyProfile, 
            language, 
            lookingFor, 
            showOnlyWithPhoto,
            age,
            birthDay
        } = req.body;
        
        console.log('req.body', req.body);
        
        if (!userId || userId === 'undefined') {
            return res.status(400).json({ message: 'ID пользователя не указан' });
        }

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: 'Неверный формат ID пользователя' });
        }

        // Валидация входных данных
        if (whoSeesMyProfile && !['GIRL', 'MAN', 'ALL'].includes(whoSeesMyProfile)) {
            return res.status(400).json({ message: 'Неверное значение для whoSeesMyProfile' });
        }

        if (language && !['EN', 'PL'].includes(language)) {
            return res.status(400).json({ message: 'Неверное значение для language' });
        }

        if (lookingFor && !['GIRL', 'MAN'].includes(lookingFor)) {
            return res.status(400).json({ message: 'Неверное значение для lookingFor' });
        }

        if (showOnlyWithPhoto !== undefined && typeof showOnlyWithPhoto !== 'boolean') {
            return res.status(400).json({ message: 'Неверное значение для showOnlyWithPhoto' });
        }

        if (age && (typeof age !== 'number' || age < 18 || age > 100)) {
            return res.status(400).json({ message: 'Неверное значение для age' });
        }

        const updateData = {
            updatedAt: new Date()
        };

        if (whoSeesMyProfile) updateData.whoSeesMyProfile = whoSeesMyProfile;
        if (language) updateData.language = language;
        if (lookingFor) updateData.lookingFor = lookingFor;
        if (showOnlyWithPhoto !== undefined) updateData.showOnlyWithPhoto = showOnlyWithPhoto;
        if (age) {
            updateData.age = age;
        }
        if (birthDay) {
            updateData.birthDay = new Date(birthDay);
        }

        const user = await User.findByIdAndUpdate(
            userId,
            updateData,
            { new: true }
        ).select('-password -resetPasswordToken -resetPasswordExpires');

        if (!user) {
            return res.status(404).json({ message: 'Пользователь не найден' });
        }

        res.json({
            message: 'Настройки профиля успешно обновлены',
            user
        });
    } catch (error) {
        console.error('Ошибка при обновлении настроек профиля:', error);
        res.status(500).json({ message: 'Ошибка при обновлении настроек профиля' });
    }
};

// Обновление цели пользователя
exports.updatePurpose = async (req, res) => {
    try {
        const { userId, purpose } = req.body;

        if (!userId || userId === 'undefined') {
            return res.status(400).json({ message: 'ID пользователя не указан' });
        }

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: 'Неверный формат ID пользователя' });
        }

        const user = await User.findByIdAndUpdate(
            userId,
            { 
                purpose,
                updatedAt: new Date()
            },
            { new: true }
        ).select('-password -resetPasswordToken -resetPasswordExpires');

        if (!user) {
            return res.status(404).json({ message: 'Пользователь не найден' });
        }

        res.json({
            message: 'Цель пользователя успешно обновлена',
            user
        });
    } catch (error) {
        console.error('Ошибка при обновлении цели пользователя:', error);
        res.status(500).json({ message: 'Ошибка при обновлении цели пользователя' });
    }
}; 