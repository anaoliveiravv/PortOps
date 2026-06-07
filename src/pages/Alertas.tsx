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
    critical: {
      icon: AlertOctagon,
      cls: "border-destructive/40 bg-destructive/5",
      text: "text-destructive",
      label: severityLabels.critical,
      card: "border-l-destructive/80 border-destructive/20 bg-[radial-gradient(circle_at_18%_12%,rgba(248,113,113,0.16),transparent_30%),linear-gradient(135deg,rgba(255,255,255,0.96),rgba(255,245,247,0.92))]",
      iconBox: "bg-[linear-gradient(135deg,#fb7185,#ef4444)] text-white shadow-[0_18px_34px_-22px_rgba(239,68,68,0.95)]",
      pill: "border-destructive/20 bg-destructive/10 text-destructive",
      action: "border-destructive/20 bg-white/72 text-destructive",
      button: "border-destructive/70 text-destructive hover:bg-destructive hover:text-white",
    },
    warning: {
      icon: AlertTriangle,
      cls: "border-warning/40 bg-warning/5",
      text: "text-warning",
      label: severityLabels.warning,
      card: "border-l-warning/90 border-warning/20 bg-[radial-gradient(circle_at_18%_12%,rgba(251,146,60,0.18),transparent_30%),linear-gradient(135deg,rgba(255,255,255,0.96),rgba(255,250,240,0.94))]",
      iconBox: "bg-[linear-gradient(135deg,#fdba74,#f59e0b)] text-white shadow-[0_18px_34px_-22px_rgba(245,158,11,0.9)]",
      pill: "border-warning/25 bg-warning/10 text-warning",
      action: "border-warning/25 bg-white/72 text-warning",
      button: "border-warning/75 text-warning hover:bg-warning hover:text-white",
    },
    info: {
      icon: Info,
      cls: "border-info/40 bg-info/5",
      text: "text-info",
      label: severityLabels.info,
      card: "border-l-info/90 border-info/20 bg-[radial-gradient(circle_at_18%_12%,rgba(96,165,250,0.17),transparent_30%),linear-gradient(135deg,rgba(255,255,255,0.96),rgba(244,249,255,0.94))]",
      iconBox: "bg-[linear-gradient(135deg,#60a5fa,#2563eb)] text-white shadow-[0_18px_34px_-22px_rgba(37,99,235,0.9)]",
      pill: "border-info/25 bg-info/10 text-info",
      action: "border-info/25 bg-white/72 text-info",
      button: "border-info/75 text-info hover:bg-info hover:text-white",
    },
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

      <SummaryMetricsPanel className="mx-auto max-w-[1360px]">
        {(["critical", "warning", "info"] as const).map((k) => (
          <SummaryMetricCard key={k} className={SEV[k].cls}>
            <div className="text-[10px] font-mono uppercase tracking-wider text-foreground">{SEV[k].label}</div>
            <div className="text-2xl font-bold font-mono mt-1 text-[#102a4c]">{grouped[k].length}</div>
          </SummaryMetricCard>
        ))}
      </SummaryMetricsPanel>

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
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
            <div
              key={a.id}
              className={cn(
                "group relative overflow-hidden rounded-[1.15rem] border border-l-2 p-4 shadow-[0_24px_52px_-40px_rgba(16,42,76,0.58)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_30px_64px_-42px_rgba(16,42,76,0.68)]",
                s.card
              )}
            >
              <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-white/80" />
              <div className="flex gap-3">
                <div className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-xl", s.iconBox)}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="min-h-6 font-semibold text-sm text-[#102a4c]">
                        {ship ? (
                          <ShipLink shipId={ship.id} className="text-[#102a4c] no-underline hover:text-primary">
                            {ship.flag} {ship.name}
                          </ShipLink>
                        ) : (
                          <span>{a.source}</span>
                        )}
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-1.5">
                        <span className={cn("rounded-full border px-2 py-0.5 text-[10px] font-mono uppercase tracking-[0.12em]", s.pill)}>
                          {s.label}
                        </span>
                        <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">· {a.source}</span>
                        {a.origin && <span className="text-[10px] font-mono text-muted-foreground">· {a.origin}</span>}
                      </div>
                    </div>
                    <span className="shrink-0 text-right text-[10px] font-mono text-muted-foreground">
                      {new Date(a.timestamp).toLocaleString(locale)}
                    </span>
                  </div>

                  <div className="mt-4 text-[0.95rem] font-bold leading-snug text-[#102a4c]">{a.title}</div>
                  <div className="mt-1 text-xs leading-5 text-[#405672]">{a.description}</div>

                  {a.recommendedAction && (
                    <div className={cn("mt-3 rounded-xl border p-2.5 text-xs text-[#102a4c]", s.action)}>
                      <div className={cn("text-[10px] font-mono uppercase tracking-[0.12em] mb-0.5", s.text)}>
                        {language === "pt" ? "Ação recomendada" : language === "en" ? "Recommended action" : "建议操作"}
                      </div>
                      {a.recommendedAction}
                    </div>
                  )}

                  <div className="mt-3 flex justify-end">
                    <Link to={riskHref} className={cn("inline-flex items-center gap-1.5 rounded-full border bg-white/70 px-3 py-1.5 text-[11px] font-mono font-semibold transition-colors", s.button)}>
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
