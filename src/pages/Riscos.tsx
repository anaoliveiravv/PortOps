import { Link, useSearchParams } from "react-router-dom";
import { riskItems, ships, berths, type RiskLevel } from "@/data/mockData";
import { RiskBadge } from "@/components/StatusBadges";
import { AlertTriangle, Clock, Shield, ArrowRight, Target } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguageCode } from "@/i18n/useT";
import { ShipLink } from "@/components/ShipLink";
import { getShipBerthsHref } from "@/lib/shipLinks";
import { SummaryMetricCard, SummaryMetricsPanel } from "@/components/SummaryMetrics";
import { useEffect, useRef } from "react";

const ORDER: RiskLevel[] = ["critical", "high", "medium", "low"];
export default function Riscos() {
  const language = useLanguageCode();
  const [searchParams] = useSearchParams();
  const focusedShipId = searchParams.get("ship");
  const focusedRiskParam = searchParams.get("risk");
  const focusedShip = focusedShipId ? ships.find((ship) => ship.id === focusedShipId) ?? null : null;
  const focusedBerthIds = new Set([focusedShip?.berthId, focusedShip?.nextBerthId].filter(Boolean));
  const firstFocusedRiskRef = useRef<HTMLDivElement | null>(null);
  const levelLabels: Record<RiskLevel, string> = {
    critical: language === "pt" ? "Crítico" : language === "en" ? "Critical" : "严重",
    high: language === "pt" ? "Alto" : language === "en" ? "High" : "高",
    medium: language === "pt" ? "Médio" : language === "en" ? "Medium" : "中",
    low: language === "pt" ? "Baixo" : language === "en" ? "Low" : "低",
  };
  const counts = ORDER.reduce((acc, k) => {
    acc[k] = riskItems.filter((r) => r.level === k).length;
    return acc;
  }, {} as Record<RiskLevel, number>);
  const orderedRisks = ORDER.flatMap((lvl) => riskItems.filter((r) => r.level === lvl));
  const explicitFocusedRisk = focusedRiskParam ? orderedRisks.find((r) => r.id === focusedRiskParam) ?? null : null;
  const firstFocusedRiskId = explicitFocusedRisk?.id
    ?? (focusedShip
      ? orderedRisks.find((r) => r.shipId === focusedShip.id || (r.berthId && focusedBerthIds.has(r.berthId)))?.id ?? null
      : null);

  useEffect(() => {
    if (typeof firstFocusedRiskRef.current?.scrollIntoView !== "function") return;
    firstFocusedRiskRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [firstFocusedRiskId]);

  return (
    <div className="mx-auto max-w-[1440px] p-6 lg:p-8 animate-fade-in space-y-6">
      <div>
        <div className="text-[11px] font-mono uppercase tracking-[0.2em] text-accent mb-1">{language === "pt" ? "Inteligência · Riscos operacionais" : language === "en" ? "Intelligence · Operational risks" : "智能 · 运营风险"}</div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-3">
          {language === "pt" ? "Painel de Riscos" : language === "en" ? "Risk Panel" : "风险面板"} <AlertTriangle className="h-5 w-5 text-risk-high" />
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">{language === "pt" ? "Atuação preventiva: identificação, impacto, prazo crítico e plano de mitigação." : language === "en" ? "Preventive action: identification, impact, critical deadline and mitigation plan." : "预防性管理：识别、影响、关键期限和缓解计划。"}</p>
      </div>

      {focusedShip && (
        <div className="rounded-xl border border-[#9fc7f2] bg-[#eef6ff] px-4 py-3 text-sm text-[#102a4c] shadow-[0_18px_38px_-32px_rgba(19,81,180,0.55)]">
          <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-[#1351b4]">
            {language === "pt" ? "Contexto do navio" : language === "en" ? "Vessel context" : "船舶上下文"}
          </div>
          <div className="mt-0.5 font-semibold">
            {language === "pt" ? "Visualizando informações de" : language === "en" ? "Viewing information for" : "正在查看"} {focusedShip.name} · IMO {focusedShip.imo}
          </div>
        </div>
      )}

      <SummaryMetricsPanel>
        {ORDER.map((k) => (
          <SummaryMetricCard key={k} className="border-l-4" style={{ borderLeftColor: `hsl(var(--risk-${k}))` }}>
            <div className="text-[10px] font-mono uppercase tracking-wider" style={{ color: `hsl(var(--risk-${k}))` }}>{levelLabels[k]}</div>
            <div className="text-2xl font-bold font-mono mt-1 text-[#102a4c]">{counts[k]}</div>
          </SummaryMetricCard>
        ))}
      </SummaryMetricsPanel>

      <div className="space-y-2.5">
        {orderedRisks.map((r) => {
          const ship = r.shipId ? ships.find((s) => s.id === r.shipId) : null;
          const berth = r.berthId ? berths.find((b) => b.id === r.berthId) : null;
          const hoursLeft = Math.round((+new Date(r.deadline) - Date.now()) / 3600000);
          const isExplicitFocusedRisk = explicitFocusedRisk?.id === r.id;
          const isFocusedRisk = isExplicitFocusedRisk || Boolean(!explicitFocusedRisk && focusedShip && (r.shipId === focusedShip.id || (r.berthId && focusedBerthIds.has(r.berthId))));
          const berthHref = focusedShip && isFocusedRisk
            ? getShipBerthsHref(focusedShip.id, berth?.id)
            : berth
              ? `/bercos?berth=${encodeURIComponent(berth.id)}`
              : "/bercos";
          return (
            <div
              key={r.id}
              ref={r.id === firstFocusedRiskId ? firstFocusedRiskRef : undefined}
              aria-current={isFocusedRisk ? "true" : undefined}
              className={cn(
                "premium-panel overflow-hidden transition-all duration-300",
                isFocusedRisk && "border-[#1351b4] ring-4 ring-[#67b6ff]/50 shadow-[0_26px_58px_-30px_rgba(19,81,180,0.82)]"
              )}
            >
              <div className="grid md:grid-cols-[1fr_280px]">
                <div className="p-4 border-r border-border">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <RiskBadge level={r.level} />
                    <span className="text-[10px] font-mono uppercase text-muted-foreground">{r.id}</span>
                    {isFocusedRisk && !isExplicitFocusedRisk && (
                      <span className="rounded-full border border-[#7bb7f0] bg-[#eef6ff] px-2 py-0.5 text-[10px] font-mono uppercase tracking-[0.14em] text-[#1351b4]">
                        {language === "pt" ? "Navio selecionado" : language === "en" ? "Selected vessel" : "选定船舶"}
                      </span>
                    )}
                    {ship && (
                      <ShipLink shipId={ship.id} className="text-[11px] font-mono px-1.5 py-0.5 rounded border border-border no-underline hover:border-accent hover:text-accent transition-colors">
                        {ship.flag} {ship.name}
                      </ShipLink>
                    )}
                    {berth && (
                      <Link to={berthHref} className="text-[11px] font-mono px-1.5 py-0.5 rounded border border-border hover:border-accent hover:text-accent transition-colors">
                        {berth.id} · {berth.name}
                      </Link>
                    )}
                  </div>
                  <div className="font-semibold text-sm">{r.description}</div>
                  <div className="text-xs text-muted-foreground mt-1.5">
                    <span className="font-mono uppercase text-[10px] text-muted-foreground mr-1.5">{language === "pt" ? "Impacto:" : language === "en" ? "Impact:" : "影响："}</span>
                    {r.impact}
                  </div>
                  <div className="mt-3 flex items-start gap-2 rounded-xl border border-accent/30 bg-accent/5 p-2.5">
                    <Target className="h-3.5 w-3.5 text-accent shrink-0 mt-0.5" />
                    <div className="text-xs">
                      <div className="text-[10px] font-mono uppercase text-accent mb-0.5">{language === "pt" ? "Plano de mitigação" : language === "en" ? "Mitigation plan" : "缓解计划"}</div>
                      {r.mitigation}
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-[#f6f9fd] space-y-3">
                  <div>
                    <div className="text-[10px] font-mono uppercase text-muted-foreground flex items-center gap-1.5"><Clock className="h-3 w-3" /> {language === "pt" ? "Prazo crítico" : language === "en" ? "Critical deadline" : "关键期限"}</div>
                    <div className={cn("text-lg font-bold font-mono mt-1", hoursLeft <= 2 ? "text-destructive" : hoursLeft <= 6 ? "text-warning" : "text-foreground")}>
                      {hoursLeft <= 0 ? (language === "pt" ? "Vencido" : language === "en" ? "Expired" : "已超时") : `${hoursLeft}h`}
                    </div>
                    <div className="text-[10px] font-mono text-muted-foreground">{new Date(r.deadline).toLocaleString("pt-BR")}</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-mono uppercase text-muted-foreground flex items-center gap-1.5"><Shield className="h-3 w-3" /> {language === "pt" ? "Responsável" : language === "en" ? "Owner" : "负责人"}</div>
                    <div className="text-xs mt-1">{r.owner}</div>
                  </div>
                  <Link to="/alertas" className="inline-flex items-center gap-1.5 text-[11px] font-mono text-accent hover:underline mt-1">
                    {language === "pt" ? "Ver alertas relacionados" : language === "en" ? "View related alerts" : "查看相关警报"} <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
