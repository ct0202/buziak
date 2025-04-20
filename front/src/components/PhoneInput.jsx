import React, { useState } from 'react';
import { useTranslation } from "react-i18next";

const countries = [
  {
    code: 'PL',
    prefix: '+48',
    flag: '/icons/PolandFlagInline.png',
    mask: 'XX XXX XX XX',
    maxLength: 9
  },
  {
    code: 'DE',
    prefix: '+49',
    flag: '/icons/GermanyFlagInline.png',
    mask: 'XXX XXX XXXX',
    maxLength: 10
  },
  {
    code: 'CZ',
    prefix: '+420',
    flag: '/icons/CzechFlagInline.png',
    mask: 'XXX XXX XXX',
    maxLength: 9
  }
  // Готово к добавлению других стран
  // { code: 'RU', prefix: '+7', flag: '/assets/ru-flag.png', mask: 'XXX-XXX-XX-XX', maxLength: 10 }
];

export default function PhoneInput({ value, onChange }) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(countries[0]);

  const formatPhoneNumber = (value) => {
    // Remove all non-digit characters
    const cleaned = value.replace(/\D/g, '');
    
    // If empty, return empty
    if (cleaned.length === 0) return '';
    
    // Apply the mask: XX XXX XX XX
    let formatted = cleaned;
    if (cleaned.length >= 2) {
      formatted = cleaned.slice(0, 2) + ' ';
      if (cleaned.length >= 5) {
        formatted += cleaned.slice(2, 5) + ' ';
        if (cleaned.length >= 7) {
          formatted += cleaned.slice(5, 7) + ' ';
          if (cleaned.length >= 9) {
            formatted += cleaned.slice(7, 9);
          } else {
            formatted += cleaned.slice(7);
          }
        } else {
          formatted += cleaned.slice(5);
        }
      } else {
        formatted += cleaned.slice(2);
      }
    }
    
    return formatted;
  };

  const handlePhoneChange = (e) => {
    let value = e.target.value;
    
    // Если пользователь удаляет всё (например, через CTRL+A + Delete или зажатый Backspace)
    if (value.length === 0) {
      onChange('');
      return;
    }
    
    // Remove any non-digit characters
    value = value.replace(/\D/g, '');
    
    // Limit to max digits
    if (value.length > selectedCountry.maxLength) {
      value = value.slice(0, selectedCountry.maxLength);
    }
    
    const formattedValue = formatPhoneNumber(value);
    onChange(selectedCountry.prefix + value);
  };

  const handleCountrySelect = (country) => {
    setSelectedCountry(country);
    setIsOpen(false);
  };

  return (
    <div className="flex flex-col gap-2 mt-[0px]">
      <label className="text-[#121826] text-[14px] font-[500]">{t("signup.labels.phone")}</label>
      <div className="relative flex gap-[16px]">
        <div 
          className="relative bg-gray-100 rounded-md border-r border-gray-300 px-4 py-3 flex items-center gap-2 cursor-pointer min-w-[100px]"
          onClick={() => setIsOpen(!isOpen)}
        >
          <img src={selectedCountry.flag} alt={selectedCountry.code} className="w-5 h-4" />
          <span className="text-gray-700 text-[16px]">{selectedCountry.prefix}</span>
          <svg 
            className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
            fill="none" 
            stroke="#121826" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
          
          {/* Dropdown menu */}
          {isOpen && (
            <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg z-50">
              {countries.map((country) => (
                <div
                  key={country.code}
                  className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => handleCountrySelect(country)}
                >
                  <img src={country.flag} alt={country.code} className="w-5 h-4" />
                  <span className="text-gray-700 text-[16px]">{country.prefix}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <input
          type="text"
          value={formatPhoneNumber(value?.replace(selectedCountry.prefix, '') || '')}
          onChange={handlePhoneChange}
          placeholder={t("signup.phone")}
          className="bg-gray-100 w-rounded-md px-4 w-[214px] py-3 text-[16px] text-gray-700 flex-1"
        />
      </div>
    </div>
  );
} 