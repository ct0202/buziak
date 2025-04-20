import axios from 'axios';

const api = axios.create({
  // baseURL: 'http://localhost:5002/api/admin',
  baseURL: 'https://api.buziak.online/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Добавляем интерсептор для обработки ошибок
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Ошибка с ответом от сервера
      console.error('Ошибка API:', error.response.data);
    } else if (error.request) {
      // Ошибка без ответа от сервера
      console.error('Ошибка сети:', error.request);
    } else {
      // Ошибка при настройке запроса
      console.error('Ошибка:', error.message);
    }
    return Promise.reject(error);
  }
);

export default api; 