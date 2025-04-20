import express from 'express';
import { getPhotos, uploadPhoto, deletePhoto } from '../controllers/photoController.js';
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
router.get('/', getPhotos);

// Загрузка фото
router.post('/', upload.single('photo'), uploadPhoto);

// Удаление фото по индексу
router.delete('/:index', deletePhoto);

export default router; 