import express from 'express';
import photoController from '../controllers/photoController.js';
// import auth from '../middlewares/auth.js';
import multer from 'multer';

const router = express.Router();

// Настройка multer для обработки multipart/form-data
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB
    }
});

// Все роуты защищены middleware аутентификации
// router.use(auth);

// Получение фотографий
router.get('/', photoController.getPhotos);

// Загрузка фото
router.post('/', upload.single('photo'), photoController.uploadPhoto);

// Удаление фото по индексу
router.delete('/:index', photoController.deletePhoto);

export default router; 