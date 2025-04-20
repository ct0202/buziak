import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { s3, BUCKET_NAME } from '../config/aws.js';
import multer from 'multer';
import crypto from 'crypto';
let fetch;
import('node-fetch').then(module => {
  fetch = module.default;
});

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

// Получение профиля пользователя
export const getProfile = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'Токен не предоставлен' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('-password');
        
        if (!user) {
            return res.status(404).json({ message: 'Пользователь не найден' });
        }

        res.json(user);
    } catch (error) {
        console.error('Ошибка при получении профиля:', error);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
};

// Обновление профиля пользователя
export const updateProfile = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'Токен не предоставлен' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);
        
        if (!user) {
            return res.status(404).json({ message: 'Пользователь не найден' });
        }

        // Обновляем только те поля, которые были предоставлены
        if (req.body.name) user.name = req.body.name;
        if (req.body.phone) user.phone = req.body.phone;
        if (req.body.gender) user.gender = req.body.gender;
        if (req.body.birthDate) user.birthDate = req.body.birthDate;
        if (req.body.avatar) user.avatar = req.body.avatar;

        await user.save();
        res.json({ message: 'Профиль успешно обновлен' });
    } catch (error) {
        console.error('Ошибка при обновлении профиля:', error);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
};

// Загрузка верификационного фото
export const uploadVerificationPhoto = async (req, res) => {
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
export const updateLocation = async (req, res) => {
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
        const lon = parseFloat(longitude);

        if (isNaN(lat) || isNaN(lon)) {
            return res.status(400).json({ message: 'Неверный формат координат' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'Пользователь не найден' });
        }

        // Получаем информацию о местоположении
        const locationInfo = await getLocationInfo(lat, lon);

        // Обновляем местоположение пользователя
        user.location = {
            type: 'Point',
            coordinates: [lon, lat],
            country: locationInfo?.country,
            city: locationInfo?.city,
            lastUpdated: new Date()
        };

        await user.save();

        res.json({
            message: 'Местоположение обновлено',
            location: user.location
        });
    } catch (error) {
        console.error('Ошибка при обновлении местоположения:', error);
        res.status(500).json({ message: 'Ошибка при обновлении местоположения' });
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

// Экспортируем все функции как default
export default {
    getProfile,
    updateProfile,
    uploadVerificationPhoto,
    updateLocation
}; 