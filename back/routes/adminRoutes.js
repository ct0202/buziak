const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const auth = require('../middlewares/auth');
const admin = require('../middlewares/admin');

// Вход администратора (не требует аутентификации)
router.post('/login', adminController.adminLogin);

// Все остальные роуты защищены middleware аутентификации и проверки прав администратора
router.use(auth);
router.use(admin);

// Получение списка всех пользователей
router.get('/users', adminController.getAllUsers);

// Блокировка/разблокировка пользователя
router.put('/users/:userId/toggle-status', adminController.toggleUserStatus);

// Получение списка пользователей на верификацию
router.get('/users/verification', adminController.getUsersForVerification);
// Получение детальной информации о пользователе
router.get('/users/:id', adminController.getUserDetails);

// Изменение статуса верификации пользователя
router.post('/users/:id/verify', adminController.verifyUser);

module.exports = router; 