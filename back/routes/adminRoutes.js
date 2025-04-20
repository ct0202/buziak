import express from 'express';
import { adminLogin, getAllUsers, toggleUserStatus, getUsersForVerification, getUserDetails, verifyUser } from '../controllers/adminController.js';
import auth from '../middlewares/auth.js';
import admin from '../middlewares/admin.js';

const router = express.Router();

// Вход администратора (не требует аутентификации)
router.post('/login', adminLogin);

// Все остальные роуты защищены middleware аутентификации и проверки прав администратора
router.use(auth);
router.use(admin);

// Получение списка всех пользователей
router.get('/users', getAllUsers);

// Блокировка/разблокировка пользователя
router.put('/users/:userId/toggle-status', toggleUserStatus);

// Получение списка пользователей на верификацию
router.get('/users/verification', getUsersForVerification);

// Получение детальной информации о пользователе
router.get('/users/:id', getUserDetails);

// Изменение статуса верификации пользователя
router.post('/users/:id/verify', verifyUser);

export default router; 