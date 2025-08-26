import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

// Import all namespaces
import enCommon from "./locales/en/common.json";
import enAuth from "./locales/en/auth.json";
import enNavigation from "./locales/en/navigation.json";
import enFooter from "./locales/en/footer.json";
import enHome from "./locales/en/home.json";
import enContact from "./locales/en/contact.json";
import enNotFound from "./locales/en/notFound.json";
import enCreateParcel from "./locales/en/createParcel.json"; // Add this line

import bnCommon from "./locales/bn/common.json";
import bnAuth from "./locales/bn/auth.json";
import bnNavigation from "./locales/bn/navigation.json";
import bnFooter from "./locales/bn/footer.json";
import bnHome from "./locales/bn/home.json";
import bnContact from "./locales/bn/contact.json";
import bnNotFound from "./locales/bn/notFound.json";
import bnCreateParcel from "./locales/bn/createParcel.json"; // Add this line

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        common: enCommon,
        auth: enAuth,
        navigation: enNavigation,
        footer: enFooter,
        home: enHome,
        contact: enContact,
        notFound: enNotFound,
        createParcel: enCreateParcel, // Add this line
      },
      bn: {
        common: bnCommon,
        auth: bnAuth,
        navigation: bnNavigation,
        footer: bnFooter,
        home: bnHome,
        contact: bnContact,
        notFound: bnNotFound,
        createParcel: bnCreateParcel, // Add this line
      },
    },
    fallbackLng: "en",
    defaultNS: "common",
    debug: false,
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
