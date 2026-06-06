import { cn } from "@/lib/utils";
import { useLanguage, type LanguageCode } from "@/store/languageStore";

const OPTIONS: Array<{ code: LanguageCode; flag: string; label: string }> = [
  { code: "pt", flag: "🇧🇷", label: "PT" },
  { code: "en", flag: "🇺🇸", label: "EN" },
  { code: "zh", flag: "🇨🇳", label: "中文" },
];

export function LanguageSelector({ className }: { className?: string }) {
  const { language, setLanguage } = useLanguage();

  return (
    <div className={cn("inline-flex items-center gap-1 rounded-full border border-border bg-white/90 p-1 shadow-sm backdrop-blur", className)}>
      {OPTIONS.map((option) => {
        const active = language === option.code;
        return (
          <button
            key={option.code}
            type="button"
            onClick={() => setLanguage(option.code)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold transition-colors",
              active ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-secondary hover:text-foreground",
            )}
            title={option.label}
          >
            <span>{option.flag}</span>
            <span className="font-mono uppercase tracking-[0.18em]">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
