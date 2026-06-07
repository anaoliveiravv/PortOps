import { Link } from "react-router-dom";
import { alerts, ships } from "@/data/mockData";
import { AlertTriangle, Info, AlertOctagon, Bell, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguageCode } from "@/i18n/useT";
import { ShipLink } from "@/components/ShipLink";
import { getShipRisksHref } from "@/lib/shipLinks";
import { SummaryMetricCard, SummaryMetricsPanel } from "@/components/SummaryMetrics";

export default function Alertas() {
  const language = useLanguageCode();
  const locale = language === "pt" ? "pt-BR" : language === "en" ? "en-US" : "zh-CN";
  const severityLabels = {
    critical: language === "pt" ? "Crítico" : language === "en" ? "Critical" : "严重",
    warning: language === "pt" ? "Atenção" : language === "en" ? "Warning" : "警告",
    info: language === "pt" ? "Informativo" : language === "en" ? "Info" : "信息",
  };
  const SEV = {
    critical: { icon: AlertOctagon, cls: "border-destructive/40 bg-destructive/5", text: "text-destructive", label: severityLabels.critical },
    warning: { icon: AlertTriangle, cls: "border-warning/40 bg-warning/5", text: "text-warning", label: severityLabels.warning },
    info: { icon: Info, cls: "border-info/40 bg-info/5", text: "text-info", label: severityLabels.info },
  };
  const grouped = {
    critical: alerts.filter((a) => a.severity === "critical"),
    warning:  alerts.filter((a) => a.severity === "warning"),
    info:     alerts.filter((a) => a.severity === "info"),
  };

  return (
    <div className="mx-auto max-w-[1440px] p-6 lg:p-8 animate-fade-in space-y-6">
      <div>
        <div className="text-[11px] font-mono uppercase tracking-[0.2em] text-accent mb-1">
          {language === "pt" ? "Inteligência · Eventos" : language === "en" ? "Intelligence · Events" : "智能 · 事件"}
        </div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-3">
          {language === "pt" ? "Central de Alertas" : language === "en" ? "Alert Center" : "警报中心"} <Bell className="h-5 w-5 text-warning" />
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {language === "pt"
            ? "Pendências, conflitos, riscos e notificações entre atores. Cada alerta traz origem, navio e ação recomendada."
            : language === "en"
              ? "Pending items, conflicts, risks and notifications across actors. Each alert includes source, vessel and recommended action."
              : "各方之间的待办、冲突、风险和通知。每条警报都包含来源、船舶和建议操作。"}
        </p>
      </div>

      <SummaryMetricsPanel>
        {(["critical", "warning", "info"] as const).map((k) => (
          <SummaryMetricCard key={k} className={SEV[k].cls}>
            <div className="text-[10px] font-mono uppercase tracking-wider text-foreground">{SEV[k].label}</div>
            <div className="text-2xl font-bold font-mono mt-1 text-[#102a4c]">{grouped[k].length}</div>
          </SummaryMetricCard>
        ))}
      </SummaryMetricsPanel>

      <div className="space-y-2.5">
        {alerts.map((a) => {
          const s = SEV[a.severity];
          const Icon = s.icon;
          const ship = a.shipId ? ships.find((x) => x.id === a.shipId) : null;
          const riskHref = ship
            ? getShipRisksHref(ship.id, a.riskId)
            : a.riskId
              ? `/riscos?risk=${encodeURIComponent(a.riskId)}`
              : "/riscos";
          return (
            <div key={a.id} className={cn("card-flat border-l-4 p-4 shadow-sm", s.cls, a.severity === "critical" && "ring-1 ring-destructive/30 shadow-[0_16px_34px_-26px_rgba(220,38,38,0.5)]")} style={{ borderLeftColor: `hsl(var(--${a.severity === "critical" ? "destructive" : a.severity === "warning" ? "warning" : "info"}))` }}>
              <div className="flex gap-4">
                <div className={cn("h-9 w-9 rounded shrink-0 grid place-items-center bg-card border border-border", s.text)}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className={cn("text-[10px] font-mono uppercase tracking-wider font-semibold", s.text)}>{s.label}</span>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">· {a.source}</span>
                    {a.origin && <span className="text-[10px] font-mono text-muted-foreground">· {a.origin}</span>}
                    <span className="text-[10px] font-mono text-muted-foreground ml-auto">{new Date(a.timestamp).toLocaleString(locale)}</span>
                  </div>
                  <div className="font-semibold text-sm">{a.title}</div>
                  <div className="text-xs text-muted-foreground mt-1">{a.description}</div>

                  {a.recommendedAction && (
                    <div className="mt-3 rounded-xl border border-[#d5e2f1] bg-white/70 p-2.5 text-xs">
                      <div className="text-[10px] font-mono uppercase text-accent mb-0.5">
                        {language === "pt" ? "Ação recomendada" : language === "en" ? "Recommended action" : "建议操作"}
                      </div>
                      {a.recommendedAction}
                    </div>
                  )}

                  <div className="mt-3 flex items-center gap-2 flex-wrap">
                    {ship && (
                      <ShipLink shipId={ship.id} className="inline-flex items-center gap-1.5 rounded-full bg-white/80 border border-[#d5e2f1] px-2.5 py-1 text-[11px] font-mono no-underline hover:border-accent hover:text-accent transition-colors">
                        {ship.flag} {ship.name} <ArrowRight className="h-3 w-3" />
                      </ShipLink>
                    )}
                    <Link to={riskHref} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/80 border border-[#d5e2f1] text-[11px] font-mono hover:border-accent hover:text-accent transition-colors">
                      {language === "pt" ? "Ver risco" : language === "en" ? "View risk" : "查看风险"} <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
