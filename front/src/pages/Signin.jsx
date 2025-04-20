import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import PasswordInput from "../components/PasswordInput";
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import { API_BASE_URL } from '../config/api';
import { useDispatch } from 'react-redux';
import { setUserEmail, setIsAuthenticated, setUserData } from '../redux/slices/userSlice';

function Signin() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleGoogleAuth = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/google`);
      const { authUrl } = await response.json();
      window.location.href = authUrl;
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await axios.post(`${API_BASE_URL}/api/users/login`, {
        email: formData.email,
        password: formData.password
      });
      
      if (response.status === 200) {
        const { token, user } = response.data;
        dispatch(setUserEmail(user.email));
        dispatch(setIsAuthenticated(true));
        dispatch(setUserData(user));
        
        if (rememberMe && token) {
          localStorage.setItem('token', token);
        }
        
        // Отправляем запрос на получение кода подтверждения
        try {
          await axios.post(`${API_BASE_URL}/api/email/send/code`, {
            email: formData.email
          });
          navigate('/email_confirm');
        } catch (codeError) {
          console.error('Ошибка при отправке кода:', codeError.response?.data || codeError.message);
        }
      }
    } catch (error) {
      console.error('Ошибка при входе:', error.response?.data || error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-[#1B1B1B] min-h-screen flex flex-col items-center px-4 py-8 text-white">
      <h1 className="text-2xl font-bold mb-[18px] w-[343px] text-left">
        {t("signin.title")}
      </h1>

      <form onSubmit={handleSubmit} className="w-full flex flex-col max-w-[343px]">
        <div className="flex flex-col gap-2 mt-[20px]">
          <label className="text-[#121826] text-[14px] font-[500]">{t("signup.labels.email")}</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder={t("signup.email")}
            className="bg-gray-100 rounded-[8px] px-4 py-3 text-[16px] text-gray-700"
            required
          />
        </div>

        <PasswordInput 
          value={formData.password}
          onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
        />

        <div className="flex items-center gap-2 text-xs mt-4">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="w-6 h-6 shrink-0 mt-0.5 text-[16px]"
          />
          <div
            className="text-white leading-snug"
            dangerouslySetInnerHTML={{ __html: t("signin.remember_me") }}
          ></div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={`mt-4 bg-[#F7B940] text-white py-3 rounded-lg text-[14px] font-semibold ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          style={{ textShadow: "0 1px 4px 0 rgba(0, 0, 0, 0.25)" }}
        >
          {isLoading ? t("register.loading") : t("register.button_login")}
        </button>

        <div className="mt-6 flex justify-center">
          <img onClick={handleGoogleAuth} src="/icons/google.svg" alt="Google" />
        </div>

        <div className="flex justify-center items-center flex-row absolute w-[343px] bottom-[79px]">
          <span className="text-[14px] text-white mr-[3px]">{t("signin.no_account")}</span>
          <div
            onClick={() => navigate("/signup")}
            className="text-[14px] text-[#006ae5] text-center cursor-pointer"
            dangerouslySetInnerHTML={{ __html: t("signin.dont_have_account") }}
          ></div>
        </div>

        <div 
          className="w-[100%] text-center mt-[16px] font-[400] text-[#006AE5] cursor-pointer" 
          onClick={() => navigate("/recover")}
        >
          {t("signin.having_troubles")}
        </div>
      </form>
    </div>
  );
}

export default Signin;
