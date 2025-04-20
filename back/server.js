import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import photoRoutes from './routes/photoRoutes.js';
import emailRoutes from './routes/emailRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import connectDB from './config/db.js';
import morgan from 'morgan';
import path from 'path';

dotenv.config();

const app = express();

// CORS middleware
// app.use(cors({
//     origin: true,
//     methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
//     allowedOrigins: ["http://localhost:3000", "https://buziak.online", "http://localhost:5173"],
//     allowedHeaders: ["Content-Type", "Authorization", "Accept", "Origin", "X-Requested-With", "X-User-Email"],
//     credentials: true,
//     preflightContinue: false,
//     optionsSuccessStatus: 204
// }));

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// Отдача статических файлов
app.use(express.static(path.join(__dirname, 'public')));

// Логирование запросов
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    if (req.body && Object.keys(req.body).length > 0) {
        console.log('Body:', req.body);
    }
    next();
});

// API Routes
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/email", emailRoutes);
app.use("/api/profile/photos", photoRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/admin", adminRoutes);

// Обработка ошибок
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: "Что-то пошло не так!" });
});

// Запуск
const PORT = process.env.PORT || 5002;
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
  });
});
