const mongoose = require('mongoose');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function createAdmin() {
    try {
        // Подключаемся к базе данных
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Подключено к MongoDB');

        // Проверяем, существует ли уже админ
        const existingAdmin = await User.findOne({ isAdmin: true });
        if (existingAdmin) {
            console.log('Администратор уже существует');
            process.exit(0);
        }

        // Создаем админский аккаунт
        const admin = new User({
            name: 'Admin',
            email: 'admin@buziak.online',
            phone: 'admin_phone',
            password: 'admin123',
            gender: 'male',
            isAdmin: true,
            verified: true
        });

        await admin.save();
        console.log('Администратор успешно создан');
        console.log('Email: admin@buziak.online');
        console.log('Password: admin123');

    } catch (error) {
        console.error('Ошибка при создании администратора:', error);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

createAdmin(); 