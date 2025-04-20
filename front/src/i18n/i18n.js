import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import translationPL from './locales/pl.json';
import translationEN from './locales/en.json';

i18n.use(initReactI18next).init({
  resources: {
    pl: { translation: translationPL },
    en: { translation: translationEN },
  },
  lng: 'pl', // язык по умолчанию
  fallbackLng: 'pl',
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
