import { cn } from "@/lib/utils";
import type { ShipStatus, ClearanceStatus, RiskLevel } from "@/data/mockData";
import { useT } from "@/i18n/useT";

const SHIP_STATUS: Record<ShipStatus, { label: string; cls: string; dot: string }> = {
  transit:   { label: "Em rota",     cls: "text-status-transit bg-status-transit/10 border-status-transit/30",   dot: "bg-status-transit" },
  anchored:  { label: "Fundeado",    cls: "text-status-anchored bg-status-anchored/10 border-status-anchored/30",dot: "bg-status-anchored" },
  berthed:   { label: "Atracado",    cls: "text-status-berthed bg-status-berthed/10 border-status-berthed/30",   dot: "bg-status-berthed" },
  operating: { label: "Operando",    cls: "text-status-operating bg-status-operating/10 border-status-operating/30", dot: "bg-status-operating" },
  departing: { label: "Desatracando",cls: "text-muted-foreground bg-muted border-border",                          dot: "bg-muted-foreground" },
};

const CLEARANCE: Record<ClearanceStatus, { label: string; cls: string }> = {
  aprovado:   { label: "Aprovado",   cls: "text-success bg-success/10 border-success/30" },
  pendente:   { label: "Pendente",   cls: "text-warning bg-warning/10 border-warning/30" },
  em_analise: { label: "Em análise", cls: "text-info bg-info/10 border-info/30" },
  bloqueado:  { label: "Bloqueado",  cls: "text-destructive bg-destructive/10 border-destructive/30" },
};

const RISK: Record<RiskLevel, { label: string; cls: string; dot: string }> = {
  low:      { label: "Normal",  cls: "text-risk-low bg-risk-low/10 border-risk-low/30",                dot: "bg-risk-low" },
  medium:   { label: "Atenção", cls: "text-risk-medium bg-risk-medium/10 border-risk-medium/30",       dot: "bg-risk-medium" },
  high:     { label: "Alto",    cls: "text-risk-high bg-risk-high/10 border-risk-high/30",             dot: "bg-risk-high" },
  critical: { label: "Crítico", cls: "text-risk-critical bg-risk-critical/10 border-risk-critical/30", dot: "bg-risk-critical" },
};

export function ShipStatusBadge({ status }: { status: ShipStatus }) {
  const t = useT();
  const s = SHIP_STATUS[status];
  return (
    <span className={cn("inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium border font-mono uppercase tracking-wide", s.cls)}>
      <span className={cn("h-1.5 w-1.5 rounded-full", s.dot)} />
      {t(`status.ship.${status}`) || s.label}
    </span>
  );
}

export function ClearanceBadge({ status }: { status: ClearanceStatus }) {
  const t = useT();
  const s = CLEARANCE[status];
  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold border font-mono uppercase", s.cls)}>
      {t(`status.clearance.${status}`) || s.label}
    </span>
  );
}

export function RiskBadge({ level }: { level: RiskLevel }) {
  const t = useT();
  const s = RISK[level];
  return (
    <span className={cn("inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-semibold border font-mono uppercase tracking-wide", s.cls)}>
      <span className={cn("h-1.5 w-1.5 rounded-full", s.dot)} />
      {t(`status.risk.${level}`) || s.label}
    </span>
  );
}

export const RISK_HSL: Record<RiskLevel, string> = {
  low:      "var(--risk-low)",
  medium:   "var(--risk-medium)",
  high:     "var(--risk-high)",
  critical: "var(--risk-critical)",
};
