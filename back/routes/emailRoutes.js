import express from 'express';
import { sendConfirmationCode, sendPasswordResetLink, verifyResetToken, resetPassword, verifyConfirmationCode } from '../controllers/emailController.js';

const router = express.Router();

// router.post('/code', sendEmail);
router.post('/send/code', sendConfirmationCode);
router.post('/send/reset-password', sendPasswordResetLink);
router.get('/verify-reset-token/:token', verifyResetToken);
router.post('/reset-password', resetPassword);

// Роут для проверки кода подтверждения
router.post('/verify-code', verifyConfirmationCode);

export default router; 