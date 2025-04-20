import React, { useEffect, useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import GenderToggle from "../components/GenderToggle";
import PasswordInput from "../components/PasswordInput";
import PhoneInput from "../components/PhoneInput";
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import { useSelector } from 'react-redux';
import { API_BASE_URL } from '../config/api';

function EmailConfirm() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [code, setCode] = useState(['', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const inputRefs = [useRef(), useRef(), useRef(), useRef()];
  const email = useSelector(state => state.user.email);

  // Если email не найден в Redux, перенаправляем на страницу входы
  useEffect(() => {
    if (!email) {
      navigate('/signin');
    }
  }, [email, navigate]);

  const handleChange = (index, value) => {
    if (value.length > 1) {
      value = value[value.length - 1];
    }

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Автоматический переход к следующему полю
    if (value !== '' && index < 3) {
      inputRefs[index + 1].current.focus();
    }
  };

  const handleSubmitCode = async () => {
    const fullCode = code.join('');
    if (fullCode.length !== 4) return;

    setIsLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/api/email/verify-code`, {
        email,
        code: fullCode
      });

      if (response.status === 200) {
        // После успешной верификации перенаправляем пользователя
        navigate('/profile');
      }
    } catch (error) {
      console.error('Ошибка при верификации кода:', error.response?.data || error.message);
      // Очищаем поля при ошибке
      setCode(['', '', '', '']);
      inputRefs[0].current.focus();
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (index, e) => {
    // Обработка удаления
    if (e.key === 'Backspace' && code[index] === '' && index > 0) {
      inputRefs[index - 1].current.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 4);
    const newCode = [...code];
    
    for (let i = 0; i < pastedData.length; i++) {
      if (i < 4) {
        newCode[i] = pastedData[i];
      }
    }
    
    setCode(newCode);
    
    // Если вставлен полный код, отправляем его
    if (pastedData.length === 4) {
      handleSubmitCode(pastedData);
    } else {
      // Фокус на последнем заполненном поле или первом пустом
      const lastIndex = Math.min(pastedData.length, 4) - 1;
      if (lastIndex >= 0) {
        inputRefs[lastIndex].current.focus();
      }
    }
  };

  return (
    <div className="bg-[#1B1B1B] pt-[72px] min-h-screen flex flex-col items-center px-4 py-8 text-white">
      <div className="w-full flex justify-center items-center relative">
        <h1 className="text-2xl font-bold w-[343px] text-center">
          {t("email_confirm.title")}
        </h1>
        <object data="/icons/back-arrow.svg" type="image/svg+xml" className="absolute left-[24px] cursor-pointer" onClick={() => navigate(-1)}></object>
      </div>
      <div className="w-full max-w-[343px] flex flex-col items-center mt-8">
        <p className="text-center mb-4">{t("email_confirm.text1")}</p>
        <p className="text-center mb-8 text-[#21897E] font-bold">{email}</p>
        <div className="flex gap-4 justify-center mb-8">
          {code.map((digit, index) => (
            <input
              key={index}
              ref={inputRefs[index]}
              type="text"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={handlePaste}
              className="w-[64px] h-[64px] border-b border-white outline-none bg-transparent text-center text-[24px] text-white font-bold"
              disabled={isLoading}
            />
          ))}
        </div>
        <p className="text-center">{t("email_confirm.text2")}</p>
      </div>
      <button 
        onClick={handleSubmitCode}
        disabled={isLoading || code.join('').length !== 4}
        className={`w-full fixed bottom-[24px] max-w-[343px] h-[56px] bg-[#1B1725] text-white font-bold text-[18px] rounded-[400px] ${(isLoading || code.join('').length !== 4) ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {isLoading ? t("register.loading") : t("email_confirm.submit")}
      </button>
    </div>
  );
}

export default EmailConfirm;
