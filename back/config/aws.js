const AWS = require('aws-sdk');

// Конфигурация AWS
AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
});

// Создаем экземпляр S3
const s3 = new AWS.S3();

// Название бакета
const BUCKET_NAME = process.env.AWS_S3_BUCKET;

module.exports = {
    s3,
    BUCKET_NAME
}; 