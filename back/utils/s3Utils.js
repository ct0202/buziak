const { s3, BUCKET_NAME } = require('../config/aws');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { S3Client, PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');

const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    }
});

// Генерация пресайн URL для загрузки файла
const generateUploadURL = async (fileName, contentType) => {
    const params = {
        Bucket: BUCKET_NAME,
        Key: `photos/${fileName}`,
        ContentType: contentType
    };

    try {
        const command = new PutObjectCommand(params);
        const uploadURL = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
        return {
            uploadURL,
            key: `photos/${fileName}`
        };
    } catch (error) {
        console.error('Ошибка при генерации URL для загрузки:', error);
        throw error;
    }
};

// Генерация пресайн URL для получения файла
const generateGetURL = async (key) => {
    const params = {
        Bucket: BUCKET_NAME,
        Key: key
    };

    try {
        const command = new GetObjectCommand(params);
        const getURL = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
        return getURL;
    } catch (error) {
        console.error('Ошибка при генерации URL для получения:', error);
        throw error;
    }
};

// Удаление файла из S3
const deleteFile = async (key) => {
    const params = {
        Bucket: BUCKET_NAME,
        Key: key
    };

    try {
        await s3.deleteObject(params).promise();
    } catch (error) {
        console.error('Ошибка при удалении файла:', error);
        throw error;
    }
};

module.exports = {
    generateUploadURL,
    generateGetURL,
    deleteFile
}; 