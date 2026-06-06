import { cn } from "@/lib/utils";
import type { ShipStatus, ClearanceStatus, RiskLevel, DocumentItem } from "@/data/mockData";
import { useLanguageCode, useT } from "@/i18n/useT";
import { AlertOctagon, CheckCircle2, CircleDot, Clock3, LoaderCircle, ShieldAlert, ShipWheel, type LucideIcon } from "lucide-react";

type DocumentStatus = DocumentItem["status"];

const pillBase =
  "inline-flex min-h-[2.15rem] items-center justify-center gap-2 rounded-[0.62rem] border px-3.5 py-1.5 text-[0.8rem] font-semibold leading-none tracking-[-0.01em] shadow-[inset_0_1px_0_rgba(255,255,255,0.78)] transition-colors";

const compactPillBase =
  "inline-flex min-h-[1.75rem] items-center justify-center gap-1.5 rounded-[0.52rem] border px-2.5 py-1 text-[0.72rem] font-semibold leading-none tracking-[-0.01em] shadow-[inset_0_1px_0_rgba(255,255,255,0.75)] transition-colors";

const iconClass = "h-4 w-4 shrink-0";
const compactIconClass = "h-3.5 w-3.5 shrink-0";

const clearanceTone: Record<ClearanceStatus, { cls: string; icon: LucideIcon; shadow: string }> = {
  aprovado: {
    cls: "border-emerald-200 bg-emerald-50/80 text-emerald-700 hover:bg-emerald-50",
    icon: CheckCircle2,
    shadow: "shadow-[0_12px_24px_-20px_rgba(5,150,105,0.68),inset_0_1px_0_rgba(255,255,255,0.78)]",
  },
  em_analise: {
    cls: "border-blue-200 bg-blue-50/80 text-blue-700 hover:bg-blue-50",
    icon: Clock3,
    shadow: "shadow-[0_12px_24px_-20px_rgba(37,99,235,0.68),inset_0_1px_0_rgba(255,255,255,0.78)]",
  },
  pendente: {
    cls: "border-orange-200 bg-orange-50/80 text-orange-600 hover:bg-orange-50",
    icon: Clock3,
    shadow: "shadow-[0_12px_24px_-20px_rgba(234,88,12,0.62),inset_0_1px_0_rgba(255,255,255,0.78)]",
  },
  bloqueado: {
    cls: "border-red-200 bg-red-50/85 text-red-600 hover:bg-red-50",
    icon: ShieldAlert,
    shadow: "shadow-[0_12px_24px_-20px_rgba(220,38,38,0.66),inset_0_1px_0_rgba(255,255,255,0.78)]",
  },
};

const documentTone: Record<DocumentStatus, { cls: string; icon: LucideIcon; shadow: string }> = {
  validado: clearanceTone.aprovado,
  pendente: clearanceTone.pendente,
  rejeitado: {
    cls: "border-red-200 bg-red-50/85 text-red-600 hover:bg-red-50",
    icon: AlertOctagon,
    shadow: "shadow-[0_12px_24px_-20px_rgba(220,38,38,0.66),inset_0_1px_0_rgba(255,255,255,0.78)]",
  },
};

const SHIP_STATUS: Record<ShipStatus, { label: string; cls: string; icon: LucideIcon }> = {
  transit:   { label: "Em rota",      cls: "border-blue-200 bg-blue-50/80 text-blue-700", icon: ShipWheel },
  anchored:  { label: "Fundeado",     cls: "border-orange-200 bg-orange-50/80 text-orange-600", icon: Clock3 },
  berthed:   { label: "Atracado",     cls: "border-blue-200 bg-blue-50/80 text-blue-700", icon: CircleDot },
  operating: { label: "Operando",     cls: "border-emerald-200 bg-emerald-50/80 text-emerald-700", icon: LoaderCircle },
  departing: { label: "Desatracando", cls: "border-slate-200 bg-slate-50/90 text-slate-600", icon: ShipWheel },
};

const RISK: Record<RiskLevel, { label: string; cls: string; icon: LucideIcon }> = {
  low:      { label: "Normal",  cls: "border-emerald-200 bg-emerald-50/80 text-emerald-700", icon: CheckCircle2 },
  medium:   { label: "Atenção", cls: "border-orange-200 bg-orange-50/80 text-orange-600", icon: Clock3 },
  high:     { label: "Alto",    cls: "border-orange-300 bg-orange-50/90 text-orange-700", icon: AlertOctagon },
  critical: { label: "Crítico", cls: "border-red-200 bg-red-50/85 text-red-600", icon: ShieldAlert },
};

function documentStatusLabel(status: DocumentStatus, language: "pt" | "en" | "zh") {
  const labels: Record<DocumentStatus, Record<"pt" | "en" | "zh", string>> = {
    validado: { pt: "Validado", en: "Validated", zh: "已验证" },
    pendente: { pt: "Pendente", en: "Pending", zh: "待处理" },
    rejeitado: { pt: "Rejeitado", en: "Rejected", zh: "已拒绝" },
  };
  return labels[status][language];
}

export function ShipStatusBadge({ status, compact = false, className }: { status: ShipStatus; compact?: boolean; className?: string }) {
  const t = useT();
  const s = SHIP_STATUS[status];
  const Icon = s.icon;
  return (
    <span className={cn(compact ? compactPillBase : pillBase, s.cls, className)}>
      <Icon className={compact ? compactIconClass : iconClass} strokeWidth={2.1} />
      {t(`status.ship.${status}`) || s.label}
    </span>
  );
}

export function ClearanceBadge({ status, compact = false, className }: { status: ClearanceStatus; compact?: boolean; className?: string }) {
  const t = useT();
  const s = clearanceTone[status];
  const Icon = s.icon;
  return (
    <span className={cn(compact ? compactPillBase : pillBase, s.cls, s.shadow, className)}>
      <Icon className={compact ? compactIconClass : iconClass} strokeWidth={2.1} />
      {t(`status.clearance.${status}`)}
    </span>
  );
}

export function DocumentStatusBadge({ status, compact = false, className }: { status: DocumentStatus; compact?: boolean; className?: string }) {
  const language = useLanguageCode();
  const s = documentTone[status];
  const Icon = s.icon;
  return (
    <span className={cn(compact ? compactPillBase : pillBase, s.cls, s.shadow, className)}>
      <Icon className={compact ? compactIconClass : iconClass} strokeWidth={2.1} />
      {documentStatusLabel(status, language)}
    </span>
  );
}

export function RiskBadge({ level, compact = false, className }: { level: RiskLevel; compact?: boolean; className?: string }) {
  const t = useT();
  const s = RISK[level];
  const Icon = s.icon;
  return (
    <span className={cn(compact ? compactPillBase : pillBase, s.cls, className)}>
      <Icon className={compact ? compactIconClass : iconClass} strokeWidth={2.1} />
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
