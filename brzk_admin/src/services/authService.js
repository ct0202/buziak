import api from './api';

const authService = {
  // Сохранение токена и данных пользователя в localStorage
  setAuthData: (data) => {
    localStorage.setItem('adminToken', data.token);
    localStorage.setItem('adminUser', JSON.stringify(data.user));
    // Устанавливаем токен в заголовок для всех последующих запросов
    api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
  },

  // Получение токена из localStorage
  getToken: () => {
    return localStorage.getItem('adminToken');
  },

  // Получение данных пользователя из localStorage
  getUser: () => {
    const userStr = localStorage.getItem('adminUser');
    return userStr ? JSON.parse(userStr) : null;
  },

  // Удаление данных аутентификации
  removeAuthData: () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    delete api.defaults.headers.common['Authorization'];
  },

  // Проверка, авторизован ли пользователь
  isAuthenticated: () => {
    return !!authService.getToken() && !!authService.getUser();
  },

  // Проверка, является ли пользователь администратором
  isAdmin: () => {
    const user = authService.getUser();
    return user?.isAdmin === true;
  },

  // Вход администратора
  login: async (email, password) => {
    try {
      const response = await api.post('/admin/login', {
        email,
        password,
      });
      
      if (response.data.token && response.data.user) {
        authService.setAuthData(response.data);
      }
      
      return response.data;
    } catch (error) {
      console.error('Ошибка при входе:', error);
      throw error;
    }
  },

  // Выход
  logout: () => {
    authService.removeAuthData();
  },
};

// Инициализация заголовка авторизации при загрузке приложения
const token = authService.getToken();
if (token) {
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

export default authService; 