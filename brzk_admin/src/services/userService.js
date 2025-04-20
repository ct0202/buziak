import api from './api';

const userService = {
  // Получение списка пользователей для верификации
  getVerificationUsers: async (page = 1, limit = 10) => {
    try {
      const response = await api.get('/admin/users/verification', {
        params: {
          page,
          limit,
        },
      });
      return {
        data: response.data,
        total: response.data.length, // Временное решение, пока нет пагинации на бэкенде
      };
    } catch (error) {
      console.error('Ошибка при получении пользователей:', error);
      throw error;
    }
  },

  // Одобрение верификации пользователя
  approveVerification: async (userId) => {
    try {
      const response = await api.post(`/admin/users/${userId}/verify`, {
        verified: true,
      });
      return response.data;
    } catch (error) {
      console.error('Ошибка при одобрении верификации:', error);
      throw error;
    }
  },

  // Отклонение верификации пользователя
  rejectVerification: async (userId) => {
    try {
      const response = await api.post(`/admin/users/${userId}/verify`, {
        verified: false,
      });
      return response.data;
    } catch (error) {
      console.error('Ошибка при отклонении верификации:', error);
      throw error;
    }
  },

  // Получение детальной информации о пользователе
  getUserDetails: async (userId) => {
    try {
      const response = await api.get(`/admin/users/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Ошибка при получении информации о пользователе:', error);
      throw error;
    }
  },
};

export default userService; 