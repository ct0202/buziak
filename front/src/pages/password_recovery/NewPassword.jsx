import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import PasswordInput from "../../components/PasswordInput";
import { useNavigate } from "react-router-dom";
import { useSearchParams } from 'react-router-dom';
import { API_BASE_URL } from '../../config/api';

function NewPassword() {
  const { t, i18n } = useTranslation();

  const navigate = useNavigate();

  const [searchParams] = useSearchParams();
  const [isValid, setIsValid] = useState(false);
  const [loading, setLoading] = useState(true);
  const token = searchParams.get('token');
  const [password, setPassword] = useState('');
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    try {
      const response = await fetch(`${API_BASE_URL}/api/email/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          newPassword: password
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Ошибка при сбросе пароля');
      }

      setSuccess(true);
      setTimeout(() => {
        navigate('/signin');
      }, 2000);
    } catch (error) {
      setError(error.message);
    }
  };

  useEffect(() => {
    const checkToken = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/email/verify-reset-token/${token}`);
        const data = await response.json();
        setIsValid(data.isValid);
      } catch (error) {
        console.error('Ошибка проверки токена:', error);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      checkToken();
    }
  }, [token]);

  if (loading) {
    return <div>Проверка токена...</div>;
  }

  if (!isValid) {
    return <div>Токен недействителен или истек</div>;
  }

  return (
    <div className="bg-[#1B1B1B] min-h-screen flex flex-col items-center px-4 py-8 text-white">
      <h1 className="text-2xl font-bold mb-[18px] w-[343px] text-left">
        {t("recover.title")}
      </h1>

      {error && (
        <div className="w-full max-w-[343px] mb-4 p-3 bg-red-500 text-white rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="w-full flex flex-col max-w-[343px]">
        <div className="flex flex-col gap-2 mt-[20px]">
          <label className="text-[#121826] text-[14px] font-[500]">
            {t("signup.labels.password")}
          </label>
          <PasswordInput 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button
          type="submit"
          className="mt-4 bg-[#F7B940] text-white py-3 rounded-lg text-[14px] font-semibold"
          style={{ textShadow: "0 1px 4px 0 rgba(0, 0, 0, 0.25)" }}
        >
          {t("recover.reset_password")}
        </button>

        <div className="mt-6 flex justify-center">
          <img src="/icons/google.svg" alt="Google" />
        </div>

        <div className="mt-4 flex gap-2 justify-center">
          <button onClick={() => i18n.changeLanguage("en")}>EN</button>
          <button onClick={() => i18n.changeLanguage("pl")}>PL</button>
        </div>
      </form>
    </div>
  );
}

export default NewPassword;
