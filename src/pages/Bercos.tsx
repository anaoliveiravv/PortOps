import { berths, riskItems, ships } from "@/data/mockData";
import { Anchor, Wrench, Calendar, AlertTriangle, ArrowRight, CheckCircle2, Clock3 } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useLanguageCode } from "@/i18n/useT";
import { ShipLink } from "@/components/ShipLink";
import { getShipRisksHref } from "@/lib/shipLinks";
import { SummaryMetricCard, SummaryMetricsPanel } from "@/components/SummaryMetrics";
import { useEffect, useRef } from "react";

const STATUS = {
  livre:      { cls: "border-emerald-200 bg-emerald-50/80 text-emerald-700", label: "Livre",       text: "text-emerald-700", icon: CheckCircle2 },
  ocupado:    { cls: "border-blue-200 bg-blue-50/80 text-blue-700",          label: "Ocupado",     text: "text-blue-700", icon: Anchor },
  reservado:  { cls: "border-orange-200 bg-orange-50/80 text-orange-600",    label: "Reservado",   text: "text-orange-600", icon: Clock3 },
  manutencao: { cls: "border-red-200 bg-red-50/85 text-red-600",             label: "Manutenção",  text: "text-red-600", icon: Wrench },
};

export default function Bercos() {
  const language = useLanguageCode();
  const [searchParams] = useSearchParams();
  const focusedShipId = searchParams.get("ship");
  const focusedBerthParam = searchParams.get("berth");
  const focusedShip = focusedShipId ? ships.find((ship) => ship.id === focusedShipId) ?? null : null;
  const firstFocusedCardRef = useRef<HTMLDivElement | null>(null);
  const statusLabels = {
    livre: language === "pt" ? "Livre" : language === "en" ? "Free" : "空闲",
    ocupado: language === "pt" ? "Ocupado" : language === "en" ? "Occupied" : "占用",
    reservado: language === "pt" ? "Reservado" : language === "en" ? "Reserved" : "已预留",
    manutencao: language === "pt" ? "Manutenção" : language === "en" ? "Maintenance" : "维护",
  };
  const livre = berths.filter((b) => b.status === "livre").length;
  const ocupado = berths.filter((b) => b.status === "ocupado").length;
  const manut = berths.filter((b) => b.status === "manutencao").length;
  const reservado = berths.filter((b) => b.status === "reservado").length;
  const conflicts = berths.filter((b) => b.conflict).length;
  const explicitFocusedBerth = focusedBerthParam ? berths.find((b) => b.id === focusedBerthParam) ?? null : null;
  const firstFocusedBerthId = explicitFocusedBerth?.id
    ?? (focusedShip
      ? berths.find((b) => b.occupiedBy === focusedShip.id || b.nextShipId === focusedShip.id)?.id ?? null
      : null);

  useEffect(() => {
    if (typeof firstFocusedCardRef.current?.scrollIntoView !== "function") return;
    firstFocusedCardRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [firstFocusedBerthId]);

  return (
    <div className="mx-auto max-w-[1440px] p-6 lg:p-8 animate-fade-in space-y-6">
      <div>
        <div className="text-[11px] font-mono uppercase tracking-[0.2em] text-accent mb-1">{language === "pt" ? "Operação · Berços" : language === "en" ? "Operations · Berths" : "运营 · 泊位"}</div>
        <h1 className="text-2xl font-bold tracking-tight">{language === "pt" ? "Gestão de Berços" : language === "en" ? "Berth Management" : "泊位管理"}</h1>
        <p className="text-sm text-muted-foreground mt-0.5">{language === "pt" ? "Ocupação atual, próximas atracações, conflitos e taxa de utilização." : language === "en" ? "Current occupancy, next berthings, conflicts and utilization rate." : "当前占用、下一批靠泊、冲突和利用率。"}</p>
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
        {[
          { label: language === "pt" ? "Livres" : language === "en" ? "Free" : "空闲", n: livre },
          { label: language === "pt" ? "Ocupados" : language === "en" ? "Occupied" : "占用", n: ocupado },
          { label: language === "pt" ? "Reservados" : language === "en" ? "Reserved" : "已预留", n: reservado },
          { label: language === "pt" ? "Manutenção" : language === "en" ? "Maintenance" : "维护", n: manut },
          { label: language === "pt" ? "Conflitos" : language === "en" ? "Conflicts" : "冲突", n: conflicts },
        ].map((k) => (
          <SummaryMetricCard key={k.label}>
            <div className="text-[10px] font-mono uppercase tracking-wider text-foreground">{k.label}</div>
            <div className="text-2xl font-bold font-mono mt-1 text-[#102a4c]">{k.n}</div>
          </SummaryMetricCard>
        ))}
      </SummaryMetricsPanel>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {berths.map((b) => {
          const ship = ships.find((s) => s.id === b.occupiedBy);
          const next = ships.find((s) => s.id === b.nextShipId);
          const st = { ...STATUS[b.status], label: statusLabels[b.status] };
          const StatusIcon = st.icon;
          const isExplicitFocusedBerth = explicitFocusedBerth?.id === b.id;
          const isFocusedBerth = isExplicitFocusedBerth || Boolean(!explicitFocusedBerth && focusedShip && (b.occupiedBy === focusedShip.id || b.nextShipId === focusedShip.id));
          const contextualRisk = riskItems.find((risk) => risk.berthId === b.id);
          const contextualRiskHref = focusedShip && isFocusedBerth
            ? getShipRisksHref(focusedShip.id, contextualRisk?.id)
            : contextualRisk
              ? `/riscos?risk=${encodeURIComponent(contextualRisk.id)}`
              : "/riscos";
          return (
            <div
              key={b.id}
              ref={b.id === firstFocusedBerthId ? firstFocusedCardRef : undefined}
              aria-current={isFocusedBerth ? "true" : undefined}
              className={cn(
                "card-flat overflow-hidden transition-all duration-300",
                b.conflict && "border-destructive/40",
                isFocusedBerth && "border-[#1351b4] ring-4 ring-[#67b6ff]/50 shadow-[0_26px_58px_-30px_rgba(19,81,180,0.82)]"
              )}
            >
              <div className={cn("px-4 py-3 border-b border-border flex items-center justify-between", st.cls)}>
                <div className="flex items-center gap-2">
                  {b.status === "manutencao" ? <Wrench className={cn("h-4 w-4", st.text)} /> : <Anchor className={cn("h-4 w-4", st.text)} />}
                  <div>
                    <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">{b.id} · {b.zone}</div>
                    <div className="font-semibold text-sm leading-tight">{b.name}</div>
                  </div>
                </div>
                <span className={cn("inline-flex min-h-[1.75rem] items-center justify-center gap-1.5 rounded-[0.52rem] border px-2.5 py-1 text-[0.72rem] font-semibold leading-none tracking-[-0.01em] shadow-[inset_0_1px_0_rgba(255,255,255,0.75)]", st.cls)}>
                  <StatusIcon className="h-3.5 w-3.5 shrink-0" />
                  {st.label}
                </span>
              </div>

              <div className="p-4 space-y-3">
                {isFocusedBerth && (
                  <div className="inline-flex items-center rounded-full border border-[#7bb7f0] bg-[#eef6ff] px-2.5 py-1 text-[10px] font-mono uppercase tracking-[0.14em] text-[#1351b4]">
                    {isExplicitFocusedBerth
                      ? language === "pt" ? "Berço em foco" : language === "en" ? "Focused berth" : "聚焦泊位"
                      : language === "pt" ? "Navio selecionado" : language === "en" ? "Selected vessel" : "选定船舶"}
                  </div>
                )}

                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div><div className="text-[10px] text-muted-foreground font-mono uppercase">{language === "pt" ? "Compr." : language === "en" ? "Length" : "长度"}</div><div className="font-mono font-semibold">{b.length} m</div></div>
                  <div><div className="text-[10px] text-muted-foreground font-mono uppercase">{language === "pt" ? "Calado" : language === "en" ? "Draft" : "吃水"}</div><div className="font-mono font-semibold">{b.draft} m</div></div>
                  <div><div className="text-[10px] text-muted-foreground font-mono uppercase">{language === "pt" ? "Uso 7d" : language === "en" ? "7d use" : "7天利用率"}</div><div className="font-mono font-semibold">{b.utilization}%</div></div>
                </div>

                <div>
                  <div className="h-1 rounded-full bg-muted overflow-hidden">
                    <div className="h-full bg-accent" style={{ width: `${b.utilization}%` }} />
                  </div>
                </div>

                {ship && (
                  <div className="rounded-xl border border-[#d5e2f1] bg-[#f6f9fd] p-2.5">
                    <div className="text-[10px] font-mono uppercase text-muted-foreground mb-0.5">{language === "pt" ? "Atracado agora" : language === "en" ? "Currently berthed" : "当前靠泊"}</div>
                    <div className="text-sm font-medium">
                      <ShipLink shipId={ship.id} className="font-medium text-foreground no-underline hover:text-primary">
                        {ship.flag} {ship.name}
                      </ShipLink>
                    </div>
                    <div className="text-[11px] text-muted-foreground font-mono mt-0.5 flex items-center gap-1">
                      <Calendar className="h-3 w-3" /> ETS {new Date(ship.ets).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                )}

                {next && (
                  <div className="rounded-xl border border-dashed border-[#c5d6eb] bg-white/60 p-2.5">
                    <div className="text-[10px] font-mono uppercase text-muted-foreground mb-0.5 flex items-center gap-1">
                      <ArrowRight className="h-3 w-3" /> {language === "pt" ? "Próximo navio" : language === "en" ? "Next vessel" : "下一艘船"}
                    </div>
                    <div className="text-sm">
                      <ShipLink shipId={next.id} className="text-foreground no-underline hover:text-primary">
                        {next.flag} {next.name}
                      </ShipLink>
                    </div>
                    <div className="text-[11px] text-muted-foreground font-mono mt-0.5">
                      ETB {b.nextEtb && new Date(b.nextEtb).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                )}

                {!ship && !next && (
                  <div className="text-[11px] text-muted-foreground italic">{language === "pt" ? "Sem alocação programada" : language === "en" ? "No scheduled allocation" : "暂无排班"}</div>
                )}

                {b.conflict && (
                  <Link to={contextualRiskHref} className="flex items-start gap-2 rounded-xl border border-destructive/40 bg-destructive/5 p-2.5 text-xs hover:bg-destructive/10 transition-colors">
                    <AlertTriangle className="h-3.5 w-3.5 text-destructive shrink-0 mt-0.5" />
                    <div>
                      <div className="text-[10px] font-mono uppercase text-destructive mb-0.5">{language === "pt" ? "Conflito previsto" : language === "en" ? "Predicted conflict" : "预计冲突"}</div>
                      <div className="text-foreground">{b.conflict}</div>
                    </div>
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
