import { useMemo, useState } from "react";
import { ships, type ClearanceAgency, type ClearanceStatus } from "@/data/mockData";
import { ClearanceBadge } from "@/components/StatusBadges";
import { ShieldCheck, Filter } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useLanguageCode } from "@/i18n/useT";
import { ShipLink } from "@/components/ShipLink";
import { SummaryMetricCard, SummaryMetricsPanel } from "@/components/SummaryMetrics";

const AGENCIES: ClearanceAgency[] = ["Receita Federal", "ANVISA", "Polícia Federal", "VIGIAGRO"];

type ClearanceTarget = {
  shipId: string;
  agency: ClearanceAgency;
  status: ClearanceStatus;
};

type ClearanceDetail = {
  reason: string;
  agency: string;
  history: string[];
  date: string;
  nextAction: string;
  observations: string;
  shipLabel: string;
};

export default function Liberacoes() {
  const language = useLanguageCode();
  const locale = language === "pt" ? "pt-BR" : language === "en" ? "en-US" : "zh-CN";
  const [filter, setFilter] = useState<ClearanceStatus | "all">("all");
  const [selected, setSelected] = useState<ClearanceTarget | null>(null);
  const matches = (st: ClearanceStatus) => filter === "all" || filter === st;

  const counts = ships.reduce((acc, s) => {
    s.clearances.forEach((c) => { acc[c.status] = (acc[c.status] ?? 0) + 1; });
    return acc;
  }, {} as Record<string, number>);

  const selectedDetail = useMemo(() => {
    if (!selected) return null;
    const ship = ships.find((s) => s.id === selected.shipId);
    const clearance = ship?.clearances.find((c) => c.agency === selected.agency);
    if (!ship || !clearance) return null;
    return buildDetail(ship, clearance.status, clearance.agency, clearance.updatedAt, clearance.note, language);
  }, [selected, language]);

  const openSummary = (status: ClearanceStatus) => {
    const match = ships.flatMap((ship) => ship.clearances.map((clearance) => ({ ship, clearance }))).find((item) => item.clearance.status === status);
    if (!match) return;
    setSelected({ shipId: match.ship.id, agency: match.clearance.agency, status: match.clearance.status });
  };

  return (
    <div className="mx-auto max-w-[1440px] p-6 lg:p-8 animate-fade-in space-y-6">
      <div>
        <div className="text-[11px] font-mono uppercase tracking-[0.25em] text-primary mb-1">
          {language === "pt" ? "Core · Integração entre órgãos" : language === "en" ? "Core · Agency integration" : "核心 · 机构集成"}
        </div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          {language === "pt" ? "Matriz de Liberações" : language === "en" ? "Clearance Matrix" : "放行矩阵"} <ShieldCheck className="h-6 w-6 text-primary" />
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {language === "pt"
            ? "Status compartilhado entre Receita, ANVISA, PF e VIGIAGRO. Decisões visíveis a todos os atores em tempo real."
            : language === "en"
              ? "Shared status across Customs, ANVISA, Federal Police and VIGIAGRO. Decisions visible to all actors in real time."
              : "海关、ANVISA、联邦警察和 VIGIAGRO 之间共享状态。所有参与方可实时查看决策。"}
        </p>
      </div>

      <SummaryMetricsPanel>
          {[
          { st: "aprovado", label: language === "pt" ? "Aprovados" : language === "en" ? "Approved" : "已批准", cls: "text-emerald-700 border-emerald-200 bg-emerald-50/80" },
          { st: "em_analise", label: language === "pt" ? "Em análise" : language === "en" ? "Under review" : "审核中", cls: "text-blue-700 border-blue-200 bg-blue-50/80" },
          { st: "pendente", label: language === "pt" ? "Pendentes" : language === "en" ? "Pending" : "待处理", cls: "text-orange-600 border-orange-200 bg-orange-50/80" },
          { st: "bloqueado", label: language === "pt" ? "Bloqueados" : language === "en" ? "Blocked" : "已阻止", cls: "text-red-600 border-red-200 bg-red-50/85" },
        ].map((x) => (
          <SummaryMetricCard key={x.st} as="button" onClick={() => openSummary(x.st as ClearanceStatus)}
            className={`${x.cls} ${filter === x.st ? "ring-2 ring-primary/50" : ""}`}>
            <div className="text-[10px] font-mono uppercase tracking-wider text-foreground opacity-80">{x.label}</div>
            <div className="text-2xl font-bold font-mono mt-1 text-[#102a4c]">{counts[x.st] ?? 0}</div>
          </SummaryMetricCard>
        ))}
      </SummaryMetricsPanel>

      <div className="premium-panel overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div className="text-sm font-semibold">{language === "pt" ? "Matriz Navio × Órgão" : language === "en" ? "Vessel × Agency matrix" : "船舶 × 机构矩阵"}</div>
          <div className="flex items-center gap-2">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as ClearanceStatus | "all")}
              className="rounded-lg border border-border bg-secondary/70 px-3 py-2 text-xs font-mono uppercase tracking-wider"
            >
              <option value="all">{language === "pt" ? "Todos" : language === "en" ? "All" : "全部"}</option>
              <option value="aprovado">{language === "pt" ? "Aprovados" : language === "en" ? "Approved" : "已批准"}</option>
              <option value="em_analise">{language === "pt" ? "Em análise" : language === "en" ? "Under review" : "审核中"}</option>
              <option value="pendente">{language === "pt" ? "Pendentes" : language === "en" ? "Pending" : "待处理"}</option>
              <option value="bloqueado">{language === "pt" ? "Bloqueados" : language === "en" ? "Blocked" : "已阻止"}</option>
            </select>
            {filter !== "all" && (
              <button onClick={() => setFilter("all")} className="text-xs font-mono text-primary flex items-center gap-1">
                <Filter className="h-3 w-3" /> {language === "pt" ? "Limpar" : language === "en" ? "Clear" : "清除"}
              </button>
            )}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-[10px] uppercase tracking-wider text-muted-foreground font-mono">
                <th className="text-left px-5 py-3 sticky left-0 bg-white/95">{language === "pt" ? "Navio" : language === "en" ? "Vessel" : "船舶"}</th>
                {AGENCIES.map((a) => (
                  <th key={a} className="text-center px-3 py-3 min-w-[140px]">{a}</th>
                ))}
                <th className="text-center px-3 py-3">{language === "pt" ? "Progresso" : language === "en" ? "Progress" : "进度"}</th>
              </tr>
            </thead>
            <tbody>
              {ships.map((s) => {
                const approved = s.clearances.filter((c) => c.status === "aprovado").length;
                const pct = (approved / s.clearances.length) * 100;
                return (
                  <tr key={s.id} className="border-b border-border/50 hover:bg-secondary/20">
                    <td className="px-5 py-3 sticky left-0 bg-white/95">
                      <div className="font-medium">
                        <ShipLink shipId={s.id} className="font-medium text-foreground no-underline hover:text-primary">
                          {s.flag} {s.name}
                        </ShipLink>
                      </div>
                      <div className="text-[11px] text-muted-foreground font-mono">IMO {s.imo}</div>
                    </td>
                    {AGENCIES.map((a) => {
                      const c = s.clearances.find((x) => x.agency === a)!;
                      const dim = !matches(c.status);
                      return (
                        <td key={a} className={`px-3 py-3 text-center transition-opacity ${dim ? "opacity-25" : ""}`}>
                          <button
                            type="button"
                            onClick={() => setSelected({ shipId: s.id, agency: a, status: c.status })}
                            className="inline-flex"
                          >
                            <ClearanceBadge status={c.status} />
                          </button>
                          {c.note && <div className="text-[10px] text-muted-foreground mt-1 italic max-w-[160px] mx-auto">{c.note}</div>}
                        </td>
                      );
                    })}
                    <td className="px-3 py-3 min-w-[120px]">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 rounded-full bg-secondary overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-primary to-success" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-[11px] font-mono text-muted-foreground">{approved}/4</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={!!selectedDetail} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-w-2xl border-border bg-[linear-gradient(180deg,#f9fbff_0%,#eef4fb_100%)]">
          {selectedDetail && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-2xl">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                  {language === "pt" ? "Detalhe da liberação" : language === "en" ? "Clearance details" : "放行详情"}
                </DialogTitle>
                <DialogDescription>
                  {selectedDetail.shipLabel} · {selectedDetail.agency}
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 md:grid-cols-2">
                <DetailCard label={language === "pt" ? "Motivo" : language === "en" ? "Reason" : "原因"} value={selectedDetail.reason} />
                <DetailCard label={language === "pt" ? "Órgão responsável" : language === "en" ? "Responsible agency" : "负责机构"} value={selectedDetail.agency} />
                <DetailCard label={language === "pt" ? "Data" : language === "en" ? "Date" : "日期"} value={selectedDetail.date} />
                <DetailCard label={language === "pt" ? "Próxima ação" : language === "en" ? "Next action" : "下一步"} value={selectedDetail.nextAction} />
              </div>

              <div className="rounded-2xl border border-border bg-white p-4">
                <div className="text-[10px] font-mono uppercase tracking-[0.22em] text-muted-foreground">{language === "pt" ? "Histórico" : language === "en" ? "History" : "历史"}</div>
                <ul className="mt-3 space-y-2 text-sm text-foreground">
                  {selectedDetail.history.map((item) => (
                    <li key={item} className="flex gap-2">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-2xl border border-border bg-secondary/30 p-4">
                <div className="text-[10px] font-mono uppercase tracking-[0.22em] text-muted-foreground">{language === "pt" ? "Observações" : language === "en" ? "Notes" : "备注"}</div>
                <p className="mt-2 text-sm leading-6 text-foreground">{selectedDetail.observations}</p>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function buildDetail(
  ship: (typeof ships)[number],
  status: ClearanceStatus,
  agency: string,
  updatedAt: string,
  note?: string,
  language: "pt" | "en" | "zh" = "pt",
): ClearanceDetail {
  const locale = language === "pt" ? "pt-BR" : language === "en" ? "en-US" : "zh-CN";
  const statusReason: Record<ClearanceStatus, string> = {
    aprovado:
      language === "pt"
        ? `${agency} concluiu a análise e liberou a operação.`
        : language === "en"
          ? `${agency} completed the review and released the operation.`
          : `${agency} 已完成审核并放行该操作。`,
    em_analise:
      language === "pt"
        ? `${agency} está revisando a documentação e validando os dados recebidos.`
        : language === "en"
          ? `${agency} is reviewing documentation and validating the submitted data.`
          : `${agency} 正在审核文件并核验提交的数据。`,
    pendente:
      language === "pt"
        ? `${agency} ainda aguarda documentação complementar ou confirmação de campo.`
        : language === "en"
          ? `${agency} is still waiting for supporting documents or field confirmation.`
          : `${agency} 仍在等待补充文件或现场确认。`,
    bloqueado:
      language === "pt"
        ? `${agency} identificou inconsistência crítica e bloqueou a liberação.`
        : language === "en"
          ? `${agency} identified a critical inconsistency and blocked the clearance.`
          : `${agency} 发现严重不一致并阻止了放行。`,
  };

  const nextAction: Record<ClearanceStatus, string> = {
    aprovado:
      language === "pt"
        ? "Manter monitoramento e liberar a próxima etapa operacional."
        : language === "en"
          ? "Keep monitoring and release the next operational stage."
          : "继续监控并放行下一步作业阶段。",
    em_analise:
      language === "pt"
        ? "Aguardar retorno do órgão e manter o navio em observação."
        : language === "en"
          ? "Await the agency response and keep the vessel under watch."
          : "等待机构回复，并继续关注该船舶。",
    pendente:
      language === "pt"
        ? "Reenviar documentação faltante e acionar o responsável institucional."
        : language === "en"
          ? "Resend missing documents and notify the institutional owner."
          : "重新提交缺失文件并通知机构负责人。",
    bloqueado:
      language === "pt"
        ? "Corrigir a divergência e reabrir a solicitação com o órgão responsável."
        : language === "en"
          ? "Fix the discrepancy and reopen the request with the responsible agency."
          : "修正差异并向负责机构重新发起申请。",
  };

  return {
    reason: statusReason[status],
    agency,
    history: [
      language === "pt"
        ? `${agency} atualizado em ${new Date(updatedAt).toLocaleString(locale)}.`
        : language === "en"
          ? `${agency} updated on ${new Date(updatedAt).toLocaleString(locale)}.`
          : `${agency} 更新于 ${new Date(updatedAt).toLocaleString(locale)}。`,
      language === "pt"
        ? `${ship.flag} ${ship.name} vinculado ao processo ${ship.imo}.`
        : language === "en"
          ? `${ship.flag} ${ship.name} linked to process ${ship.imo}.`
          : `${ship.flag} ${ship.name} 已关联到流程 ${ship.imo}。`,
      note
        ? language === "pt"
          ? `Observação de campo: ${note}`
          : language === "en"
            ? `Field note: ${note}`
            : `现场备注：${note}`
        : language === "pt"
          ? "Sem observações adicionais registradas."
          : language === "en"
            ? "No additional notes recorded."
            : "没有记录额外备注。",
    ],
    date: new Date(updatedAt).toLocaleString(locale),
    nextAction: nextAction[status],
    observations:
      note ??
      (language === "pt"
        ? "Sem observações adicionais."
        : language === "en"
          ? "No additional notes."
          : "没有额外备注。"),
    shipLabel: `${ship.flag} ${ship.name}`,
  };
}

function DetailCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-white p-4">
      <div className="text-[10px] font-mono uppercase tracking-[0.22em] text-muted-foreground">{label}</div>
      <div className="mt-2 text-sm leading-6 text-foreground">{value}</div>
    </div>
  );
}
