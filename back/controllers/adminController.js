const User = require('../models/User');
const mongoose = require('mongoose');
const { s3, BUCKET_NAME } = require('../config/aws');
const jwt = require('jsonwebtoken');

// Получение списка всех пользователей
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find()
            .select('-password -resetPasswordToken -resetPasswordExpires')
            .sort({ createdAt: -1 });
            
        res.json(users);
    } catch (error) {
        console.error('Ошибка при получении списка пользователей:', error);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
};

// Блокировка/разблокировка пользователя
exports.toggleUserStatus = async (req, res) => {
    try {
        const { userId } = req.params;
        
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: 'Неверный формат ID пользователя' });
        }
        
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'Пользователь не найден' });
        }
        
        // Нельзя заблокировать администратора
        if (user.isAdmin) {
            return res.status(403).json({ message: 'Нельзя заблокировать администратора' });
        }
        
        user.isBlocked = !user.isBlocked;
        await user.save();
        
        res.json({ 
            message: `Пользователь ${user.isBlocked ? 'заблокирован' : 'разблокирован'}`,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                isBlocked: user.isBlocked
            }
        });
    } catch (error) {
        console.error('Ошибка при изменении статуса пользователя:', error);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
};

// Получение списка пользователей на верификацию
exports.getUsersForVerification = async (req, res) => {
    try {
        const users = await User.find({ 
            verificationPhoto: { $ne: null },
            verified: false 
        })
        .select('-password -resetPasswordToken -resetPasswordExpires')
        .sort({ createdAt: -1 });

        // Добавляем подписанные URL для верификационных фото
        const usersWithUrls = await Promise.all(
            users.map(async (user) => {
                if (user.verificationPhoto) {
                    const url = await s3.getSignedUrlPromise('getObject', {
                        Bucket: BUCKET_NAME,
                        Key: user.verificationPhoto,
                        Expires: 3600
                    });
                    return {
                        ...user.toObject(),
                        verificationPhotoUrl: url
                    };
                }
                return user;
            })
        );
            
        res.json(usersWithUrls);
    } catch (error) {
        console.error('Ошибка при получении списка пользователей на верификацию:', error);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
};

// Получение детальной информации о пользователе
exports.getUserDetails = async (req, res) => {
    try {
        const { id } = req.params;
        
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Неверный формат ID пользователя' });
        }
        
        const user = await User.findById(id)
            .select('-password -resetPasswordToken -resetPasswordExpires');
            
        if (!user) {
            return res.status(404).json({ message: 'Пользователь не найден' });
        }

        // Генерируем URL для верификационного фото
        if (user.verificationPhoto) {
            user.verificationPhotoUrl = await s3.getSignedUrlPromise('getObject', {
                Bucket: BUCKET_NAME,
                Key: user.verificationPhoto,
                Expires: 3600
            });
        }

        // Генерируем URL для всех фотографий пользователя
        if (user.photos && user.photos.length > 0) {
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

            user.photos = photos.filter(photo => photo !== null);
        }
        
        res.json(user);
    } catch (error) {
        console.error('Ошибка при получении детальной информации о пользователе:', error);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
};

// Изменение статуса верификации пользователя
exports.verifyUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { verified } = req.body;
        
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Неверный формат ID пользователя' });
        }
        
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: 'Пользователь не найден' });
        }

        if (typeof verified !== 'boolean') {
            return res.status(400).json({ message: 'Неверный формат статуса верификации' });
        }

        user.verified = verified;
        await user.save();
        
        res.json({ 
            message: `Статус верификации пользователя ${verified ? 'подтвержден' : 'отклонен'}`,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                verified: user.verified
            }
        });
    } catch (error) {
        console.error('Ошибка при изменении статуса верификации:', error);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
};

// Вход администратора
exports.adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email и пароль обязательны' });
        }

        const user = await User.findOne({ email });
        console.log(password, user.password);
        if (!user || password !== user.password) {
            return res.status(401).json({ message: 'Неверные данные' });
        }

        if (!user.isAdmin) {
            return res.status(403).json({ message: 'Доступ запрещен' });
        }

        // Генерируем JWT токен
        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        // Исключаем чувствительные поля из ответа
        const userResponse = {
            _id: user._id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin,
            verified: user.verified
        };

        res.json({
            token,
            user: userResponse
        });
    } catch (error) {
        console.error('Ошибка при входе администратора:', error);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
}; 