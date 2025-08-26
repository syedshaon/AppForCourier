import { useTranslation } from "react-i18next";
import { useCallback, useMemo } from "react";

interface LanguageOption {
  code: string;
  label: string;
  nativeLabel: string;
}

const LANGUAGE_OPTIONS: LanguageOption[] = [
  { code: "en", label: "EN", nativeLabel: "English" },
  { code: "bn", label: "বাংলা", nativeLabel: "Bengali" },
] as const;

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const currentLanguage = i18n.language;

  const changeLanguage = useCallback(
    (lng: string) => {
      i18n.changeLanguage(lng);
    },
    [i18n]
  );

  const buttonClass = useMemo(() => (isActive: boolean) => `px-3 py-1 rounded transition-all duration-200 ease-in-out font-medium text-sm min-w-[48px] ${isActive ? "bg-blue-500 text-white shadow-md" : "bg-gray-200 text-gray-700 hover:bg-gray-300 hover:text-gray-900"}`, []);

  return (
    <div className="flex gap-1 p-1 bg-gray-100 rounded-lg">
      {LANGUAGE_OPTIONS.map(({ code, label }) => {
        const isActive = currentLanguage === code;
        return (
          <button key={code} onClick={() => changeLanguage(code)} className={buttonClass(isActive)} title={`Switch to ${LANGUAGE_OPTIONS.find((l) => l.code === code)?.nativeLabel}`} aria-label={`Change language to ${code.toUpperCase()}`} aria-pressed={isActive}>
            {label}
          </button>
        );
      })}
    </div>
  );
};

export default LanguageSwitcher;
