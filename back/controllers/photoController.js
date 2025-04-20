import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import { s3, BUCKET_NAME } from '../config/aws.js';
import { v4 as uuidv4 } from 'uuid';

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

// Загрузка аватара
export const uploadAvatar = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Файл не загружен' });
        }

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'Пользователь не найден' });
        }

        // Если у пользователя уже есть аватар, удаляем старый
        if (user.avatar) {
            await s3.deleteObject({
                Bucket: BUCKET_NAME,
                Key: user.avatar
            }).promise();
        }

        user.avatar = req.file.key;
        await user.save();

        const avatarUrl = await s3.getSignedUrlPromise('getObject', {
            Bucket: BUCKET_NAME,
            Key: user.avatar,
            Expires: 3600
        });

        res.json({
            avatar: {
                key: user.avatar,
                url: avatarUrl
            }
        });
    } catch (error) {
        console.error('Ошибка при загрузке аватара:', error);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
};

// Загрузка фотографии
export const uploadPhoto = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Файл не загружен' });
        }

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'Пользователь не найден' });
        }

        user.photos.push(req.file.key);
        await user.save();

        const photoUrl = await s3.getSignedUrlPromise('getObject', {
            Bucket: BUCKET_NAME,
            Key: req.file.key,
            Expires: 3600
        });

        res.json({
            photo: {
                key: req.file.key,
                url: photoUrl
            }
        });
    } catch (error) {
        console.error('Ошибка при загрузке фотографии:', error);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
};

// Удаление фотографии
export const deletePhoto = async (req, res) => {
    try {
        const { photoKey } = req.params;
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ message: 'Пользователь не найден' });
        }

        const photoIndex = user.photos.indexOf(photoKey);
        if (photoIndex === -1) {
            return res.status(404).json({ message: 'Фотография не найдена' });
        }

        // Удаляем фото из S3
        await s3.deleteObject({
            Bucket: BUCKET_NAME,
            Key: photoKey
        }).promise();

        // Удаляем фото из массива пользователя
        user.photos.splice(photoIndex, 1);
        await user.save();

        res.json({ message: 'Фотография успешно удалена' });
    } catch (error) {
        console.error('Ошибка при удалении фотографии:', error);
        res.status(500).json({ message: 'Ошибка сервера' });
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