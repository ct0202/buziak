import { useTranslation, Trans } from "react-i18next";
import { useFakeOnline } from "../hooks/useFakeOnline";
import { useNavigate } from "react-router-dom";
const Register = () => {
  const { t, i18n } = useTranslation();
  const tr = t("register", { returnObjects: true });
  const online = useFakeOnline();

  const navigate = useNavigate()
  return (
    <div
      className="w-full h-screen bg-cover bg-center text-white relative overflow-hidden flex flex-col justify-start"
      style={{
        backgroundImage: 'url("/backgrounds/register.png"), url("/backgrounds/home.png")',
      }}
    >

      {/* Верхний логотип и онлайн статус */}
      <div className="text-center mt-2 z-10 flex flex-col justify-center items-center">
        <img
          src="/assets/logo.png"
          alt="Logo"
          className="mx-auto w-60 drop-shadow-md"
        />
        <img 
          src="/assets/mockup.png" 
          className="w-full max-w-[390px] h-auto sm:max-w-[390px] max-h-[calc(100vh-400px)] object-contain" 
          alt="mockup" 
        />
        <p className="text-[#90FFAD] text-sm mt-4 text-[11px]">
          • {t("register.online")} {online}
        </p>
      </div>

      {/* Описание */}
      <div className="px-2 text-white/90 leading-relaxed text-center z-10 text-[12px]">
        <Trans
          i18nKey="register.description"
          components={{ strong: <strong className="font-semibold" /> }}
        />
      </div>

      {/* Кнопки */}
      <div className="mt-6 px-6 mb-10 flex flex-col gap-4 z-10">
        <button className="bg-[#F7B93F] text-white font-medium py-3 rounded-md shadow" onClick={() => navigate('/signup')}>
          {tr.button_start}
        </button>
        <button className="bg-[#BC8D32] text-white font-medium py-3 rounded-md shadow" onClick={() => navigate('/signin')}>
          {tr.button_login}
        </button>
      </div>
    </div>
  );
};

export default Register;
