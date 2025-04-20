import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import MainLayout from './components/layout/MainLayout';
import Verification from './pages/Verification';
import Login from './pages/Login';
import authService from './services/authService';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

// Компонент для защищенных маршрутов
const ProtectedRoute = ({ children }) => {
  if (!authService.isAuthenticated() || !authService.isAdmin()) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Verification />
                </MainLayout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
