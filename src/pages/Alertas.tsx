import { useState } from "react";
import { Link } from "react-router-dom";
import { alerts, ships, type AlertItem, type AlertSeverity } from "@/data/mockData";
import { AlertTriangle, Info, AlertOctagon, Bell, ArrowRight, X, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguageCode } from "@/i18n/useT";
import { ShipLink } from "@/components/ShipLink";
import { getShipRisksHref } from "@/lib/shipLinks";
import { SummaryMetricCard, SummaryMetricsPanel } from "@/components/SummaryMetrics";

type SeverityView = {
  icon: LucideIcon;
  cls: string;
  label: string;
  card: string;
  iconBox: string;
  pill: string;
  button: string;
};

export default function Alertas() {
  const [selectedAlert, setSelectedAlert] = useState<AlertItem | null>(null);
  const language = useLanguageCode();
  const locale = language === "pt" ? "pt-BR" : language === "en" ? "en-US" : "zh-CN";
  const severityLabels: Record<AlertSeverity, string> = {
    critical: language === "pt" ? "Crítico" : language === "en" ? "Critical" : "严重",
    warning: language === "pt" ? "Atenção" : language === "en" ? "Warning" : "警告",
    info: language === "pt" ? "Informativo" : language === "en" ? "Info" : "信息",
  };
  const SEV: Record<AlertSeverity, SeverityView> = {
    critical: {
      icon: AlertOctagon,
      cls: "border-destructive/40 bg-destructive/5",
      label: severityLabels.critical,
      card: "border-l-destructive/80 border-destructive/20 bg-[linear-gradient(135deg,rgba(255,255,255,0.98),rgba(255,247,248,0.94))] dark:bg-[linear-gradient(135deg,hsl(var(--card)),hsl(var(--destructive)/0.12))]",
      iconBox: "bg-red-600 text-white shadow-[0_18px_34px_-22px_rgba(239,68,68,0.95)]",
      pill: "border-destructive/20 bg-destructive/10 text-destructive",
      button: "border-destructive/60 text-destructive hover:bg-destructive hover:text-white",
    },
    warning: {
      icon: AlertTriangle,
      cls: "border-warning/40 bg-warning/5",
      label: severityLabels.warning,
      card: "border-l-warning/80 border-warning/20 bg-[linear-gradient(135deg,rgba(255,255,255,0.98),rgba(255,251,244,0.94))] dark:bg-[linear-gradient(135deg,hsl(var(--card)),hsl(var(--warning)/0.12))]",
      iconBox: "bg-amber-500 text-white shadow-[0_18px_34px_-22px_rgba(245,158,11,0.9)]",
      pill: "border-warning/25 bg-warning/10 text-warning",
      button: "border-warning/70 text-warning hover:bg-warning hover:text-white",
    },
    info: {
      icon: Info,
      cls: "border-info/40 bg-info/5",
      label: severityLabels.info,
      card: "border-l-info/80 border-info/20 bg-[linear-gradient(135deg,rgba(255,255,255,0.98),rgba(246,250,255,0.94))] dark:bg-[linear-gradient(135deg,hsl(var(--card)),hsl(var(--info)/0.12))]",
      iconBox: "bg-blue-600 text-white shadow-[0_18px_34px_-22px_rgba(37,99,235,0.9)]",
      pill: "border-info/25 bg-info/10 text-info",
      button: "border-info/70 text-info hover:bg-info hover:text-white",
    },
  };
  const grouped = {
    critical: alerts.filter((a) => a.severity === "critical"),
    warning: alerts.filter((a) => a.severity === "warning"),
    info: alerts.filter((a) => a.severity === "info"),
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
            ? "Pendências, conflitos, riscos e notificações entre atores. Clique em um alerta para abrir seus detalhes."
            : language === "en"
              ? "Pending items, conflicts, risks and notifications across actors. Click an alert to open its details."
              : "各方之间的待办、冲突、风险和通知。点击警报可打开详情。"}
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
        {alerts.map((alert) => {
          const view = SEV[alert.severity];
          const Icon = view.icon;
          const ship = alert.shipId ? ships.find((x) => x.id === alert.shipId) : null;
          const riskHref = getAlertRiskHref(alert);

          return (
            <div
              key={alert.id}
              role="button"
              tabIndex={0}
              onClick={() => setSelectedAlert(alert)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  setSelectedAlert(alert);
                }
              }}
              className={cn(
                "group relative cursor-pointer overflow-hidden rounded-[1.15rem] border border-l-2 p-4 shadow-[0_24px_52px_-40px_rgba(16,42,76,0.58)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_30px_64px_-42px_rgba(16,42,76,0.68)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
                view.card,
              )}
            >
              <div className="flex gap-3">
                <div className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-xl", view.iconBox)}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="min-h-6 font-semibold text-sm text-[#102a4c]">
                        {ship ? `${ship.flag} ${ship.name}` : alert.source}
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-1.5">
                        <span className={cn("rounded-full border px-2 py-0.5 text-[10px] font-mono uppercase tracking-[0.12em]", view.pill)}>
                          {view.label}
                        </span>
                        <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">· {alert.source}</span>
                        {alert.origin && <span className="text-[10px] font-mono text-muted-foreground">· {alert.origin}</span>}
                      </div>
                    </div>
                    <span className="shrink-0 text-right text-[10px] font-mono text-muted-foreground">
                      {new Date(alert.timestamp).toLocaleString(locale)}
                    </span>
                  </div>

                  <div className="mt-4 text-[0.95rem] font-bold leading-snug text-[#102a4c]">{alert.title}</div>
                  <div className="mt-1 text-xs leading-5 text-[#405672]">{alert.description}</div>

                  {alert.recommendedAction && (
                    <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-[#24364d] dark:border-border dark:bg-secondary dark:text-foreground">
                      <div className="mb-0.5 text-[10px] font-mono uppercase tracking-[0.12em] text-slate-500">
                        {language === "pt" ? "Ação recomendada" : language === "en" ? "Recommended action" : "建议操作"}
                      </div>
                      {alert.recommendedAction}
                    </div>
                  )}

                  <div className="mt-3 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        setSelectedAlert(alert);
                      }}
                      className="inline-flex items-center gap-1.5 rounded-full border border-[#cbd9ea] bg-white/70 px-3 py-1.5 text-[11px] font-mono font-semibold text-[#102a4c] transition-colors hover:bg-white dark:border-border dark:bg-secondary dark:text-foreground dark:hover:bg-muted"
                    >
                      {language === "pt" ? "Abrir alerta" : language === "en" ? "Open alert" : "打开警报"}
                    </button>
                    <Link
                      to={riskHref}
                      onClick={(event) => event.stopPropagation()}
                      className={cn("inline-flex items-center gap-1.5 rounded-full border bg-white/70 px-3 py-1.5 text-[11px] font-mono font-semibold transition-colors dark:bg-secondary", view.button)}
                    >
                      {language === "pt" ? "Ver risco" : language === "en" ? "View risk" : "查看风险"} <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {selectedAlert && (
        <AlertModal
          alert={selectedAlert}
          locale={locale}
          severityLabel={SEV[selectedAlert.severity].label}
          onClose={() => setSelectedAlert(null)}
        />
      )}
    </div>
  );
}

function getAlertRiskHref(alert: AlertItem) {
  const ship = alert.shipId ? ships.find((item) => item.id === alert.shipId) : null;
  if (ship) return getShipRisksHref(ship.id, alert.riskId);
  return alert.riskId ? `/riscos?risk=${encodeURIComponent(alert.riskId)}` : "/riscos";
}

function AlertModal({
  alert,
  locale,
  severityLabel,
  onClose,
}: {
  alert: AlertItem;
  locale: string;
  severityLabel: string;
  onClose: () => void;
}) {
  const language = useLanguageCode();
  const ship = alert.shipId ? ships.find((item) => item.id === alert.shipId) : null;
  const riskHref = getAlertRiskHref(alert);

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="alert-modal-title">
      <div className="w-full max-w-2xl overflow-hidden rounded-[1.2rem] border border-[#d5e2f1] bg-white shadow-[0_32px_90px_-42px_rgba(15,23,42,0.7)] dark:border-border dark:bg-card">
        <div className="flex items-start justify-between gap-4 border-b border-[#d5e2f1] px-5 py-4 dark:border-border">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-muted-foreground">
              {severityLabel} - {alert.source}
            </div>
            <h2 id="alert-modal-title" className="mt-1 text-xl font-bold leading-tight text-[#102a4c]">
              {alert.title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-[#d5e2f1] text-muted-foreground transition-colors hover:bg-[#f4f8fd] hover:text-foreground dark:border-border dark:hover:bg-secondary"
            aria-label={language === "pt" ? "Fechar alerta" : language === "en" ? "Close alert" : "关闭警报"}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4 px-5 py-5">
          <div className="grid gap-3 sm:grid-cols-3">
            <InfoTile label={language === "pt" ? "Origem" : language === "en" ? "Origin" : "来源"} value={alert.origin ?? alert.source} />
            <InfoTile label={language === "pt" ? "Data" : language === "en" ? "Date" : "日期"} value={new Date(alert.timestamp).toLocaleString(locale)} />
            <InfoTile label={language === "pt" ? "Navio" : language === "en" ? "Vessel" : "船舶"} value={ship ? `${ship.flag} ${ship.name}` : "-"} />
          </div>

          <div className="rounded-xl border border-[#d5e2f1] bg-[#f8fafc] p-3 text-sm leading-6 text-[#405672] dark:border-border dark:bg-secondary dark:text-muted-foreground">
            {alert.description}
          </div>

          {alert.recommendedAction && (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-[#24364d] dark:border-border dark:bg-secondary dark:text-foreground">
              <div className="mb-1 text-[10px] font-mono uppercase tracking-[0.14em] text-slate-500">
                {language === "pt" ? "Ação recomendada" : language === "en" ? "Recommended action" : "建议操作"}
              </div>
              {alert.recommendedAction}
            </div>
          )}

          <div className="flex flex-wrap justify-end gap-2">
            {ship && (
              <ShipLink shipId={ship.id} className="inline-flex items-center rounded-full border border-[#cbd9ea] bg-white px-3 py-1.5 text-[11px] font-mono font-semibold text-[#102a4c] no-underline hover:border-[#9fb7d4] hover:bg-[#f4f8fd] dark:border-border dark:bg-secondary dark:text-foreground dark:hover:bg-muted">
                {language === "pt" ? "Ver navio" : language === "en" ? "View vessel" : "查看船舶"}
              </ShipLink>
            )}
            <Link to={riskHref} className="inline-flex items-center gap-1.5 rounded-full border border-[#cbd9ea] bg-white px-3 py-1.5 text-[11px] font-mono font-semibold text-[#102a4c] transition-colors hover:border-[#9fb7d4] hover:bg-[#f4f8fd] dark:border-border dark:bg-secondary dark:text-foreground dark:hover:bg-muted">
              {language === "pt" ? "Ver risco" : language === "en" ? "View risk" : "查看风险"} <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-[#d5e2f1] bg-white p-3 dark:border-border dark:bg-secondary">
      <div className="text-[10px] font-mono uppercase tracking-[0.14em] text-muted-foreground">{label}</div>
      <div className="mt-1 text-xs font-semibold text-[#102a4c]">{value}</div>
    </div>
  );
}
