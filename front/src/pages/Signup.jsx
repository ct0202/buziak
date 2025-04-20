import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import GenderToggle from "../components/GenderToggle";
import PasswordInput from "../components/PasswordInput";
import PhoneInput from "../components/PhoneInput";
import { useNavigate } from "react-router-dom";
import { useDispatch } from 'react-redux';
import { setUserEmail } from '../redux/slices/userSlice';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';

function Signup() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    gender: 'male'
  });
  
  const [isPolicyAccepted, setIsPolicyAccepted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [phoneError, setPhoneError] = useState("");
  const [emailError, setEmailError] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Сбрасываем ошибки при изменении полей
    if (name === 'phone') setPhoneError("");
    if (name === 'email') setEmailError("");
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
    if (!isPolicyAccepted) return;

    setIsLoading(true);
    setPhoneError("");
    setEmailError("");

    try {
      const response = await axios.post(`${API_BASE_URL}/api/users/register`, {
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        password: formData.password,
        gender: formData.gender
      });

      if (response.status === 200 || response.status === 201) {
        dispatch(setUserEmail(formData.email));
        try {
          await axios.post(`${API_BASE_URL}/api/email/send/code`, {
            email: formData.email
          });
          navigate('/email_confirm');
        } catch (codeError) {
          setEmailError('Ошибка при отправке кода подтверждения');
        }
      }
    } catch (error) {
      if (error.response?.data?.message === 'Phone already registered') {
        setPhoneError("Номер уже зарегистрирован");
      } else if (error.response?.data?.message === 'Email already registered') {
        setEmailError("Email уже зарегистрирован");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-[#1B1B1B] min-h-screen flex flex-col items-center px-4 py-8 text-white">
      <h1 className="text-2xl font-bold mb-[18px] w-[343px] text-left">
        {t("signup.title")}
      </h1>

      <form onSubmit={handleSubmit} className="w-full flex flex-col max-w-[343px]">
        <div className="flex flex-col gap-1">
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder={t("signup.name")}
            className="bg-gray-100 rounded-md px-4 py-3 text-[16px] text-gray-700"
            required
          />
        </div>

        <div className="relative">
          <PhoneInput 
            value={formData.phone}
            onChange={(value) => {
              setFormData(prev => ({ ...prev, phone: value }));
              setPhoneError("");
            }}
          />
          {phoneError && (
            <div className="absolute -bottom-6 left-0 text-[#FF3B30] text-[12px]">
              {phoneError}
            </div>
          )}
        </div>

        <div className="relative flex flex-col gap-2 mt-[0px]">
          <label className="text-[#121826] text-[14px] font-[500]">{t("signup.labels.email")}</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder={t("signup.email")}
            className="bg-gray-100 rounded-md px-4 py-3 text-[16px] text-gray-700"
            required
          />
          {emailError && (
            <div className="absolute -bottom-6 left-0 text-[#FF3B30] text-[12px]">
              {emailError}
            </div>
          )}
        </div>

        <PasswordInput 
          value={formData.password}
          onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
        />

        <GenderToggle 
          value={formData.gender}
          onChange={(gender) => setFormData(prev => ({ ...prev, gender }))}
        />

        <div className="flex items-center gap-2 text-xs mt-4">
          <input
            type="checkbox"
            checked={isPolicyAccepted}
            onChange={(e) => setIsPolicyAccepted(e.target.checked)}
            className="w-[24px] h-[24px] shrink-0 mt-0.5 text-[16px] rounded-[5px]"
            required
          />
          <div
            onClick={() => navigate("/policy")}
            className="text-white leading-snug"
            dangerouslySetInnerHTML={{ __html: t("signup.policy") }}
          ></div>
        </div>

        <button
          type="submit"
          disabled={!isPolicyAccepted || isLoading}
          className={`mt-4 bg-[#F7B940] text-white py-3 rounded-lg text-[14px] font-semibold ${!isPolicyAccepted ? 'opacity-50 cursor-not-allowed' : ''}`}
          style={{ textShadow: "0 1px 4px 0 rgba(0, 0, 0, 0.25)" }}
        >
          {isLoading ? t("register.loading") : t("register.button_start")}
        </button>

        <div className="mt-6 flex justify-center">
          <img onClick={handleGoogleAuth} src="/icons/google.svg" alt="Google" />
        </div>

        <div
          onClick={() => navigate("/signin")}
          className="text-[14px] text-white w-[100%] text-center mt-[18px]"
          dangerouslySetInnerHTML={{ __html: t("signup.have_account") }}
        ></div>
      </form>
    </div>
  );
}

export default Signup;
