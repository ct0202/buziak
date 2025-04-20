const { google } = require('googleapis');
const OAuth2 = google.auth.OAuth2;
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// Создание OAuth2 клиента
const oauth2Client = new OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
);

// Генерация URL для авторизации
exports.getAuthUrl = (req, res) => {
    const authUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: [
            'https://www.googleapis.com/auth/userinfo.email',
            'https://www.googleapis.com/auth/userinfo.profile'
        ],
        prompt: 'consent'
    });
    res.json({ authUrl });
};

// Обработка callback от Google
exports.handleGoogleCallback = async (req, res) => {
    try {
        const { code } = req.query;

        // Получаем токены
        const { tokens } = await oauth2Client.getToken(code);
        oauth2Client.setCredentials(tokens);

        // Получаем информацию о пользователе
        const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
        const { data } = await oauth2.userinfo.get();

        // Проверяем, существует ли пользователь
        let user = await User.findOne({ email: data.email });

        if (!user) {
            // Создаем нового пользователя
            user = new User({
                name: data.name,
                email: data.email,
                password: crypto.randomBytes(32).toString('hex'),
                phone: `google_${data.id}`,
                gender: 'male'
            });
            await user.save();
        } else {
            // Если пользователь существует, обновляем его данные
            user.name = data.name;
            await user.save();
        }

        // Генерируем JWT токен
        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        // Перенаправляем на фронтенд с токеном
        res.redirect(`${process.env.CLIENT_URL}/dashboard?token=${token}`);
    } catch (error) {
        console.error('Ошибка при обработке Google callback:', error);
        res.redirect(`${process.env.CLIENT_URL}/auth/error?message=auth_failed`);
    }
};