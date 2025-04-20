import { createSlice } from '@reduxjs/toolkit';

// Загружаем данные из localStorage при инициализации
const loadUserData = () => {
  try {
    const serializedState = localStorage.getItem('userData');
    if (serializedState === null) {
      return undefined;
    }
    return JSON.parse(serializedState);
  } catch (err) {
    return undefined;
  }
};

const initialState = {
  email: null,
  isAuthenticated: false,
  userData: loadUserData() || null,
  userId: localStorage.getItem('userId') || null
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUserEmail: (state, action) => {
      state.email = action.payload;
    },
    setIsAuthenticated: (state, action) => {
      state.isAuthenticated = action.payload;
    },
    setUserData: (state, action) => {
      state.userData = action.payload;
      // Сохраняем в localStorage при обновлении
      try {
        localStorage.setItem('userData', JSON.stringify(action.payload));
        if (action.payload._id) {
          state.userId = action.payload._id;
          localStorage.setItem('userId', action.payload._id);
        }
      } catch (err) {
        console.error('Ошибка при сохранении в localStorage:', err);
      }
    },
    clearUserData: (state) => {
      state.email = null;
      state.isAuthenticated = false;
      state.userData = null;
      state.userId = null;
      // Очищаем localStorage
      try {
        localStorage.removeItem('userData');
        localStorage.removeItem('userId');
      } catch (err) {
        console.error('Ошибка при очистке localStorage:', err);
      }
    }
  }
});

export const { setUserEmail, setIsAuthenticated, setUserData, clearUserData } = userSlice.actions;
export default userSlice.reducer; 