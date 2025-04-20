import { useTranslation } from "react-i18next";

export default function GenderToggle({ value, onChange }) {
  const { t } = useTranslation();

  return (
    <div className="w-[343px] h-[38px] bg-[#141522] rounded-[16px] flex justify-between p-1 transition-all duration-300 mt-4">
      <button
        type="button"
        onClick={() => onChange("male")}
        className={`w-1/2 h-full rounded-[16px] text-sm font-semibold transition-all duration-300 ${
          value === "male" ? "bg-[#5E6CFA] text-white" : "text-white"
        }`}
      >
        {t("signup.man")}
      </button>
      <button
        type="button"
        onClick={() => onChange("female")}
        className={`w-1/2 h-full rounded-[16px] text-sm font-semibold transition-all duration-300 ${
          value === "female" ? "bg-[#F26DB0] text-white" : "text-white"
        }`}
      >
        {t("signup.girl")}
      </button>
    </div>
  );
}
