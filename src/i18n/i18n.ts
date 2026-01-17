import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './en.json';
import hi from './hi.json';
import as from './as.json';
import bn from './bn.json';
import mni from './mni.json';

i18n.use(initReactI18next).init({
  compatibilityJSON: 'v3',
  lng: 'en',
  fallbackLng: 'en',
  resources: {
    en: { translation: en },
    hi: { translation: hi },
    as: { translation: as },
    bn: { translation: bn },
    mni: { translation: mni }
  },
  interpolation: { escapeValue: false }
});

export default i18n;
