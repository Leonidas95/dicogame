import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';
import { initReactI18next } from 'react-i18next';

i18n
	.use(Backend)
	.use(LanguageDetector)
	.use(initReactI18next)
	.init({
		fallbackLng: 'en',
		debug: false,
		interpolation: {
			escapeValue: false,
		},
		backend: {
			loadPath: `${import.meta.env.BASE_URL}locales/{{lng}}/translation.json`,
		},
	});

export default i18n;
