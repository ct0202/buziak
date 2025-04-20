const User = require('../models/User');

module.exports = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id);
        
        if (!user || !user.isAdmin) {
            return res.status(403).json({ message: 'Доступ запрещен' });
        }
        
        next();
    } catch (error) {
        console.error('Ошибка проверки прав администратора:', error);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
}; 