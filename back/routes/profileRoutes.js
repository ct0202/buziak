const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const multer = require('multer');
// const auth = require('../middlewares/auth');

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
router.get('/', profileController.getProfile);

// Обновление геолокации
router.post('/location', profileController.updateLocation);

// Загрузка верификационного фото
router.post('/verification', upload.single('photo'), profileController.uploadVerificationPhoto);

// Обновление информации о пользователе
router.put('/about-me', profileController.updateAboutMe);

// Обновление настроек профиля
router.put('/', profileController.updateProfileSettings);

// Обновление цели пользователя
router.put('/purpose', profileController.updatePurpose);

module.exports = router; 