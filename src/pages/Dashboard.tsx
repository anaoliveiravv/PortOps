import { Anchor, Hourglass, Ship, AlertTriangle, TrendingUp, TrendingDown, Sparkles, type LucideIcon } from "lucide-react";
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

function KPI({ label, value, unit, trend, trendSuffix = "vs ontem", icon: Icon, accent = "primary" }: KPIProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 relative overflow-hidden group hover:border-primary/40 transition-colors">
      <div className={`absolute -right-6 -top-6 h-24 w-24 rounded-full bg-${accent}/5 blur-2xl`} />
      <div className="flex items-start justify-between mb-3 relative">
        <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-mono">{label}</div>
        <Icon className={`h-4 w-4 text-${accent}`} />
      </div>
      <div className="flex items-baseline gap-1.5 relative">
        <span className="text-3xl font-bold font-mono tracking-tight">{value}</span>
        {unit && <span className="text-xs text-muted-foreground font-mono">{unit}</span>}
      </div>
      {trend && (
        <div className={`mt-2 flex items-center gap-1 text-[11px] font-mono ${trend.up ? "text-success" : "text-destructive"}`}>
          {trend.up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
          {trend.value} <span className="text-muted-foreground">{trendSuffix}</span>
        </div>
      )}
    </div>
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

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="text-[11px] font-mono uppercase tracking-[0.25em] text-primary mb-1">{intro.eyebrow}</div>
          <h1 className="text-3xl font-bold tracking-tight">{intro.title}</h1>
          <p className="text-sm text-muted-foreground mt-1">{intro.sub}</p>
        </div>
        {profile && (
          <div className="rounded-lg border border-border bg-card/60 px-4 py-2.5 text-right">
            <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">{sessionLabel}</div>
            <div className="text-sm font-semibold">{profile.name}</div>
            <div className="text-[11px] font-mono text-primary/80">{profile.org}</div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPI label={language === "pt" ? "Navios em operação" : language === "en" ? "Operating vessels" : "运营船舶"} value={operating} unit={language === "pt" ? "ativos" : language === "en" ? "active" : "正常"} icon={Anchor} trend={{ up: true, value: "+12%" }} trendSuffix={trendLabel} accent="primary" />
        <KPI label={language === "pt" ? "Fila de fundeio" : language === "en" ? "Anchorage queue" : "锚地排队"} value={queue} unit={language === "pt" ? "aguardando" : language === "en" ? "waiting" : "等待"} icon={Hourglass} trend={{ up: false, value: "−8%" }} trendSuffix={trendLabel} accent="warning" />
        <KPI label={language === "pt" ? "Em rota (24h)" : language === "en" ? "In transit (24h)" : "24 小时航行中"} value={transit} unit={language === "pt" ? "navios" : "ships"} icon={Ship} accent="info" />
        <KPI label={language === "pt" ? "Ocupação de berços" : language === "en" ? "Berth occupancy" : "泊位占用"} value={`${Math.round((occupied / berths.length) * 100)}`} unit="%" icon={Anchor} trend={{ up: true, value: "+5%" }} trendSuffix={trendLabel} accent="primary" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-5 lg:col-span-2">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-[10px] font-mono uppercase tracking-[0.25em] text-destructive/90">
                {language === "pt" ? "IA Preditiva" : language === "en" ? "Predictive AI" : "预测AI"}
              </div>
              <div className="mt-1 text-lg font-semibold text-foreground">
                {language === "pt" ? "Riscos críticos em monitoramento ativo" : language === "en" ? "Critical risks under active monitoring" : "关键风险正在监控"}
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                {language === "pt"
                  ? "A IA classifica navios por probabilidade de atraso, clima e gargalos operacionais."
                  : language === "en"
                    ? "AI ranks vessels by delay probability, weather and operational bottlenecks."
                    : "AI 会按延误概率、天气和运营瓶颈对船舶排序。"}
              </p>
            </div>
            <Button onClick={() => openReport()} className="rounded-full bg-destructive px-4 text-white hover:bg-destructive/90">
              <Sparkles className="h-4 w-4" />
              {t("assistant.reports")}
            </Button>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {aiFleet.map((item) => (
              <div key={item.shipId} className="rounded-2xl border border-border bg-white p-4 shadow-sm">
                <div className="text-[10px] font-mono uppercase tracking-[0.22em] text-muted-foreground">{item.priority}</div>
                <div className="mt-1 text-sm font-semibold text-foreground">
                  <ShipLink shipId={item.shipId} className="font-semibold text-foreground no-underline hover:text-primary">
                    {item.shipName}
                  </ShipLink>
                </div>
                <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                  <span>{language === "pt" ? "Atraso" : language === "en" ? "Delay" : "延误"}</span>
                  <span className="font-mono font-semibold text-destructive">{item.delayProbability}%</span>
                </div>
                <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                  <span>{language === "pt" ? "Clima" : language === "en" ? "Weather" : "天气"}</span>
                  <span className="font-semibold text-foreground">{item.climateRisk}</span>
                </div>
                <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                  <span>{language === "pt" ? "Liberação" : language === "en" ? "Release" : "放行"}</span>
                  <span className="font-semibold text-foreground">{item.estimatedReleaseHours}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <div className="text-sm font-semibold mb-1">
            {language === "pt" ? "Assistente operacional" : language === "en" ? "Operational assistant" : "运营助手"}
          </div>
          <div className="text-xs text-muted-foreground">
            {language === "pt"
              ? "Abra o assistente para perguntar sobre navios, riscos, documentos ou clima."
              : language === "en"
                ? "Open the assistant to ask about vessels, risks, documents or weather."
                : "打开助手，查询船舶、风险、文件或天气。"}
          </div>
          <Button onClick={() => openAssistant()} className="mt-4 w-full rounded-full bg-[#1351b4] hover:bg-[#0f469a]">
            <Sparkles className="h-4 w-4" />
            {t("assistant.chat")}
          </Button>
          <div className="mt-4 space-y-2">
            {aiFleet.map((item) => (
              <div key={item.shipId} className="rounded-xl border border-border bg-secondary/30 p-3 text-sm hover:border-primary/30">
                <div className="font-semibold">
                  <ShipLink shipId={item.shipId} className="font-semibold text-foreground no-underline hover:text-primary">
                    {item.shipName}
                  </ShipLink>
                </div>
                <div className="text-[11px] text-muted-foreground">
                  {language === "pt" ? "Próxima ação" : language === "en" ? "Next action" : "下一步"}: {item.nextAction}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-sm font-semibold">{language === "pt" ? "Tempo médio de espera (h) · 24h" : language === "en" ? "Average waiting time (h) · 24h" : "平均等待时间（小时）· 24h"}</div>
              <div className="text-xs text-muted-foreground">{language === "pt" ? "Demurrage estimada por hora — meta < 12h" : language === "en" ? "Estimated demurrage per hour — target < 12h" : "每小时预估滞期费 - 目标 < 12h"}</div>
            </div>
            <span className="text-xs font-mono text-success">▼ 18% {language === "pt" ? "vs semana" : language === "en" ? "vs week" : "较上周"}</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
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

        <div className="rounded-xl border border-border bg-card p-5">
          <div className="text-sm font-semibold mb-1">{language === "pt" ? "Throughput / hora" : language === "en" ? "Throughput / hour" : "每小时吞吐量"}</div>
          <div className="text-xs text-muted-foreground mb-4">{language === "pt" ? "Movimentação consolidada (TEU/h)" : language === "en" ? "Consolidated movement (TEU/h)" : "综合吞吐量（TEU/h）"}</div>
          <ResponsiveContainer width="100%" height={220}>
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
        <div className="lg:col-span-2 rounded-xl border border-border bg-card overflow-hidden">
          <div className="p-5 border-b border-border flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold">{language === "pt" ? "Próximas operações" : language === "en" ? "Upcoming operations" : "即将进行的作业"}</div>
              <div className="text-xs text-muted-foreground">{language === "pt" ? "Por ETA — próximos navios" : language === "en" ? "By ETA — next vessels" : "按 ETA 排序 - 下一批船舶"}</div>
            </div>
            <Link to="/mapa" className="text-xs font-mono text-primary hover:underline">{language === "pt" ? "VER MAPA" : language === "en" ? "VIEW MAP" : "查看地图"} →</Link>
          </div>
          <table className="w-full text-sm">
            <thead className="text-[10px] uppercase tracking-wider text-muted-foreground font-mono">
              <tr className="border-b border-border">
                <th className="text-left px-5 py-2.5">{language === "pt" ? "Navio" : language === "en" ? "Vessel" : "船舶"}</th>
                <th className="text-left px-2 py-2.5">{language === "pt" ? "Tipo" : language === "en" ? "Type" : "类型"}</th>
                <th className="text-left px-2 py-2.5">{language === "pt" ? "Status" : language === "en" ? "Status" : "状态"}</th>
                <th className="text-left px-2 py-2.5">{language === "pt" ? "Berço" : language === "en" ? "Berth" : "泊位"}</th>
                <th className="text-right px-5 py-2.5">ETA</th>
              </tr>
            </thead>
            <tbody>
              {recentShips.map((s) => (
                <tr key={s.id} className="border-b border-border/50 hover:bg-secondary/30">
                  <td className="px-5 py-3">
                    <div className="font-medium">
                      <ShipLink shipId={s.id} className="font-medium text-foreground no-underline hover:text-primary">
                        {s.flag} {s.name}
                      </ShipLink>
                    </div>
                    <div className="text-[11px] text-muted-foreground font-mono">IMO {s.imo}</div>
                  </td>
                  <td className="px-2 py-3 text-muted-foreground text-xs">{s.type}</td>
                  <td className="px-2 py-3"><ShipStatusBadge status={s.status} /></td>
                  <td className="px-2 py-3 font-mono text-xs">{s.berthId ?? "—"}</td>
                  <td className="px-5 py-3 text-right font-mono text-xs text-muted-foreground">{new Date(s.eta).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="rounded-xl border border-border bg-card">
          <div className="p-5 border-b border-border flex items-center justify-between">
            <div className="text-sm font-semibold flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-destructive" /> {language === "pt" ? "Alertas críticos" : language === "en" ? "Critical alerts" : "关键警报"}
            </div>
            <Link to="/alertas" className="text-xs font-mono text-primary hover:underline">{language === "pt" ? "TODOS" : language === "en" ? "ALL" : "全部"} →</Link>
          </div>
          <div className="divide-y divide-border">
            {criticalAlerts.map((a) => (
              <div key={a.id} className={`p-4 hover:bg-secondary/30 ${a.severity === "critical" ? "bg-destructive/5" : ""}`}>
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
