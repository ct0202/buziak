import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { OAuth2Client } from 'google-auth-library';
import { s3, BUCKET_NAME } from '../config/aws.js';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Регистрация пользователя
export const register = async (req, res) => {
    try {
        const { email, password, name } = req.body;

        // Проверяем, существует ли пользователь
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Пользователь с таким email уже существует' });
        }

        // Хешируем пароль
        const hashedPassword = await bcrypt.hash(password, 10);

        // Создаем нового пользователя
        const user = new User({
            email,
            password: hashedPassword,
            name,
            photos: new Array(6).fill(null)
        });

        await user.save();

        // Создаем JWT токен
        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '30d' }
        );

        res.status(201).json({
            token,
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                photos: user.photos
            }
        });
    } catch (error) {
        console.error('Ошибка при регистрации:', error);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
};

// Вход пользователя
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Находим пользователя
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Неверный email или пароль' });
        }

        // Проверяем пароль
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Неверный email или пароль' });
        }

        // Создаем JWT токен
        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '30d' }
        );

        res.json({
            token,
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                photos: user.photos
            }
        });
    } catch (error) {
        console.error('Ошибка при входе:', error);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
};

// Google аутентификация
export const googleAuth = async (req, res) => {
    try {
        const { token } = req.body;

        // Верифицируем токен Google
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID
        });

        const payload = ticket.getPayload();
        const { email, name, picture } = payload;

        // Проверяем, существует ли пользователь
        let user = await User.findOne({ email });

        if (!user) {
            // Создаем нового пользователя
            user = new User({
                email,
                name,
                photos: new Array(6).fill(null)
            });

            // Если есть аватар от Google, сохраняем его
            if (picture) {
                try {
                    // Скачиваем изображение
                    const response = await fetch(picture);
                    const buffer = await response.buffer();
                    
                    // Генерируем уникальное имя файла
                    const fileName = `${user._id}-google-avatar.jpg`;
                    const key = `avatars/${fileName}`;

                    // Загружаем в S3
                    await s3.upload({
                        Bucket: BUCKET_NAME,
                        Key: key,
                        Body: buffer,
                        ContentType: 'image/jpeg'
                    }).promise();

                    // Сохраняем ключ в базе данных
                    user.avatar = key;
                } catch (error) {
                    console.error('Ошибка при сохранении аватара Google:', error);
                }
            }

            await user.save();
        }

        // Создаем JWT токен
        const jwtToken = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '30d' }
        );

        res.json({
            token: jwtToken,
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                photos: user.photos,
                avatar: user.avatar
            }
        });
    } catch (error) {
        console.error('Ошибка при Google аутентификации:', error);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
};

// Получение URL авторизации
export const getAuthUrl = async (req, res) => {
    try {
        const authUrl = client.generateAuthUrl({
            access_type: 'offline',
            scope: ['profile', 'email'],
            prompt: 'consent'
        });
        res.json({ authUrl });
    } catch (error) {
        console.error('Ошибка при получении URL авторизации:', error);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
};

// Обработка callback от Google
export const handleGoogleCallback = async (req, res) => {
    try {
        const { code } = req.query;
        const { tokens } = await client.getToken(code);
        client.setCredentials(tokens);

        const ticket = await client.verifyIdToken({
            idToken: tokens.id_token,
            audience: process.env.GOOGLE_CLIENT_ID
        });

        const payload = ticket.getPayload();
        const { email, name, picture } = payload;

        // Проверяем, существует ли пользователь
        let user = await User.findOne({ email });

        if (!user) {
            // Создаем нового пользователя
            user = new User({
                email,
                name,
                photos: new Array(6).fill(null)
            });

            // Если есть аватар от Google, сохраняем его
            if (picture) {
                try {
                    // Скачиваем изображение
                    const response = await fetch(picture);
                    const buffer = await response.buffer();
                    
                    // Генерируем уникальное имя файла
                    const fileName = `${user._id}-google-avatar.jpg`;
                    const key = `avatars/${fileName}`;

                    // Загружаем в S3
                    await s3.upload({
                        Bucket: BUCKET_NAME,
                        Key: key,
                        Body: buffer,
                        ContentType: 'image/jpeg'
                    }).promise();

                    // Сохраняем ключ в базе данных
                    user.avatar = key;
                } catch (error) {
                    console.error('Ошибка при сохранении аватара Google:', error);
                }
            }

            await user.save();
        }

        // Создаем JWT токен
        const jwtToken = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '30d' }
        );

        res.json({
            token: jwtToken,
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                photos: user.photos,
                avatar: user.avatar
            }
        });
    } catch (error) {
        console.error('Ошибка при обработке callback от Google:', error);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
};

// Экспортируем все функции как default
export default {
    register,
    login,
    googleAuth,
    getAuthUrl,
    handleGoogleCallback
};