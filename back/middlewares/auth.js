const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = async (req, res, next) => {
    try {
        // Получаем токен из заголовка Authorization
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ message: 'Требуется авторизация' });
        }

        // Верифицируем токен
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Находим пользователя
        const user = await User.findById(decoded.id);
        
        if (!user) {
            return res.status(401).json({ message: 'Пользователь не найден' });
        }

        // Добавляем информацию о пользователе в запрос
        req.user = user;
        next();
    } catch (error) {
        console.error('Ошибка аутентификации:', error);
        res.status(401).json({ message: 'Недействительный токен' });
    }
}; 