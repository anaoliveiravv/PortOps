import { ships } from "@/data/mockData";
import { ShipStatusBadge } from "@/components/StatusBadges";
import { Cloud, Hourglass, AlertCircle, Sparkles } from "lucide-react";
import { useLanguageCode } from "@/i18n/useT";
import { ShipLink } from "@/components/ShipLink";
import { SummaryMetricCard, SummaryMetricsPanel } from "@/components/SummaryMetrics";

export default function Fila() {
  const language = useLanguageCode();
  const queue = ships
    .filter((s) => s.status === "anchored")
    .sort((a, b) => (a.queuePosition ?? 99) - (b.queuePosition ?? 99));

  return (
    <div className="mx-auto max-w-[1440px] p-5 lg:p-6 animate-fade-in space-y-5">
      <div>
        <div className="text-[11px] font-mono uppercase tracking-[0.25em] text-primary mb-1">
          {language === "pt" ? "Fundeio · Fila" : language === "en" ? "Anchorage · Queue" : "锚地 · 队列"}
        </div>
        <h1 className="text-2xl font-bold tracking-tight">{language === "pt" ? "Fila de Espera" : language === "en" ? "Waiting Queue" : "等待队列"}</h1>
        <p className="text-sm text-muted-foreground mt-0.5">{language === "pt" ? "Ordem por chegada e tempo estimado de atracação." : language === "en" ? "Order by arrival and estimated berthing time." : "按到达顺序和预计靠泊时间排序。"}</p>
      </div>

      <SummaryMetricsPanel gridClassName="grid grid-cols-1 gap-3 lg:grid-cols-3">
        <SummaryMetricCard>
          <div className="flex items-center gap-2 text-[11px] font-mono uppercase text-foreground"><Hourglass className="h-3.5 w-3.5" /> {language === "pt" ? "Espera média" : language === "en" ? "Average wait" : "平均等待"}</div>
          <div className="text-2xl font-bold font-mono mt-1.5 text-[#102a4c]">14<span className="text-sm text-muted-foreground">h 22m</span></div>
        </SummaryMetricCard>
        <SummaryMetricCard>
          <div className="flex items-center gap-2 text-[11px] font-mono uppercase text-foreground"><AlertCircle className="h-3.5 w-3.5" /> {language === "pt" ? "Maior espera" : language === "en" ? "Longest wait" : "最长等待"}</div>
          <div className="text-2xl font-bold font-mono mt-1.5 text-[#102a4c]">28<span className="text-sm text-muted-foreground">h</span></div>
        </SummaryMetricCard>
        <SummaryMetricCard className="overflow-hidden border-[#d5e2f1] bg-white/80">
          <div className="pointer-events-none absolute inset-y-0 left-0 w-1.5 rounded-l-[1.25rem] bg-[#64748b]" />
          <div className="pointer-events-none absolute right-0 top-0 h-16 w-24 rounded-bl-full bg-slate-200/45" />
          <div className="relative flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 text-xs font-mono uppercase tracking-[0.14em] text-foreground">
              <span className="grid h-8 w-8 place-items-center rounded-full border border-slate-200 bg-white/80 text-foreground">
                <Cloud className="h-4 w-4" />
              </span>
              {language === "pt" ? "Impacto climático" : language === "en" ? "Weather impact" : "天气影响"}
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white/85 px-2.5 py-1 text-[10px] font-mono uppercase tracking-[0.18em] text-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-slate-500" />
              <Sparkles className="h-3 w-3" /> {language === "pt" ? "Atenção" : language === "en" ? "Attention" : "注意"}
            </span>
          </div>
          <div className="relative mt-2 text-base font-bold text-[#102a4c]">{language === "pt" ? "Redução estimada de 35%" : language === "en" ? "Estimated 35% reduction" : "预计降低 35%"}</div>
          <div className="relative mt-1.5 text-sm leading-5 text-[#405672]">
            {language === "pt"
              ? "Chuva forte prevista entre 16h e 20h. Priorize navios com janela crítica e prepare operação reduzida."
              : language === "en"
                ? "Heavy rain is expected between 4pm and 8pm. Prioritize vessels with critical windows and prepare for reduced operations."
                : "预计 16:00 至 20:00 有强降雨。请优先处理关键时间窗船舶，并准备降低作业能力。"}
          </div>
        </SummaryMetricCard>
      </SummaryMetricsPanel>

      <div className="premium-panel overflow-hidden">
        <div className="p-4 border-b border-border">
          <div className="text-sm font-semibold">{language === "pt" ? "Navios fundeados — ordem de prioridade" : language === "en" ? "Anchored vessels — priority order" : "锚泊船舶 - 优先顺序"}</div>
        </div>
        <div className="divide-y divide-border">
          {queue.map((s, idx) => {
            const waitH = Math.round((Date.now() - +new Date(s.eta)) / 3600000);
            const etbH = Math.round((+new Date(s.etb) - Date.now()) / 3600000);
            return (
              <div key={s.id} className="p-4 flex items-center gap-4 hover:bg-secondary/30">
                <div className="h-10 w-10 rounded-lg bg-slate-100 grid place-items-center font-mono text-lg font-bold text-slate-700 border border-slate-200">
                  {idx + 1}
                </div>
                <div className="flex-1">
                  <div className="font-semibold">
                    <ShipLink shipId={s.id} className="font-semibold text-foreground no-underline hover:text-primary">
                      {s.flag} {s.name}
                    </ShipLink>
                  </div>
                  <div className="text-[11px] text-muted-foreground font-mono mt-0.5">IMO {s.imo} · {s.type} · {s.cargo}</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-mono uppercase text-muted-foreground">{language === "pt" ? "Aguardando" : language === "en" ? "Waiting" : "等待中"}</div>
                  <div className="font-mono font-semibold text-slate-700">{waitH > 0 ? `${waitH}h` : "—"}</div>
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
