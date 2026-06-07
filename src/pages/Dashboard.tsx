import { Anchor, Hourglass, Ship, AlertTriangle, TrendingUp, TrendingDown, Sparkles, ChevronRight, type LucideIcon } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, BarChart, Bar, CartesianGrid } from "recharts";
import { ships, berths, alerts, kpiSeries } from "@/data/mockData";
import { ShipStatusBadge } from "@/components/StatusBadges";
import { Link } from "react-router-dom";
import { useProfile } from "@/store/profileStore";
import { PROFILES, type ProfileId } from "@/data/profiles";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { useLanguageCode, useT } from "@/i18n/useT";
import { analyzeFleet } from "@/lib/portopsAi";
import { useAssistant } from "@/store/assistantStore";
import { ShipLink } from "@/components/ShipLink";
import { SummaryMetricCard, SummaryMetricsPanel } from "@/components/SummaryMetrics";

const ROLE_INTRO: Record<ProfileId, { eyebrow: string; title: string; sub: string }> = {
  gestor_porto:    { eyebrow: "Autoridade Portuária · Tempo real", title: "Centro de Controle Portuário",        sub: "Visão consolidada de todos os atores e sistemas integrados." },
  fiscal_receita:  { eyebrow: "Receita Federal · Painel fiscal",    title: "Fiscalização Aduaneira",              sub: "Documentos fiscais, DI/DUE e liberações sob responsabilidade da Receita." },
  policia_federal: { eyebrow: "Polícia Federal · Controle",         title: "Segurança e Tripulação",              sub: "Controle de acesso, validações e medidas de segurança operacional." },
  fiscal_anvisa:   { eyebrow: "ANVISA · Painel sanitário",          title: "Vigilância Sanitária Portuária",      sub: "Cargas sensíveis, inspeções e liberações sanitárias." },
  fiscal_vigiagro: { eyebrow: "VIGIAGRO · Painel agropecuário",     title: "Vigilância Agropecuária",             sub: "Cargas vegetais, animais e certificados fitossanitários." },
  operador:        { eyebrow: "Terminal · Operação",                 title: "Operação do Terminal",                sub: "Atracação, equipamentos, pátio e produtividade." },
  agente:          { eyebrow: "Agência Marítima · Acompanhamento",   title: "Acompanhamento de Navios",            sub: "Seus navios, documentos enviados e status nos órgãos." },
  transportadora:  { eyebrow: "Logística · Rastreamento",            title: "Transporte e Coleta",                sub: "Janelas de retirada, status da carga e coordenação logística." },
  admin_portuaria: { eyebrow: "Administração Portuária",              title: "Gestão Administrativa",                sub: "Contratos, recursos, indicadores e planejamento do porto." },
  admin:           { eyebrow: "PortOps · Administração",             title: "Painel Administrativo",                sub: "Gestão de usuários, vínculos e permissões." },
};

interface KPIProps {
  label: string;
  value: number | string;
  unit?: string;
  trend?: { up: boolean; value: string };
  trendSuffix?: string;
  icon: LucideIcon;
  accent?: "primary" | "warning" | "info";
}

const metricAccent: Record<NonNullable<KPIProps["accent"]>, string> = {
  primary: "bg-[#eaf3ff] text-[#0759ce]",
  warning: "bg-[#fff4dd] text-[#d78716]",
  info: "bg-[#eaf7ff] text-[#1472c9]",
};

