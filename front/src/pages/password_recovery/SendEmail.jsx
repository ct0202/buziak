import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import { API_BASE_URL } from '../../config/api';

function SendEmail() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/api/email/send/reset-password`, {
        email: email
      });
      
      if (response.status === 200) {
        navigate('/recover/success', { state: { email } });
      }
    } catch (error) {
      console.error('Ошибка при отправке запроса:', error.response?.data || error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-[#1B1B1B] min-h-screen flex flex-col items-center px-4 py-8 text-white">
      <h1 className="text-2xl font-bold mb-[18px] w-[343px] text-left">
        {t("recover.title")}
      </h1>

      <form onSubmit={handleSubmit} className="w-full flex flex-col max-w-[343px]">
        <div className="flex flex-col gap-2 mt-[20px]">
          <label className="text-[#121826] text-[14px] font-[500]">{t("signup.labels.email")}</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t("signup.email")}
            className="bg-gray-100 rounded-[8px] px-4 py-3 text-[16px] text-gray-700"
            required
          />
        </div>

        <div
          className="text-[14px] mt-[37px] mb-[37px] text-white text-center text-[12px]"
          dangerouslySetInnerHTML={{ __html: t("recover.hint") }}
        ></div>

        <button
          type="submit"
          disabled={isLoading}
          className={`mt-4 bg-[#F7B940] text-white py-3 rounded-lg text-[14px] font-semibold ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          style={{ textShadow: "0 1px 4px 0 rgba(0, 0, 0, 0.25)" }}
        >
          {isLoading ? t("register.loading") : t("recover.submit")}
        </button>

      </form>
    </div>
  );
}

export default SendEmail;
