import express from 'express';
import { getProfile, updateLocation, uploadVerificationPhoto, updateAboutMe, updateProfileSettings, updatePurpose } from '../controllers/profileController.js';
import multer from 'multer';
// import auth from '../middlewares/auth.js';

const router = express.Router();

// Настройка multer для обработки верификационного фото
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
        files: 1
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Только изображения разрешены'), false);
        }
    }
});

// Все роуты защищены middleware аутентификации
// router.use(auth);

// Получение профиля пользователя
router.get('/', getProfile);

// Обновление геолокации
router.post('/location', updateLocation);

// Загрузка верификационного фото
router.post('/verification', upload.single('photo'), uploadVerificationPhoto);

// Обновление информации о пользователе
router.put('/about-me', updateAboutMe);

// Обновление настроек профиля
router.put('/', updateProfileSettings);

// Обновление цели пользователя
router.put('/purpose', updatePurpose);

export default router; 