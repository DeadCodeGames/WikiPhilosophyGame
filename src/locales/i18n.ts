import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './en.json';
import sk from './sk.json';

const resources = {
  en: { translation: en },
  sk: { translation: sk },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en', // Default language
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // React handles escaping
    },
  });

export default i18n;
