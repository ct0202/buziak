const { s3, BUCKET_NAME } = require('../config/aws');
const User = require('../models/User');
const crypto = require('crypto');
const mongoose = require('mongoose');

// Получение фотографий пользователя
exports.getPhotos = async (req, res) => {
    try {
        const { userId } = req.query;

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

        // Генерируем URL для каждой фотографии
        const photos = await Promise.all(
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

        // Фильтруем null значения и возвращаем только существующие фото
        res.json(photos.filter(photo => photo !== null));
    } catch (error) {
        console.error('Ошибка при получении фотографий:', error);
        res.status(500).json({ message: 'Ошибка при получении фотографий' });
    }
};

// Загрузка фото
exports.uploadPhoto = async (req, res) => {
    try {
        const { position, userId } = req.body;
        const file = req.file;

        if (!file) {
            return res.status(400).json({ message: 'Файл не предоставлен' });
        }

        if (position === undefined || position < 0 || position > 8) {
            return res.status(400).json({ message: 'Неверная позиция фото (должна быть от 0 до 8)' });
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
        const fileName = `${userId}-${Date.now()}-${crypto.randomBytes(8).toString('hex')}.${file.originalname.split('.').pop()}`;
        const key = `photos/${fileName}`;

        // Загружаем файл в S3
        const params = {
            Bucket: BUCKET_NAME,
            Key: key,
            Body: file.buffer,
            ContentType: file.mimetype
        };

        await s3.upload(params).promise();

        // Обновляем массив фотографий пользователя
        if (!user.photos) {
            user.photos = new Array(9).fill(null);
        }
        user.photos[position] = key;
        await user.save();

        // Генерируем URL для просмотра
        const url = await s3.getSignedUrlPromise('getObject', {
            Bucket: BUCKET_NAME,
            Key: key,
            Expires: 3600
        });

        res.json({
            message: 'Фото успешно загружено',
            url,
            position
        });
    } catch (error) {
        console.error('Ошибка при загрузке фото:', error);
        res.status(500).json({ message: 'Ошибка при загрузке фото' });
    }
};

// Удаление фото по индексу
exports.deletePhoto = async (req, res) => {
    try {
        const { index } = req.params;
        const { userId } = req.body;

        if (index < 0 || index > 8) {
            return res.status(400).json({ message: 'Неверный индекс фото (должен быть от 0 до 8)' });
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

        if (!user.photos || !user.photos[index]) {
            return res.status(404).json({ message: 'Фото не найдено' });
        }

        // Удаляем фото из S3
        const params = {
            Bucket: BUCKET_NAME,
            Key: user.photos[index]
        };

        await s3.deleteObject(params).promise();

        // Удаляем ссылку из массива
        user.photos[index] = null;
        await user.save();

        res.json({ 
            message: 'Фото успешно удалено',
            position: index
        });
    } catch (error) {
        console.error('Ошибка при удалении фото:', error);
        res.status(500).json({ message: 'Ошибка при удалении фото' });
    }
};

// Получение URL для просмотра фото
exports.getPhotoURL = async (req, res) => {
    try {
        const { key } = req.params;
        const url = await s3.getSignedUrlPromise('getObject', {
            Bucket: BUCKET_NAME,
            Key: key,
            Expires: 3600
        });
        res.json({ url });
    } catch (error) {
        console.error('Ошибка при получении URL фото:', error);
        res.status(500).json({ message: 'Ошибка при получении URL фото' });
    }
}; 