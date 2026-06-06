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
    <div className={cn("inline-flex items-center gap-1 rounded-full border border-[#b9d2ef] bg-white/90 p-1 shadow-[0_14px_30px_-24px_rgba(13,63,126,0.55)] backdrop-blur", className)}>
      {OPTIONS.map((option) => {
        const active = language === option.code;
        return (
          <button
            key={option.code}
            type="button"
            onClick={() => setLanguage(option.code)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[11px] font-semibold transition-all duration-200 active:scale-[0.98]",
              active ? "bg-[#0759ce] text-white blue-glow" : "text-[#53687f] hover:bg-[#eef6ff] hover:text-[#183153]",
            )}
            title={option.label}
          >
            <span className="text-[0.78rem] leading-none">{option.flag}</span>
            <span className="font-mono uppercase tracking-[0.14em]">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
