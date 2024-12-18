import i18n from 'i18next';
import { initReactI18next } from 'react-i18next'

import en from './en.json';
import sk from './sk.json';
import cs from './cs.json';
import ja from './ja.json';
import zh from './zh.json';

const resources = {
  en: { translation: en },
  sk: { translation: sk },
  cs: { translation: cs },
  ja: { translation: ja },
  zh: { translation: zh },
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

i18n.on("languageChanged", (lang) => document.documentElement.lang = lang)

export default i18n;