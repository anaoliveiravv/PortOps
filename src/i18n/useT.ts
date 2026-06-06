import { getMessage, interpolate } from "@/i18n/messages";
import { useLanguage } from "@/store/languageStore";

export function useT() {
  const { language } = useLanguage();

  return (key: string, vars?: Record<string, string | number>) => interpolate(getMessage(language, key), vars);
}

export function useLanguageCode() {
  return useLanguage().language;
}
