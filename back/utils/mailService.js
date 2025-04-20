const { google } = require('googleapis');
const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs');

// Подгружаем credentials
const CREDENTIALS = JSON.parse(fs.readFileSync(path.join(__dirname, 'credentials.json')));
const { client_id, client_secret, redirect_uris } = CREDENTIALS.installed;

const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

// Вставь токены сюда (можно реализовать refresh при необходимости)
oAuth2Client.setCredentials({
  refresh_token: 'ВАШ_REFRESH_TOKEN'
});

async function sendConfirmationEmail(toEmail, code) {
  const accessToken = await oAuth2Client.getAccessToken();

  const transport = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      type: 'OAuth2',
      user: 'siberianlongdeer@gmail.com',
      clientId: client_id,
      clientSecret: client_secret,
    //   refreshToken: 'ВАШ_REFRESH_TOKEN',
      accessToken: accessToken.token,
    },
  });

  const mailOptions = {
    from: 'Your App <your-email@gmail.com>',
    to: toEmail,
    subject: 'Подтверждение почты',
    text: `Ваш код подтверждения: ${code}`,
    html: `<p>Ваш код подтверждения: <b>${code}</b></p>`,
  };

  const result = await transport.sendMail(mailOptions);
  return result;
}

module.exports = { sendConfirmationEmail };
