import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import Cookie from 'js-cookie';

import enTranslations from './locales/en/translations.json';
import taTranslations from './locales/ta/translations.json';
import hiTranslations from './locales/hi/translations.json';

const resources = {
  en: { translation: enTranslations },
  ta: { translation: taTranslations },
  hi: { translation: hiTranslations },
};

const savedLanguage = Cookie.get('language') || 'en';

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: savedLanguage,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

i18n.on('languageChanged', (lng) => {
  Cookie.set('language', lng);
});

export default i18n;