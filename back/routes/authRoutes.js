const express = require('express');
const router = express.Router();
const { google } = require('googleapis');
const OAuth2 = google.auth.OAuth2;
const dotenv = require('dotenv');
const authController = require('../controllers/authController');

// Загрузка переменных окружения
dotenv.config();

// Проверка переменных окружения
const requiredEnvVars = ['GMAIL_CLIENT_ID', 'GMAIL_CLIENT_SECRET', 'GMAIL_REDIRECT_URI'];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`Отсутствует обязательная переменная окружения: ${envVar}`);
    process.exit(1);
  }
}

// Создаем единый экземпляр OAuth2 клиента
const oauth2Client = new OAuth2(
  process.env.GMAIL_CLIENT_ID,
  process.env.GMAIL_CLIENT_SECRET,
  process.env.GMAIL_REDIRECT_URI
);

console.log('OAuth2 клиент создан с параметрами:', {
  clientId: process.env.GMAIL_CLIENT_ID,
  redirectUri: process.env.GMAIL_REDIRECT_URI
});

// Главная страница с кнопкой авторизации
router.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Gmail API Авторизация</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            background-color: #f5f5f5;
          }
          .container {
            text-align: center;
            padding: 20px;
            background-color: white;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          .button {
            background-color: #4285f4;
            color: white;
            padding: 12px 24px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 16px;
            text-decoration: none;
            display: inline-block;
            margin-top: 20px;
          }
          .button:hover {
            background-color: #357abd;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Gmail API Авторизация</h1>
          <p>Нажмите кнопку ниже для авторизации через Google</p>
          <a href="/api/auth/google" class="button">Авторизоваться через Google</a>
        </div>
      </body>
    </html>
  `);
});

// Роут для инициализации OAuth потока
router.get('/google', authController.getAuthUrl);

// Тестовый роут для проверки callback URL
router.get('/test-callback', (req, res) => {
  res.send('Callback URL работает корректно');
});

// Функция для генерации URL авторизации
const generateAuthUrl = () => {
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/gmail.send'],
    prompt: 'consent',
    include_granted_scopes: true
  });
};

// Роут для отображения URL авторизации
router.get('/google/callback', authController.handleGoogleCallback);

// Роут для обработки кода авторизации
router.get('/google/callback/auth', async (req, res) => {
  const { code, error } = req.query;

  console.log('Получен код авторизации:', code);
  console.log('Query параметры:', req.query);

  if (error) {
    console.error('Ошибка авторизации от Google:', error);
    return res.status(400).send(`Ошибка авторизации: ${error}`);
  }

  if (!code) {
    console.error('Код авторизации не получен');
    return res.status(400).send('Код авторизации не получен. Пожалуйста, попробуйте снова.');
  }

  try {
    console.log('Попытка получить токен с кодом:', code);
    const { tokens } = await oauth2Client.getToken(code);
    
    console.log('=== ПОЛУЧЕННЫЕ ТОКЕНЫ ===');
    console.log('Все токены:', JSON.stringify(tokens, null, 2));
    console.log('Access Token:', tokens.access_token);
    console.log('Refresh Token:', tokens.refresh_token);
    console.log('Scope:', tokens.scope);
    console.log('Token Type:', tokens.token_type);
    console.log('Expiry Date:', new Date(tokens.expiry_date).toLocaleString());
    console.log('========================');

    if (!tokens.refresh_token) {
      throw new Error('Refresh token не получен');
    }

    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Успешная авторизация</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
              margin: 0;
              background-color: #f5f5f5;
            }
            .container {
              text-align: center;
              padding: 20px;
              background-color: white;
              border-radius: 8px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
              max-width: 600px;
            }
            .token {
              background-color: #f8f9fa;
              padding: 15px;
              border-radius: 4px;
              word-break: break-all;
              margin: 20px 0;
              text-align: left;
              font-family: monospace;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Аутентификация успешна! 🎉</h1>
            <p>Ваш refresh token (сохраните его):</p>
            <div class="token">${tokens.refresh_token}</div>
            <p>Добавьте этот токен в .env файл как GMAIL_REFRESH_TOKEN</p>
          </div>
        </body>
      </html>
    `);
  } catch (error) {
    console.error('Ошибка при получении токена:', error);
    res.status(500).send('Ошибка аутентификации: ' + error.message);
  }
});

// Роут для политики конфиденциальности
router.get('/privacy', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Политика конфиденциальности - mailVerificationDev</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
          }
          h1 {
            color: #333;
            border-bottom: 2px solid #eee;
            padding-bottom: 10px;
          }
          h2 {
            color: #444;
            margin-top: 30px;
          }
          p {
            margin: 15px 0;
          }
        </style>
      </head>
      <body>
        <h1>Политика конфиденциальности mailVerificationDev</h1>
        
        <h2>1. Собираемые данные</h2>
        <p>Наше приложение собирает только необходимый минимум данных для отправки электронных писем через ваш Gmail аккаунт:</p>
        <ul>
          <li>Доступ к отправке email (scope: gmail.send)</li>
          <li>Refresh token для обновления доступа</li>
        </ul>

        <h2>2. Использование данных</h2>
        <p>Собранные данные используются исключительно для:</p>
        <ul>
          <li>Отправки email-сообщений от вашего имени для верификации адресов электронной почты</li>
          <li>Обновления токена доступа для поддержания работоспособности сервиса</li>
        </ul>

        <h2>3. Хранение данных</h2>
        <p>Все токены хранятся в зашифрованном виде и используются только для указанных выше целей.</p>

        <h2>4. Удаление данных</h2>
        <p>Вы можете в любой момент отозвать доступ приложения к вашему аккаунту через настройки Google Account.</p>

        <h2>5. Контакты</h2>
        <p>По всем вопросам, связанным с обработкой данных, обращайтесь по адресу: ${process.env.SUPPORT_EMAIL || '[email поддержки]'}</p>
      </body>
    </html>
  `);
});

// Роут для условий использования
router.get('/terms', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Условия использования - mailVerificationDev</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
          }
          h1 {
            color: #333;
            border-bottom: 2px solid #eee;
            padding-bottom: 10px;
          }
          h2 {
            color: #444;
            margin-top: 30px;
          }
          p {
            margin: 15px 0;
          }
        </style>
      </head>
      <body>
        <h1>Условия использования mailVerificationDev</h1>
        
        <h2>1. Принятие условий</h2>
        <p>Используя наш сервис, вы соглашаетесь с настоящими условиями использования.</p>

        <h2>2. Описание сервиса</h2>
        <p>mailVerificationDev предоставляет функционал отправки верификационных email-сообщений через ваш Gmail аккаунт.</p>

        <h2>3. Использование сервиса</h2>
        <p>Вы соглашаетесь:</p>
        <ul>
          <li>Использовать сервис только для легальных целей</li>
          <li>Не нарушать работу сервиса</li>
          <li>Не использовать сервис для спама</li>
        </ul>

        <h2>4. Ограничение ответственности</h2>
        <p>Сервис предоставляется "как есть", без каких-либо гарантий.</p>

        <h2>5. Изменение условий</h2>
        <p>Мы оставляем за собой право изменять эти условия в любое время.</p>

        <h2>6. Контакты</h2>
        <p>По всем вопросам обращайтесь: ${process.env.SUPPORT_EMAIL || '[email поддержки]'}</p>
      </body>
    </html>
  `);
});

module.exports = router; 