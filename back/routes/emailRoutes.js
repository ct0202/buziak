import express from 'express';
import emailController from '../controllers/emailController.js';

const router = express.Router();

// router.post('/code', emailController.sendEmail);
router.post('/send/code', emailController.sendConfirmationCode);
router.post('/send/reset-password', emailController.sendPasswordResetLink);
router.get('/verify-reset-token/:token', emailController.verifyResetToken);
router.post('/reset-password', emailController.resetPassword);

// Роут для проверки кода подтверждения
router.post('/verify-code', emailController.verifyConfirmationCode);

export default router; 