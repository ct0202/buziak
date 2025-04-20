import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import { API_BASE_URL } from '../../config/api';

function RecoverSuccess() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
   

  };

  return (
    <div className="bg-[#1B1B1B] min-h-screen flex flex-col items-center px-4 py-8 text-white">
      <h1 className="text-2xl font-bold mb-[18px] w-[343px] text-left">
        {t("recover.title")}
      </h1>

      <form onSubmit={handleSubmit} className="w-full flex flex-col max-w-[343px]">
        <div
          className="text-[14px] mt-[70px] mb-[37px] text-white text-center text-[12px]"
          dangerouslySetInnerHTML={{ __html: t("recover.success_hint") }}
        ></div>

        <button
          type="submit"
          disabled={isLoading}
          onClick={() => navigate('/signin')}
          className={`mt-4 bg-[#F7B940] text-white py-3 rounded-lg text-[14px] font-semibold ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          style={{ textShadow: "0 1px 4px 0 rgba(0, 0, 0, 0.25)" }}
        >
          {isLoading ? t("register.loading") : t("signin.submit")}
        </button>

      </form>
    </div>
  );
}

export default RecoverSuccess;
