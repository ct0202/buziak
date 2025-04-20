const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const userRoutes = require("./routes/userRoutes");
const authRoutes = require("./routes/authRoutes");
const emailRoutes = require("./routes/emailRoutes");
const photoRoutes = require("./routes/photoRoutes");
const profileRoutes = require("./routes/profileRoutes");
const adminRoutes = require("./routes/adminRoutes");
const cors = require("cors");
const morgan = require("morgan");
const mongoose = require("mongoose");
const path = require("path");

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
