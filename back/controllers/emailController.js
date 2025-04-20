const { google } = require('googleapis');
const OAuth2 = google.auth.OAuth2;
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const User = require('../models/User');

const confirmationCodes = new Map();

const generateConfirmationCode = () => {
    return Math.floor(1000 + Math.random() * 9000).toString();
};

const getGmailService = async () => {
    const oauth2Client = new OAuth2(
        process.env.GMAIL_CLIENT_ID,
        process.env.GMAIL_CLIENT_SECRET,
        process.env.GMAIL_REDIRECT_URI
    );

    try {
        oauth2Client.setCredentials({
            refresh_token: process.env.GMAIL_REFRESH_TOKEN
        });

        await oauth2Client.getAccessToken();
        
        return google.gmail({ version: 'v1', auth: oauth2Client });
    } catch (error) {
        if (error.message.includes('invalid_grant')) {
            throw new Error('Refresh token недействителен. Пожалуйста, выполните авторизацию заново через /api/auth/google');
        }
        throw error;
    }
};

exports.sendConfirmationCode = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: 'Email не указан' });
        }

        const confirmationCode = generateConfirmationCode();
        confirmationCodes.set(email, confirmationCode);

        // Отправляем код
        const gmail = await getGmailService();
        const message = `From: ${process.env.MAIL_USER}\r\nTo: ${email}\r\nSubject: Confirmation Code\r\nContent-Type: text/html; charset=utf-8\r\n\r\n<h2>Ваш код подтверждения</h2><p>Используйте этот код для подтверждения: <strong>${confirmationCode}</strong></p><p>Код действителен в течение 10 минут.</p>`;

        const encodedMessage = Buffer.from(message)
            .toString('base64')
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=+$/, '');

        await gmail.users.messages.send({
            userId: 'me',
            requestBody: {
                raw: encodedMessage
            }
        });

        // Удаляем код через 10 минут
        setTimeout(() => {
            confirmationCodes.delete(email);
        }, 10 * 60 * 1000);

        res.status(200).json({ 
            message: 'Код подтверждения отправлен на вашу почту',
            code: confirmationCode // Отправляем код в ответе для тестирования
        });
    } catch (error) {
        console.error('Ошибка отправки кода подтверждения:', error);
        if (error.message.includes('Refresh token недействителен')) {
            return res.status(401).json({ 
                message: error.message,
                needReauthorization: true
            });
        }
        res.status(500).json({ message: 'Ошибка отправки кода подтверждения' });
    }
};

// Отправка ссылки сброса пароля
exports.sendPasswordResetLink = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: 'Email не указан' });
        }

        // Находим пользователя
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'Пользователь с таким email не найден' });
        }

        // Генерируем токен для сброса пароля
        const resetToken = crypto.randomBytes(32).toString('hex');
        
        // Сохраняем токен в базе данных
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = Date.now() + 180000; // 3 минуты
        await user.save();

        // Создаем ссылку для сброса пароля
        const resetLink = `${process.env.CLIENT_URL}/newPassword?token=${resetToken}`;

        // Отправляем письмо
        const gmail = await getGmailService();
        const message = `From: ${process.env.MAIL_USER}\r\nTo: ${email}\r\nSubject: Сброс пароля\r\nContent-Type: text/html; charset=utf-8\r\n\r\n<h2>Сброс пароля</h2><p>Для сброса пароля перейдите по следующей ссылке:</p><p><a href="${resetLink}">Сбросить пароль</a></p><p>Ссылка действительна в течение 3 минут.</p>`;

        const encodedMessage = Buffer.from(message)
            .toString('base64')
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=+$/, '');

        await gmail.users.messages.send({
            userId: 'me',
            requestBody: {
                raw: encodedMessage
            }
        });

        res.status(200).json({ 
            message: 'Ссылка для сброса пароля отправлена на вашу почту'
        });
    } catch (error) {
        console.error('Ошибка отправки ссылки сброса пароля:', error);
        if (error.message.includes('Refresh token недействителен')) {
            return res.status(401).json({ 
                message: error.message,
                needReauthorization: true
            });
        }
        res.status(500).json({ message: 'Ошибка отправки ссылки сброса пароля' });
    }
};

// Проверка токена сброса пароля
exports.verifyResetToken = async (req, res) => {
    try {
        const { token } = req.params;

        if (!token) {
            return res.status(400).json({ message: 'Токен не предоставлен' });
        }

        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ 
                message: 'Токен недействителен или истек',
                isValid: false
            });
        }

        res.status(200).json({ 
            message: 'Токен действителен',
            isValid: true
        });
    } catch (error) {
        console.error('Ошибка проверки токена:', error);
        res.status(500).json({ message: 'Ошибка проверки токена' });
    }
};

// Сброс пароля
exports.resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;

        if (!token || !newPassword) {
            return res.status(400).json({ message: 'Токен и новый пароль обязательны' });
        }

        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        });

        console.log('changed password -> ', user);

        if (!user) {
            return res.status(400).json({ message: 'Токен недействителен или истек' });
        }

        // Устанавливаем новый пароль
        user.password = newPassword;
        
        // Очищаем токен
        user.resetPasswordToken = null;
        user.resetPasswordExpires = null;
        
        // Сохраняем пользователя - middleware автоматически хеширует пароль
        await user.save();

        res.status(200).json({ message: 'Пароль успешно изменен' });
    } catch (error) {
        console.error('Ошибка сброса пароля:', error);
        res.status(500).json({ message: 'Ошибка сброса пароля' });
    }
};

// Проверка кода подтверждения
exports.verifyConfirmationCode = async (req, res) => {
    try {
        const { email, code } = req.body;

        if (!email || !code) {
            return res.status(400).json({ 
                success: false, 
                message: 'Email и код подтверждения обязательны' 
            });
        }

        // Проверяем код в глобальном Map
        const storedCode = confirmationCodes.get(email);
        
        if (!storedCode) {
            return res.status(400).json({ 
                success: false, 
                message: 'Код подтверждения не найден или истек' 
            });
        }

        if (storedCode !== code) {
            return res.status(400).json({ 
                success: false, 
                message: 'Неверный код подтверждения' 
            });
        }

        // Находим пользователя
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: 'Пользователь не найден' 
            });
        }

        // Код верный, активируем пользователя
        // user.isActive = true;
        // await user.save();

        // Удаляем использованный код
        confirmationCodes.delete(email);

        res.json({ 
            success: true, 
            message: 'Email успешно подтвержден' 
        });
    } catch (error) {
        console.error('Ошибка при проверке кода подтверждения:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Ошибка при проверке кода подтверждения' 
        });
    }
}; 