function MetricBlock({ label, value, unit, trend, trendSuffix = "vs ontem", icon: Icon, accent = "primary" }: KPIProps) {
  return (
    <SummaryMetricCard className="flex min-w-0 items-center gap-3 px-4 py-3">
      <div className={`grid h-11 w-11 shrink-0 place-items-center rounded-full ${metricAccent[accent]} shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]`}>
        <Icon className="h-5 w-5" strokeWidth={1.9} />
      </div>
      <div className="min-w-0">
        <div className="text-[0.66rem] uppercase tracking-[0.12em] text-[#405672] font-semibold">{label}</div>
        <div className="mt-0.5 flex items-baseline gap-1.5">
          <span className="text-[1.55rem] font-bold font-mono tracking-tight text-[#102a4c]">{value}</span>
          {unit && <span className="text-xs text-[#53687f]">{unit}</span>}
        </div>
        {trend && (
          <div className={`mt-0.5 flex items-center gap-1 text-[10px] font-semibold ${trend.up ? "text-success" : "text-destructive"}`}>
            {trend.up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {trend.value} <span className="font-normal text-muted-foreground">{trendSuffix}</span>
          </div>
        )}
      </div>
    </SummaryMetricCard>
  );
}

function OccupancyGauge({ value, label, trendSuffix }: { value: number; label: string; trendSuffix: string }) {
  const normalized = Math.min(100, Math.max(0, value));

  return (
    <SummaryMetricCard className="flex items-center justify-center gap-4 px-4 py-3">
      <div className="relative h-20 w-32">
        <svg viewBox="0 0 140 82" className="h-full w-full overflow-visible">
          <path d="M18 70a52 52 0 0 1 104 0" fill="none" stroke="hsl(214 42% 84%)" strokeWidth="11" strokeLinecap="round" />
          <path
            d="M18 70a52 52 0 0 1 104 0"
            fill="none"
            stroke="#0759ce"
            strokeWidth="11"
            strokeLinecap="round"
            pathLength="100"
            strokeDasharray={`${normalized} 100`}
            className="drop-shadow-[0_8px_12px_rgba(7,89,206,0.18)]"
          />
        </svg>
        <div className="absolute inset-x-0 bottom-1 text-center">
          <span className="font-mono text-2xl font-bold tracking-[-0.05em] text-[#102a4c]">{value}</span>
          <span className="ml-0.5 text-xs font-semibold">%</span>
        </div>
      </div>
      <div className="min-w-0">
        <div className="text-[0.66rem] uppercase tracking-[0.12em] text-[#405672] font-semibold">{label}</div>
        <div className="mt-1.5 flex items-center gap-1 text-[10px] font-semibold text-success">
          <TrendingUp className="h-3 w-3" /> +5% <span className="font-normal text-muted-foreground">{trendSuffix}</span>
        </div>
      </div>
    </SummaryMetricCard>
  );
}

const tooltipStyle = {
  backgroundColor: "hsl(var(--popover))",
  border: "1px solid hsl(var(--border))",
  borderRadius: 8,
  fontSize: 12,
  fontFamily: "Noto Sans",
};

export default function Dashboard() {
  const { current } = useProfile();
  const profile = current ? PROFILES[current] : null;
  const intro = current ? ROLE_INTRO[current] : ROLE_INTRO.gestor_porto;
  const t = useT();
  const language = useLanguageCode();
  const { openReport, openAssistant } = useAssistant();
  const aiFleet = useMemo(() => analyzeFleet(language).slice(0, 3), [language]);

  const operating = ships.filter((s) => s.status === "operating" || s.status === "berthed").length;
  const queue = ships.filter((s) => s.status === "anchored").length;
  const transit = ships.filter((s) => s.status === "transit").length;
  const occupied = berths.filter((b) => b.status === "ocupado").length;

  const recentShips = [...ships].sort((a, b) => +new Date(a.eta) - +new Date(b.eta)).slice(0, 6);
  const criticalAlerts = alerts.filter((a) => a.severity !== "info").slice(0, 4);
  const sessionLabel = language === "pt" ? "Sessão ativa" : language === "en" ? "Active session" : "当前会话";
  const trendLabel = language === "pt" ? "vs ontem" : language === "en" ? "vs yesterday" : "较昨日";

  const occupancy = Math.round((occupied / berths.length) * 100);

  return (
    <div className="mx-auto max-w-[1440px] p-5 lg:p-6 space-y-5 animate-fade-in">
      <div className="flex items-start justify-between gap-5">
        <div className="max-w-[48rem]">
          <div className="mb-1.5 text-[0.68rem] font-mono uppercase tracking-[0.28em] text-[#0759ce]">{intro.eyebrow}</div>
          <h1 className="text-[2rem] font-bold leading-[1.02] tracking-[-0.045em] text-[#09254a]">{intro.title}</h1>
          <p className="mt-2 max-w-[60ch] text-[0.94rem] leading-6 text-[#4b5f7a]">{intro.sub}</p>
        </div>
        {profile && (
          <div className="hidden min-w-[12rem] rounded-[0.95rem] border border-[#b8d3f1] bg-white/90 px-4 py-3 text-right shadow-[0_22px_48px_-32px_rgba(20,70,132,0.48)] xl:block">
            <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground">{sessionLabel}</div>
            <div className="mt-1.5 text-sm font-semibold text-[#102a4c]">{profile.name}</div>
            <div className="mt-1 text-xs text-[#0759ce]">{profile.org}</div>
          </div>
        )}
      </div>

      <SummaryMetricsPanel
        gridClassName="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-[1fr_1fr_1fr_1.2fr]"
        header={
          <div className="flex items-center justify-between">
          <div className="text-[0.76rem] font-bold uppercase tracking-[0.12em] text-[#0759ce]">
            {language === "pt" ? "Panorama operacional" : language === "en" ? "Operational overview" : "运营概览"}
          </div>
          <Anchor className="h-5 w-5 text-[#0759ce]" strokeWidth={1.9} />
          </div>
        }
      >
        <MetricBlock label={language === "pt" ? "Navios em operação" : language === "en" ? "Operating vessels" : "运营船舶"} value={operating} unit={language === "pt" ? "ativos" : language === "en" ? "active" : "正常"} icon={Ship} trend={{ up: true, value: "+12%" }} trendSuffix={trendLabel} accent="primary" />
        <MetricBlock label={language === "pt" ? "Fila de fundeio" : language === "en" ? "Anchorage queue" : "锚地排队"} value={queue} unit={language === "pt" ? "aguardando" : language === "en" ? "waiting" : "等待"} icon={Hourglass} trend={{ up: false, value: "-8%" }} trendSuffix={trendLabel} accent="warning" />
        <MetricBlock label={language === "pt" ? "Em rota (24h)" : language === "en" ? "In transit (24h)" : "24 小时航行中"} value={transit} unit={language === "pt" ? "navios" : "ships"} icon={Anchor} accent="info" />
        <OccupancyGauge value={occupancy} label={language === "pt" ? "Ocupação de berços" : language === "en" ? "Berth occupancy" : "泊位占用"} trendSuffix={trendLabel} />
      </SummaryMetricsPanel>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_28rem]">
        <section className="risk-panel p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-[0.72rem] font-mono uppercase tracking-[0.3em] text-red-600">
                {language === "pt" ? "IA Preditiva" : language === "en" ? "Predictive AI" : "预测AI"}
              </div>
              <div className="mt-2 text-lg font-semibold tracking-[-0.03em] text-[#102a4c]">
                {language === "pt" ? "Riscos críticos em monitoramento ativo" : language === "en" ? "Critical risks under active monitoring" : "关键风险正在监控"}
              </div>
              <p className="mt-2 max-w-[54ch] text-sm leading-6 text-[#51647f]">
                {language === "pt"
                  ? "A IA classifica navios por probabilidade de atraso, clima e gargalos operacionais."
                  : language === "en"
                    ? "AI ranks vessels by delay probability, weather and operational bottlenecks."
                    : "AI 会按延误概率、天气和运营瓶颈对船舶排序。"}
              </p>
            </div>
            <Button onClick={() => openReport()} className="hidden rounded-full px-4 py-4 text-sm danger-action md:inline-flex">
              <Sparkles className="h-4 w-4" />
              {t("assistant.reports")}
            </Button>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            {aiFleet.map((item) => (
              <div key={item.shipId} className="group relative overflow-hidden rounded-[0.95rem] border border-red-100 bg-white/90 p-4 shadow-[0_22px_42px_-34px_rgba(176,34,34,0.5)] transition duration-300 hover:-translate-y-0.5 hover:border-red-200">
                <div className="flex items-center gap-2 text-[0.66rem] font-semibold uppercase tracking-[0.12em] text-red-600">
                  <AlertTriangle className="h-4 w-4" /> {item.priority}
                </div>
                <div className="mt-3 text-base font-semibold tracking-[-0.03em] text-[#102a4c]">
                  <ShipLink shipId={item.shipId} className="text-[#102a4c] no-underline hover:text-[#0759ce]">
                    {item.shipName}
                  </ShipLink>
                </div>
                <div className="mt-3 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-[#53687f]">
                    <span>{language === "pt" ? "Atraso" : language === "en" ? "Delay" : "延误"}</span>
                    <span className="rounded-lg border border-red-200 bg-red-50 px-3 py-1 font-mono font-bold text-red-600">{item.delayProbability}%</span>
                  </div>
                  <div className="flex items-center justify-between text-[#53687f]">
                    <span>{language === "pt" ? "Clima" : language === "en" ? "Weather" : "天气"}</span>
                    <span className="rounded-lg border border-orange-200 bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-600">{item.climateRisk}</span>
                  </div>
                  <div className="flex items-center justify-between text-[#53687f]">
                    <span>{language === "pt" ? "Liberação" : language === "en" ? "Release" : "放行"}</span>
                    <span className="rounded-lg border border-blue-100 bg-blue-50 px-3 py-1 font-mono text-xs font-semibold text-[#102a4c]">{item.estimatedReleaseHours}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="premium-panel p-5">
          <div className="flex items-start gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#edf6ff] text-[#0759ce]">
              <Sparkles className="h-5 w-5" strokeWidth={1.9} />
            </div>
            <div>
              <div className="text-lg font-semibold tracking-[-0.03em] text-[#102a4c]">
                {language === "pt" ? "Assistente operacional" : language === "en" ? "Operational assistant" : "运营助手"}
              </div>
              <p className="mt-1.5 text-sm leading-6 text-[#53687f]">
                {language === "pt"
                  ? "Abra o assistente para perguntar sobre navios, riscos, documentos ou clima."
                  : language === "en"
                    ? "Open the assistant to ask about vessels, risks, documents or weather."
                    : "打开助手，查询船舶、风险、文件或天气。"}
              </p>
            </div>
          </div>
          <Button onClick={() => openAssistant()} className="mt-4 w-full rounded-[0.85rem] py-5 text-sm primary-action">
            <Sparkles className="h-4 w-4" />
            {t("assistant.chat")}
          </Button>
          <div className="mt-4 space-y-2.5">
            {aiFleet.map((item) => (
              <ShipLink key={item.shipId} shipId={item.shipId} className="group flex items-center gap-3 rounded-[0.8rem] border border-[#cbd9ea] bg-white/90 p-3 text-[#102a4c] no-underline shadow-[0_18px_34px_-30px_rgba(20,70,132,0.5)] transition duration-300 hover:-translate-y-0.5 hover:border-[#9fc7f2] hover:bg-white">
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#edf6ff] text-[#0759ce]">
                  <Ship className="h-4 w-4" strokeWidth={1.9} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold tracking-[-0.02em]">{item.shipName}</div>
                  <div className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-[#53687f]">
                    {language === "pt" ? "Próxima ação" : language === "en" ? "Next action" : "下一步"}: {item.nextAction}
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-[#12345a] transition-transform group-hover:translate-x-0.5" />
              </ShipLink>
            ))}
          </div>
        </section>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="premium-panel p-4 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-sm font-semibold">{language === "pt" ? "Tempo médio de espera (h) · 24h" : language === "en" ? "Average waiting time (h) · 24h" : "平均等待时间（小时）· 24h"}</div>
              <div className="text-xs text-muted-foreground">{language === "pt" ? "Demurrage estimada por hora — meta < 12h" : language === "en" ? "Estimated demurrage per hour — target < 12h" : "每小时预估滞期费 - 目标 < 12h"}</div>
            </div>
            <span className="text-xs font-mono text-success">▼ 18% {language === "pt" ? "vs semana" : language === "en" ? "vs week" : "较上周"}</span>
          </div>
          <ResponsiveContainer width="100%" height={190}>
            <AreaChart data={kpiSeries}>
              <defs>
                <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="hora" stroke="hsl(var(--muted-foreground))" fontSize={11} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
              <Tooltip contentStyle={tooltipStyle} />
              <Area type="monotone" dataKey="espera" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#g1)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="premium-panel p-4">
          <div className="text-sm font-semibold mb-1">{language === "pt" ? "Throughput / hora" : language === "en" ? "Throughput / hour" : "每小时吞吐量"}</div>
          <div className="text-xs text-muted-foreground mb-4">{language === "pt" ? "Movimentação consolidada (TEU/h)" : language === "en" ? "Consolidated movement (TEU/h)" : "综合吞吐量（TEU/h）"}</div>
          <ResponsiveContainer width="100%" height={190}>
            <BarChart data={kpiSeries}>
              <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="hora" stroke="hsl(var(--muted-foreground))" fontSize={10} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="throughput" fill="hsl(var(--accent))" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="premium-panel overflow-hidden lg:col-span-2">
          <div className="p-4 border-b border-[#d5e2f1] flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold">{language === "pt" ? "Próximas operações" : language === "en" ? "Upcoming operations" : "即将进行的作业"}</div>
              <div className="text-xs text-muted-foreground">{language === "pt" ? "Por ETA — próximos navios" : language === "en" ? "By ETA — next vessels" : "按 ETA 排序 - 下一批船舶"}</div>
            </div>
            <Link to="/mapa" className="text-xs font-mono text-primary hover:underline">{language === "pt" ? "VER MAPA" : language === "en" ? "VIEW MAP" : "查看地图"} →</Link>
          </div>
          <table className="w-full text-sm">
            <thead className="text-[10px] uppercase tracking-wider text-muted-foreground font-mono">
              <tr className="border-b border-border">
                <th className="text-left px-4 py-2">{language === "pt" ? "Navio" : language === "en" ? "Vessel" : "船舶"}</th>
                <th className="text-left px-2 py-2">{language === "pt" ? "Tipo" : language === "en" ? "Type" : "类型"}</th>
                <th className="text-left px-2 py-2">{language === "pt" ? "Status" : language === "en" ? "Status" : "状态"}</th>
                <th className="text-left px-2 py-2">{language === "pt" ? "Berço" : language === "en" ? "Berth" : "泊位"}</th>
                <th className="text-right px-4 py-2">ETA</th>
              </tr>
            </thead>
            <tbody>
              {recentShips.map((s) => (
                <tr key={s.id} className="border-b border-[#dce6f2]/80 hover:bg-[#f4f8fd]">
                  <td className="px-4 py-2.5">
                    <div className="font-medium">
                      <ShipLink shipId={s.id} className="font-medium text-foreground no-underline hover:text-primary">
                        {s.name}
                      </ShipLink>
                    </div>
                    <div className="text-[11px] text-muted-foreground font-mono">IMO {s.imo}</div>
                  </td>
                  <td className="px-2 py-2.5 text-muted-foreground text-xs">{s.type}</td>
                  <td className="px-2 py-2.5"><ShipStatusBadge status={s.status} /></td>
                  <td className="px-2 py-2.5 font-mono text-xs">{s.berthId ?? "—"}</td>
                  <td className="px-4 py-2.5 text-right font-mono text-xs text-muted-foreground">{new Date(s.eta).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="premium-panel overflow-hidden">
          <div className="p-4 border-b border-[#d5e2f1] flex items-center justify-between">
            <div className="text-sm font-semibold flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-destructive" /> {language === "pt" ? "Alertas críticos" : language === "en" ? "Critical alerts" : "关键警报"}
            </div>
            <Link to="/alertas" className="text-xs font-mono text-primary hover:underline">{language === "pt" ? "TODOS" : language === "en" ? "ALL" : "全部"} →</Link>
          </div>
          <div className="divide-y divide-border">
            {criticalAlerts.map((a) => (
              <div key={a.id} className={`p-3.5 hover:bg-[#f4f8fd] ${a.severity === "critical" ? "bg-red-50/70" : ""}`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`h-2.5 w-2.5 rounded-full ${a.severity === "critical" ? "bg-destructive shadow-[0_0_0_6px_rgba(220,38,38,0.12)]" : "bg-warning"}`} />
                  <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">{a.source}</span>
                </div>
                <div className="text-sm font-medium leading-snug">{a.title}</div>
                <div className="text-xs text-muted-foreground mt-1 line-clamp-2">{a.description}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
