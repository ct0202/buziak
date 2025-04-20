import { useState } from "react";
import { useTranslation } from "react-i18next";

export default function PasswordInput({ value, onChange }) {
  const [showPassword, setShowPassword] = useState(false);
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-2 mt-[0px]">
      <label className="text-[#121826] text-[14px] font-[500]">{t("signup.labels.password")}</label>
      <div className="bg-gray-100 rounded-[8px] px-4 py-3 flex items-center justify-between">
        <input
          type={showPassword ? "text" : "password"}
          value={value}
          onChange={onChange}
          placeholder={t("signup.password")}
          className="bg-transparent outline-none text-[16px] text-gray-700 w-full"
          required
        />
        <img
          src={showPassword ? "/icons/Hide2.svg" : "/icons/Hide.svg"}
          alt="toggle visibility"
          className="w-5 h-5 cursor-pointer"
          onClick={() => setShowPassword(!showPassword)}
        />
      </div>
    </div>
  );
}
