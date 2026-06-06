import { ships } from "@/data/mockData";
import { ShipStatusBadge } from "@/components/StatusBadges";
import { Cloud, Hourglass, AlertCircle, Sparkles } from "lucide-react";
import { useLanguageCode } from "@/i18n/useT";
import { ShipLink } from "@/components/ShipLink";

export default function Fila() {
  const language = useLanguageCode();
  const queue = ships
    .filter((s) => s.status === "anchored")
    .sort((a, b) => (a.queuePosition ?? 99) - (b.queuePosition ?? 99));

  return (
    <div className="p-6 animate-fade-in space-y-6">
      <div>
        <div className="text-[11px] font-mono uppercase tracking-[0.25em] text-primary mb-1">
          {language === "pt" ? "Fundeio · Fila" : language === "en" ? "Anchorage · Queue" : "锚地 · 队列"}
        </div>
        <h1 className="text-3xl font-bold tracking-tight">{language === "pt" ? "Fila de Espera" : language === "en" ? "Waiting Queue" : "等待队列"}</h1>
        <p className="text-sm text-muted-foreground mt-1">{language === "pt" ? "Ordem por chegada e tempo estimado de atracação." : language === "en" ? "Order by arrival and estimated berthing time." : "按到达顺序和预计靠泊时间排序。"}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-2 text-xs font-mono uppercase text-muted-foreground"><Hourglass className="h-3.5 w-3.5" /> {language === "pt" ? "Espera média" : language === "en" ? "Average wait" : "平均等待"}</div>
          <div className="text-3xl font-bold font-mono mt-2">14<span className="text-base text-muted-foreground">h 22m</span></div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-2 text-xs font-mono uppercase text-muted-foreground"><AlertCircle className="h-3.5 w-3.5" /> {language === "pt" ? "Maior espera" : language === "en" ? "Longest wait" : "最长等待"}</div>
          <div className="text-3xl font-bold font-mono mt-2 text-warning">28<span className="text-base text-muted-foreground">h</span></div>
        </div>
        <div className="rounded-xl border border-warning/40 bg-[linear-gradient(135deg,rgba(245,158,11,0.18),rgba(251,191,36,0.08))] p-5 shadow-[0_22px_40px_-28px_rgba(245,158,11,0.8)]">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs font-mono uppercase text-warning">
              <Cloud className="h-3.5 w-3.5" /> {language === "pt" ? "Impacto climático" : language === "en" ? "Weather impact" : "天气影响"}
            </div>
            <span className="inline-flex items-center gap-1 rounded-full border border-warning/40 bg-white/70 px-2.5 py-1 text-[10px] font-mono uppercase tracking-[0.18em] text-warning">
              <Sparkles className="h-3 w-3" /> {language === "pt" ? "Atenção" : language === "en" ? "Attention" : "注意"}
            </span>
          </div>
          <div className="mt-3 text-lg font-bold text-[#7a4600]">{language === "pt" ? "Redução estimada de 35%" : language === "en" ? "Estimated 35% reduction" : "预计降低 35%"}</div>
          <div className="mt-2 text-sm leading-6 text-[#7a4600]">
            {language === "pt"
              ? "Chuva forte prevista entre 16h e 20h. Priorize navios com janela crítica e prepare operação reduzida."
              : language === "en"
                ? "Heavy rain is expected between 4pm and 8pm. Prioritize vessels with critical windows and prepare for reduced operations."
                : "预计 16:00 至 20:00 有强降雨。请优先处理关键时间窗船舶，并准备降低作业能力。"}
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="p-5 border-b border-border">
          <div className="text-sm font-semibold">{language === "pt" ? "Navios fundeados — ordem de prioridade" : language === "en" ? "Anchored vessels — priority order" : "锚泊船舶 - 优先顺序"}</div>
        </div>
        <div className="divide-y divide-border">
          {queue.map((s, idx) => {
            const waitH = Math.round((Date.now() - +new Date(s.eta)) / 3600000);
            const etbH = Math.round((+new Date(s.etb) - Date.now()) / 3600000);
            return (
              <div key={s.id} className="p-5 flex items-center gap-5 hover:bg-secondary/30">
                <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-warning/20 to-warning/5 grid place-items-center font-mono text-xl font-bold text-warning border border-warning/30">
                  {idx + 1}
                </div>
                <div className="flex-1">
                  <div className="font-semibold">
                    <ShipLink shipId={s.id} className="font-semibold text-foreground no-underline hover:text-primary">
                      {s.flag} {s.name}
                    </ShipLink>
                  </div>
                  <div className="text-xs text-muted-foreground font-mono mt-0.5">IMO {s.imo} · {s.type} · {s.cargo}</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-mono uppercase text-muted-foreground">{language === "pt" ? "Aguardando" : language === "en" ? "Waiting" : "等待中"}</div>
                  <div className="font-mono text-warning font-semibold">{waitH > 0 ? `${waitH}h` : "—"}</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-mono uppercase text-muted-foreground">{language === "pt" ? "Atracação prev." : language === "en" ? "Estimated berth" : "预计靠泊"}</div>
                  <div className="font-mono">{etbH > 0 ? `+${etbH}h` : language === "pt" ? "imediato" : language === "en" ? "immediate" : "立即"}</div>
                </div>
                <ShipStatusBadge status={s.status} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
