import { s3, BUCKET_NAME } from '../config/aws.js';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';

const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    }
});

// Генерация пресайн URL для загрузки файла
export const generateUploadURL = async (fileName, contentType) => {
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
export const generateGetURL = async (key) => {
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
export const deleteFile = async (key) => {
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