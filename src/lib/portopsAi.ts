import { alerts, berths, documents, riskItems, ships, type ClearanceAgency, type Ship } from "@/data/mockData";
import type { LanguageCode } from "@/store/languageStore";
import { getMessage } from "@/i18n/messages";

type Severity = "normal" | "attention" | "moderate" | "critical";
type WeatherSeverity = "low" | "medium" | "high" | "critical";
type AssistantIntent =
  | "ship_summary"
  | "location"
  | "blockers"
  | "documents"
  | "clearances"
  | "weather"
  | "priority"
  | "risks"
  | "next_action"
  | "fleet_summary";

export interface ShipIntel {
  shipId: string;
  shipName: string;
  delayProbability: number;
  climateRisk: string;
  estimatedReleaseHours: string;
  bottleneck: string;
  priority: string;
  nextAction: string;
  summary: string;
  alertSeverity: Severity;
}

export interface AssistantAnswer {
  text: string;
  severity: Severity;
  shipId?: string;
  related?: Array<{ label: string; shipId?: string; href?: string }>;
}

export interface ReportData {
  title: string;
  summary: string;
  alerts: string[];
  criticalShips: string[];
  byAgency: string[];
  climate: string[];
  recommendations: string[];
  priorities: string[];
  text: string;
}

const SHIP_NAME_ALIASES: Array<{ id: string; names: string[] }> = [
  { id: "SHP-001", names: ["atlântico sul", "atlantic star", "mv atlantic star", "atlântico"] },
  { id: "SHP-002", names: ["santos express"] },
  { id: "SHP-003", names: ["iberia bulk"] },
  { id: "SHP-004", names: ["nordic tide"] },
  { id: "SHP-005", names: ["pacific dawn"] },
  { id: "SHP-006", names: ["rio verde"] },
  { id: "SHP-007", names: ["hamburg trader", "hamburgo trader"] },
  { id: "SHP-008", names: ["cabo frio"] },
];

const WEATHER_BY_SHIP: Record<string, { label: string; severity: WeatherSeverity }> = {
  "SHP-001": { label: "mar calmo", severity: "low" },
  "SHP-002": { label: "chuva leve", severity: "medium" },
  "SHP-003": { label: "mar agitado", severity: "high" },
  "SHP-004": { label: "tempestade", severity: "critical" },
  "SHP-005": { label: "ventania moderada", severity: "medium" },
  "SHP-006": { label: "tempo estável", severity: "low" },
  "SHP-007": { label: "chuva e vento", severity: "critical" },
  "SHP-008": { label: "ondulação moderada", severity: "medium" },
};

const AGENCY_ALIASES: Array<{ agency: ClearanceAgency; terms: string[] }> = [
  { agency: "Receita Federal", terms: ["receita", "aduana", "aduaneira", "customs"] },
  { agency: "ANVISA", terms: ["anvisa", "sanitario", "sanitária", "sanitario", "health"] },
  { agency: "Polícia Federal", terms: ["policia federal", "pf", "police", "federal police"] },
  { agency: "VIGIAGRO", terms: ["vigiagro", "fitossanit", "agro", "agricultural"] },
];

const SHIP_REFERENCE_TERMS = ["navio", "embarcacao", "embarcação", "ship", "vessel"];

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function includesAny(query: string, terms: string[]) {
  return terms.some((term) => query.includes(normalize(term)));
}

function normalizeShipToken(token: string) {
  if (token.length > 4 && token.endsWith("s") && !token.endsWith("ss")) {
    return token.slice(0, -1);
  }
  return token;
}

function normalizeShipPhrase(value: string) {
  return normalize(value)
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/\b(mv|m\/v|ss|m)\b/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .map(normalizeShipToken)
    .join(" ");
}

function buildShipAliases(ship: Ship) {
  const manualAliases = SHIP_NAME_ALIASES.find((item) => item.id === ship.id)?.names ?? [];
  const withoutPrefix = ship.name.replace(/^(mv|m\/v|ss)\s+/i, "");
  return Array.from(new Set([ship.name, withoutPrefix, ...manualAliases]))
    .map(normalizeShipPhrase)
    .filter((alias) => alias.length >= 3);
}

function findShipByQuery(query: string) {
  const queryPhrase = normalizeShipPhrase(query);
  if (!queryPhrase) return null;

  return ships.find((ship) => buildShipAliases(ship).some((alias) => queryPhrase.includes(alias))) ?? null;
}

function hasUnmatchedShipReference(query: string) {
  const normalized = normalize(query);
  const hasSingularReference = SHIP_REFERENCE_TERMS.some((term) => {
    const reference = normalize(term);
    return new RegExp(`\\b${reference}\\b`).test(normalized);
  });

  if (!hasSingularReference) return false;
  if (includesAny(normalized, ["quais navios", "navios criticos", "navios críticos", "frota", "fleet", "which vessels", "which ships"])) {
    return false;
  }

  const match = normalized.match(/\b(?:navio|embarcacao|ship|vessel)\s+([a-z0-9][a-z0-9\s-]*)/);
  if (!match?.[1]) return false;

  const candidate = match[1]
    .replace(/\b(agora|atual|relatorio inteligente|relatorio|report|status|esta|estao)\b/g, " ")
    .trim();

  return candidate.length >= 3;
}

function buildUnknownShipReply(language: LanguageCode) {
  return language === "pt"
    ? "Não consegui identificar com segurança qual navio você citou. Confira o nome ou selecione o navio no mapa para eu gerar a resposta correta."
    : language === "en"
      ? "I could not safely identify which vessel you mentioned. Check the name or select the vessel on the map so I can answer correctly."
      : "我无法可靠识别你提到的船舶。请检查名称或在地图上选择该船舶，以便我给出正确回答。";
}

function findAgencyByQuery(query: string) {
  const n = normalize(query);
  const match = AGENCY_ALIASES.find((item) => item.terms.some((term) => n.includes(normalize(term))));
  return match?.agency ?? null;
}

function weatherSeverityLabel(language: LanguageCode, severity: WeatherSeverity) {
  const map = {
    pt: { low: "Baixo", medium: "Moderado", high: "Alto", critical: "Crítico" },
    en: { low: "Low", medium: "Moderate", high: "High", critical: "Critical" },
    zh: { low: "低", medium: "中", high: "高", critical: "严重" },
  }[language];
  return map[severity] ?? severity;
}

function weatherLabel(language: LanguageCode, shipId: string) {
  const weather = WEATHER_BY_SHIP[shipId] ?? { label: "tempo estável", severity: "low" };
  const labels = {
    pt: {
      "mar calmo": "mar calmo",
      "chuva leve": "chuva leve",
      "mar agitado": "mar agitado",
      tempestade: "tempestade",
      "ventania moderada": "ventania moderada",
      "tempo estável": "tempo estável",
      "chuva e vento": "chuva e vento",
      "ondulação moderada": "ondulação moderada",
    },
    en: {
      "mar calmo": "calm sea",
      "chuva leve": "light rain",
      "mar agitado": "rough sea",
      tempestade: "storm",
      "ventania moderada": "moderate wind",
      "tempo estável": "stable weather",
      "chuva e vento": "rain and wind",
      "ondulação moderada": "moderate swell",
    },
    zh: {
      "mar calmo": "海况平稳",
      "chuva leve": "小雨",
      "mar agitado": "海况较差",
      tempestade: "风暴",
      "ventania moderada": "中等强风",
      "tempo estável": "天气稳定",
      "chuva e vento": "风雨",
      "ondulação moderada": "中等涌浪",
    },
  }[language];

  return labels[weather.label as keyof typeof labels] ?? weather.label;
}

function riskBadgeText(language: LanguageCode, risk: Ship["risk"]) {
  return getMessage(language, `status.risk.${risk}`);
}

function shipStatusText(language: LanguageCode, status: Ship["status"]) {
  return getMessage(language, `status.ship.${status}`);
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function summarizePendingDocs(shipId: string) {
  return documents.filter((doc) => doc.shipId === shipId && doc.status !== "validado");
}

function getShipRisks(shipId: string) {
  return riskItems.filter((item) => item.shipId === shipId);
}

function getShipActiveAlert(shipId: string) {
  return alerts.find((item) => item.shipId === shipId && item.severity === "critical")
    ?? alerts.find((item) => item.shipId === shipId && item.severity === "warning")
    ?? null;
}

function getNextBerth(ship: Ship) {
  return berths.find((berth) => berth.id === ship.nextBerthId || berth.id === ship.berthId) ?? null;
}

function scoreDelay(ship: Ship, pendingClearances: number, pendingDocs: number, weatherSeverity: WeatherSeverity, hasCriticalAlert: boolean) {
  const riskBase = { low: 14, medium: 36, high: 61, critical: 82 }[ship.risk];
  const statusBase = { transit: 8, anchored: 22, berthed: 12, operating: 6, departing: 10 }[ship.status];
  const weatherBase = { low: 0, medium: 8, high: 14, critical: 24 }[weatherSeverity];
  const clearanceBase = pendingClearances * 11;
  const docBase = pendingDocs * 8;
  const criticalBase = hasCriticalAlert ? 12 : 0;
  return riskBase + statusBase + weatherBase + clearanceBase + docBase + criticalBase;
}

function estimateReleaseTime(ship: Ship, pendingClearances: number, pendingDocs: number, weatherSeverity: WeatherSeverity) {
  const base = ship.status === "operating" ? 1.5 : ship.status === "berthed" ? 2.5 : ship.status === "anchored" ? 4 : 3;
  const weather = { low: 0, medium: 0.8, high: 1.8, critical: 3.2 }[weatherSeverity];
  const hours = base + pendingClearances * 1.3 + pendingDocs * 0.9 + weather;
  const roundedHours = Math.max(0.5, hours);
  const whole = Math.floor(roundedHours);
  const minutes = Math.round((roundedHours - whole) * 60);
  return `${whole}h${String(minutes).padStart(2, "0")}`;
}

function pickNextAction(ship: Ship, pendingClearances: Ship["clearances"], pendingDocs: typeof documents, weatherSeverity: WeatherSeverity, language: LanguageCode) {
  const blockedAgency = pendingClearances.find((item) => item.status === "bloqueado")?.agency;
  const pendingAgency = pendingClearances.find((item) => item.status !== "aprovado")?.agency;
  const pendingDocument = pendingDocs.find((doc) => doc.status !== "validado");

  if (blockedAgency) {
    return language === "pt"
      ? `Corrigir a pendência com ${blockedAgency} e reabrir a liberação.`
      : language === "en"
        ? `Resolve the issue with ${blockedAgency} and reopen clearance.`
        : `修复 ${blockedAgency} 的问题并重新申请放行。`;
  }

  if (pendingAgency) {
    return language === "pt"
      ? `Acionar ${pendingAgency} para concluir a etapa pendente.`
      : language === "en"
        ? `Escalate ${pendingAgency} to close the pending step.`
        : `推动 ${pendingAgency} 完成待处理环节。`;
  }

  if (pendingDocument) {
    return language === "pt"
      ? `Reenviar ${pendingDocument.type.toLowerCase()} e acompanhar a análise.`
      : language === "en"
        ? `Resubmit the ${pendingDocument.type.toLowerCase()} and monitor the review.`
        : `重新提交 ${pendingDocument.type} 并跟进审核。`;
  }

  if (weatherSeverity === "critical" || weatherSeverity === "high") {
    return language === "pt"
      ? "Acompanhar a rota e proteger a janela operacional antes da piora do clima."
      : language === "en"
        ? "Monitor the route and protect the operational window before weather worsens."
        : "在天气恶化前持续监控航线并保护作业窗口。";
  }

  return language === "pt"
    ? `Manter ${ship.name} em monitoramento operacional.`
    : language === "en"
      ? `Keep ${ship.name} under operational monitoring.`
      : `继续对 ${ship.name} 进行作业监控。`;
}

function getShipLocationSummary(ship: Ship, language: LanguageCode) {
  const berth = getNextBerth(ship);

  if (ship.status === "anchored") {
    return language === "pt"
      ? `${ship.flag} ${ship.name} está fundeado, na posição ${ship.queuePosition ?? "-"} da fila, aguardando ${berth?.name ?? "janela de atracação"}.`
      : language === "en"
        ? `${ship.flag} ${ship.name} is anchored, queue position ${ship.queuePosition ?? "-"}, waiting for ${berth?.name ?? "a berthing window"}.`
        : `${ship.flag} ${ship.name} 目前在锚地等待，排队序号 ${ship.queuePosition ?? "-"}，目标为 ${berth?.name ?? "靠泊窗口"}。`;
  }

  if (ship.status === "transit") {
    return language === "pt"
      ? `${ship.flag} ${ship.name} está em trânsito desde ${ship.origin}, com destino operacional em ${berth?.name ?? "berço programado"}.`
      : language === "en"
        ? `${ship.flag} ${ship.name} is in transit from ${ship.origin}, heading to ${berth?.name ?? "its scheduled berth"}.`
        : `${ship.flag} ${ship.name} 正从 ${ship.origin} 航行，目标为 ${berth?.name ?? "预定泊位"}。`;
  }

  if (ship.status === "berthed" || ship.status === "operating") {
    return language === "pt"
      ? `${ship.flag} ${ship.name} está em ${berth?.name ?? ship.berthId ?? "berço operacional"}, já dentro da janela de operação.`
      : language === "en"
        ? `${ship.flag} ${ship.name} is at ${berth?.name ?? ship.berthId ?? "its operational berth"}, already inside the active operation window.`
        : `${ship.flag} ${ship.name} 当前位于 ${berth?.name ?? ship.berthId ?? "作业泊位"}，已进入作业窗口。`;
  }

  return language === "pt"
    ? `${ship.flag} ${ship.name} está em saída operacional.`
    : language === "en"
      ? `${ship.flag} ${ship.name} is in departure status.`
      : `${ship.flag} ${ship.name} 当前处于离港状态。`;
}

function getBlockingSummary(ship: Ship, language: LanguageCode) {
  const blocked = ship.clearances.filter((item) => item.status === "bloqueado");
  const pending = ship.clearances.filter((item) => item.status === "pendente" || item.status === "em_analise");
  const risk = getShipRisks(ship.id)[0];

  if (blocked.length) {
    return language === "pt"
      ? `O bloqueio formal está em ${blocked.map((item) => item.agency).join(", ")}.`
      : language === "en"
        ? `The formal block is with ${blocked.map((item) => item.agency).join(", ")}.`
        : `正式阻塞来自 ${blocked.map((item) => item.agency).join("、")}。`;
  }

  if (pending.length) {
    return language === "pt"
      ? `Não há bloqueio formal, mas a operação está travada por ${pending.map((item) => `${item.agency} (${item.status.replace("_", " ")})`).join(", ")}${risk ? ` e ${risk.description.toLowerCase()}` : ""}.`
      : language === "en"
        ? `There is no formal block, but the operation is being held by ${pending.map((item) => `${item.agency} (${item.status.replace("_", " ")})`).join(", ")}${risk ? ` and ${risk.description.toLowerCase()}` : ""}.`
        : `当前没有正式阻塞，但作业仍受 ${pending.map((item) => `${item.agency}（${item.status.replace("_", " ")}）`).join("、")}${risk ? ` 以及 ${risk.description}` : ""} 影响。`;
  }

  return language === "pt"
    ? "Não identifiquei bloqueio ou pendência crítica de liberação neste momento."
    : language === "en"
      ? "I did not identify any critical clearance block right now."
      : "当前未发现关键放行阻塞。";
}

function getDocumentSummary(ship: Ship, language: LanguageCode) {
  const pendingDocs = summarizePendingDocs(ship.id);
  if (!pendingDocs.length) {
    return language === "pt"
      ? `Não há documentos pendentes relevantes para ${ship.name}.`
      : language === "en"
        ? `There are no relevant pending documents for ${ship.name}.`
        : `${ship.name} 当前没有关键待处理文件。`;
  }

  return language === "pt"
    ? `Os documentos pendentes de ${ship.name} são ${pendingDocs.map((doc) => doc.name).join(", ")}.`
    : language === "en"
      ? `The pending documents for ${ship.name} are ${pendingDocs.map((doc) => doc.name).join(", ")}.`
      : `${ship.name} 的待处理文件包括 ${pendingDocs.map((doc) => doc.name).join("、")}。`;
}

function getWeatherSummary(ship: Ship, language: LanguageCode) {
  const weather = WEATHER_BY_SHIP[ship.id] ?? { label: "tempo estável", severity: "low" };
  const label = weatherLabel(language, ship.id);
  const severity = weatherSeverityLabel(language, weather.severity);

  return language === "pt"
    ? `O clima na rota está em ${label}, com severidade ${severity.toLowerCase()}.`
    : language === "en"
      ? `Route weather is ${label}, with ${severity.toLowerCase()} severity.`
      : `航线天气为${label}，风险级别为${severity}。`;
}

function getClearanceSummary(ship: Ship, language: LanguageCode, agency?: ClearanceAgency | null) {
  const clearances = agency ? ship.clearances.filter((item) => item.agency === agency) : ship.clearances;
  if (!clearances.length) {
    return language === "pt"
      ? "Não encontrei liberação correspondente para esse órgão."
      : language === "en"
        ? "I could not find a matching clearance for that agency."
        : "未找到该机构对应的放行信息。";
  }

  return clearances
    .map((item) => {
      const noteSuffix = item.note
        ? language === "pt"
          ? ` Motivo operacional: ${item.note}.`
          : language === "en"
            ? ` Operational note: ${item.note}.`
            : ` 运营备注：${item.note}。`
        : "";

      return language === "pt"
        ? `${item.agency} está com status ${item.status.replace("_", " ")}.${noteSuffix}`
        : language === "en"
          ? `${item.agency} is ${item.status.replace("_", " ")}.${noteSuffix}`
          : `${item.agency} 当前状态为 ${item.status.replace("_", " ")}。${noteSuffix}`;
    })
    .join(" ");
}

function getShipRiskSummary(ship: Ship, language: LanguageCode) {
  const criticalRisk = getShipRisks(ship.id)[0];
  const alert = getShipActiveAlert(ship.id);

  if (criticalRisk) {
    return language === "pt"
      ? `Para ${ship.name}, o maior risco ativo é ${criticalRisk.description.toLowerCase()}, com impacto de ${criticalRisk.impact.toLowerCase()}.`
      : language === "en"
        ? `For ${ship.name}, the main active risk is ${criticalRisk.description.toLowerCase()}, with impact of ${criticalRisk.impact.toLowerCase()}.`
        : `对于 ${ship.name}，当前主要风险是${criticalRisk.description}，影响为${criticalRisk.impact}。`;
  }

  if (alert) {
    return language === "pt"
      ? `Para ${ship.name}, o alerta mais relevante agora é "${alert.title}".`
      : language === "en"
        ? `For ${ship.name}, the most relevant alert right now is "${alert.title}".`
        : `对于 ${ship.name}，当前最相关的警报是“${alert.title}”。`;
  }

  return language === "pt"
    ? `O risco atual de ${ship.name} é ${riskBadgeText(language, ship.risk).toLowerCase()}.`
    : language === "en"
      ? `${ship.name} currently has ${riskBadgeText(language, ship.risk).toLowerCase()} risk.`
      : `${ship.name} 当前风险等级为${riskBadgeText(language, ship.risk)}。`;
}

function detectIntent(query: string, focusShipId?: string | null): AssistantIntent {
  const normalized = normalize(query);

  if (!normalized.trim()) {
    return focusShipId ? "ship_summary" : "fleet_summary";
  }

  if (includesAny(normalized, ["onde", "where", "localizacao", "localização", "mapa", "rota", "route", "destino", "location"])) {
    return "location";
  }
  if (includesAny(normalized, ["bloque", "block", "pendenc", "pendênc", "trav", "gargalo", "bottleneck"])) {
    return "blockers";
  }
  if (includesAny(normalized, ["document", "manifesto", "tripul", "bl_", "bl ", "di", "arquivo", "file"])) {
    return "documents";
  }
  if (includesAny(normalized, ["receita", "anvisa", "vigiagro", "pf", "policia", "clearance", "liberacao", "liberação", "orgao", "órgão"])) {
    return "clearances";
  }
  if (includesAny(normalized, ["clima", "weather", "chuva", "tempest", "vento", "storm"])) {
    return "weather";
  }
  if (includesAny(normalized, ["critico", "crítico", "prioridade", "priority", "mais urgente", "worst"])) {
    return "priority";
  }
  if (includesAny(normalized, ["risco", "risk", "impacto", "impact"])) {
    return "risks";
  }
  if (includesAny(normalized, ["proxima acao", "próxima ação", "next action", "o que fazer", "what should"])) {
    return "next_action";
  }
  if (focusShipId || findShipByQuery(query)) {
    return "ship_summary";
  }
  return "fleet_summary";
}

function buildShipRelated(ship: Ship) {
  return [{ label: ship.name, shipId: ship.id }];
}

function buildFleetSummary(language: LanguageCode) {
  const topShips = analyzeFleet(language).slice(0, 3);
  if (!topShips.length) {
    return language === "pt"
      ? "Nenhum navio relevante no momento."
      : language === "en"
        ? "No relevant vessels at the moment."
        : "当前没有关键船舶。";
  }

  if (language === "pt") {
    return `Panorama agora: ${topShips.map((item) => `${item.shipName} (${item.delayProbability}% · ${item.bottleneck})`).join("; ")}.`;
  }
  if (language === "en") {
    return `Current picture: ${topShips.map((item) => `${item.shipName} (${item.delayProbability}% · ${item.bottleneck})`).join("; ")}.`;
  }
  return `当前总览：${topShips.map((item) => `${item.shipName}（${item.delayProbability}% · ${item.bottleneck}）`).join("；")}。`;
}

export function analyzeShip(ship: Ship, language: LanguageCode): ShipIntel {
  const pendingClearances = ship.clearances.filter((c) => c.status !== "aprovado");
  const pendingDocs = documents.filter((doc) => doc.shipId === ship.id && doc.status !== "validado");
  const criticalAlert = alerts.find((a) => a.shipId === ship.id && a.severity === "critical");
  const weather = WEATHER_BY_SHIP[ship.id] ?? { label: "tempo estável", severity: "low" };

  const delayProbability = clamp(
    scoreDelay(ship, pendingClearances.length, pendingDocs.length, weather.severity, !!criticalAlert),
    5,
    98,
  );

  const climateRiskLabel = weatherSeverityLabel(language, weather.severity);
  const estimatedReleaseHours = estimateReleaseTime(ship, pendingClearances.length, pendingDocs.length, weather.severity);
  const bottleneck = pendingClearances[0]?.agency
    ? `${pendingClearances[0].agency}${pendingClearances[0].status === "bloqueado" ? ` (${getMessage(language, "status.clearance.bloqueado")})` : ""}`
    : pendingDocs[0]?.type
      ? `${pendingDocs[0].type} ${getMessage(language, "status.clearance.pendente").toLowerCase()}`
      : language === "pt"
        ? "Sem gargalo crítico"
        : language === "en"
          ? "No critical bottleneck"
          : "无关键瓶颈";

  const priority = delayProbability >= 80
    ? language === "pt"
      ? "Prioridade máxima"
      : language === "en"
        ? "Top priority"
        : "最高优先级"
    : delayProbability >= 55
      ? language === "pt"
        ? "Alta"
        : language === "en"
          ? "High"
          : "高"
      : language === "pt"
        ? "Normal"
        : language === "en"
          ? "Normal"
          : "正常";

  const nextAction = pickNextAction(ship, pendingClearances, pendingDocs, weather.severity, language);

  const summary =
    language === "pt"
      ? `${ship.flag} ${ship.name} está ${shipStatusText(language, ship.status).toLowerCase()} com risco ${riskBadgeText(language, ship.risk).toLowerCase()} e gargalo em ${bottleneck}.`
      : language === "en"
        ? `${ship.flag} ${ship.name} is ${shipStatusText(language, ship.status).toLowerCase()} with ${riskBadgeText(language, ship.risk).toLowerCase()} risk and bottleneck in ${bottleneck}.`
        : `${ship.flag} ${ship.name} 当前处于${shipStatusText(language, ship.status)}，风险为${riskBadgeText(language, ship.risk)}，主要瓶颈在 ${bottleneck}。`;

  const alertSeverity: Severity =
    delayProbability >= 80 || ship.risk === "critical" || weather.severity === "critical"
      ? "critical"
      : delayProbability >= 55
        ? "moderate"
        : delayProbability >= 35
          ? "attention"
          : "normal";

  return {
    shipId: ship.id,
    shipName: ship.name,
    delayProbability,
    climateRisk: climateRiskLabel,
    estimatedReleaseHours,
    bottleneck,
    priority,
    nextAction,
    summary,
    alertSeverity,
  };
}

export function analyzeFleet(language: LanguageCode) {
  return ships.map((ship) => analyzeShip(ship, language)).sort((a, b) => b.delayProbability - a.delayProbability);
}

export function answerAssistantQuery(
  query: string,
  language: LanguageCode,
  focusShipId?: string | null,
  rememberedShipId?: string | null,
): AssistantAnswer {
  const trimmedQuery = query.trim();
  const focusedShip = focusShipId ? ships.find((ship) => ship.id === focusShipId) ?? null : null;
  const rememberedShip = rememberedShipId ? ships.find((ship) => ship.id === rememberedShipId) ?? null : null;
  const mentionedShip = findShipByQuery(trimmedQuery);
  const hasUnknownShipReference = !mentionedShip && hasUnmatchedShipReference(trimmedQuery);
  const ship = hasUnknownShipReference ? null : mentionedShip ?? rememberedShip ?? focusedShip;
  const agency = findAgencyByQuery(trimmedQuery);
  const intent = detectIntent(trimmedQuery, ship?.id ?? focusShipId);
  const locale = language === "pt" ? "pt-BR" : language === "en" ? "en-US" : "zh-CN";

  const reply = (
    text: string,
    severity: Severity = "normal",
    related?: AssistantAnswer["related"],
    shipId?: string,
  ): AssistantAnswer => ({
    text,
    severity,
    related,
    shipId,
  });

  if (intent === "priority") {
    const topShips = analyzeFleet(language).slice(0, 3);
    const top = topShips[0];
    if (!top) return reply(buildFleetSummary(language), "normal");

    const text = language === "pt"
      ? `A maior prioridade agora é ${top.shipName}, com ${top.delayProbability}% de probabilidade de atraso por ${top.bottleneck}. Em seguida vêm ${topShips.slice(1).map((item) => item.shipName).join(" e ") || "os demais navios monitorados"}.`
      : language === "en"
        ? `The top priority right now is ${top.shipName}, with ${top.delayProbability}% delay probability due to ${top.bottleneck}. Next are ${topShips.slice(1).map((item) => item.shipName).join(" and ") || "the remaining monitored vessels"}.`
        : `当前最高优先级是 ${top.shipName}，延误概率为 ${top.delayProbability}%，主要原因是 ${top.bottleneck}。其后是 ${topShips.slice(1).map((item) => item.shipName).join(" 和 ") || "其余受监控船舶"}。`;

    return reply(text, top.alertSeverity, topShips.map((item) => ({ label: item.shipName, shipId: item.shipId })), top.shipId);
  }

  if (hasUnknownShipReference) {
    return reply(buildUnknownShipReply(language), "attention");
  }

  if (intent === "fleet_summary" && !ship) {
    const topShips = analyzeFleet(language).slice(0, 3);
    const summary = buildFleetSummary(language);
    const nextAction = topShips[0]?.nextAction;
    const text = nextAction
      ? `${summary}\n\n${language === "pt" ? `Próxima ação mais importante: ${nextAction}.` : language === "en" ? `Most important next action: ${nextAction}.` : `当前最重要的下一步：${nextAction}。`}`
      : summary;
    return reply(text, topShips[0]?.alertSeverity ?? "normal", topShips.map((item) => ({ label: item.shipName, shipId: item.shipId })));
  }

  if (!ship) {
    const topShips = analyzeFleet(language).slice(0, 3);
    return reply(
      `${buildFleetSummary(language)}\n\n${getMessage(language, "assistant.noAnswer")}`,
      topShips[0]?.alertSeverity ?? "normal",
      topShips.map((item) => ({ label: item.shipName, shipId: item.shipId })),
    );
  }

  const intel = analyzeShip(ship, language);

  if (intent === "location") {
    const eta = new Date(ship.etb).toLocaleString(locale, { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
    const etaSentence = language === "pt"
      ? `ETA operacional: ${eta}.`
      : language === "en"
        ? `Operational ETA: ${eta}.`
        : `作业 ETA：${eta}。`;
    const text = `${getShipLocationSummary(ship, language)} ${etaSentence}`;
    return reply(text, intel.alertSeverity, buildShipRelated(ship), ship.id);
  }

  if (intent === "blockers") {
    const text = `${getBlockingSummary(ship, language)} ${language === "pt" ? `Próxima ação recomendada: ${intel.nextAction}` : language === "en" ? `Recommended next action: ${intel.nextAction}` : `建议下一步：${intel.nextAction}`}`;
    return reply(text, intel.alertSeverity, buildShipRelated(ship), ship.id);
  }

  if (intent === "documents") {
    const pendingDocs = summarizePendingDocs(ship.id);
    if (agency === "Receita Federal") {
      const text = language === "pt"
        ? `${getDocumentSummary(ship, language)} Para a Receita, o caso mais sensível é ${pendingDocs[0]?.name ?? "a DI/documentação aduaneira já validada"}.`
        : language === "en"
          ? `${getDocumentSummary(ship, language)} For Customs, the most sensitive item is ${pendingDocs[0]?.name ?? "the DI/customs documentation already validated"}.`
          : `${getDocumentSummary(ship, language)} 对海关而言，当前最敏感的文件是 ${pendingDocs[0]?.name ?? "已完成校验的报关文件"}。`;
      return reply(text, pendingDocs.length ? "attention" : intel.alertSeverity, buildShipRelated(ship), ship.id);
    }
    return reply(`${getDocumentSummary(ship, language)} ${language === "pt" ? `Próxima ação: ${intel.nextAction}` : language === "en" ? `Next action: ${intel.nextAction}` : `下一步：${intel.nextAction}`}`, pendingDocs.length ? "attention" : "normal", buildShipRelated(ship), ship.id);
  }

  if (intent === "clearances") {
    const text = `${getClearanceSummary(ship, language, agency)} ${language === "pt" ? `Tempo estimado para normalização: ${intel.estimatedReleaseHours}.` : language === "en" ? `Estimated time to normalize: ${intel.estimatedReleaseHours}.` : `预计恢复时间：${intel.estimatedReleaseHours}。`}`;
    return reply(text, intel.alertSeverity, buildShipRelated(ship), ship.id);
  }

  if (intent === "weather") {
    const text = `${getWeatherSummary(ship, language)} ${language === "pt" ? `Isso sustenta um risco ${intel.climateRisk.toLowerCase()} para ${ship.name}.` : language === "en" ? `This keeps ${ship.name} at ${intel.climateRisk.toLowerCase()} weather risk.` : `这使得 ${ship.name} 保持 ${intel.climateRisk} 天气风险。`}`;
    return reply(text, intel.alertSeverity, buildShipRelated(ship), ship.id);
  }

  if (intent === "risks") {
    const text = `${getShipRiskSummary(ship, language)} ${language === "pt" ? `Motivo operacional principal: ${intel.bottleneck}.` : language === "en" ? `Main operational reason: ${intel.bottleneck}.` : `主要运营原因：${intel.bottleneck}。`}`;
    return reply(text, intel.alertSeverity, buildShipRelated(ship), ship.id);
  }

  if (intent === "next_action") {
    const text = language === "pt"
      ? `A próxima ação para ${ship.name} é: ${intel.nextAction} Motivo: ${intel.bottleneck}.`
      : language === "en"
        ? `The next action for ${ship.name} is: ${intel.nextAction} Reason: ${intel.bottleneck}.`
        : `${ship.name} 的下一步是：${intel.nextAction}。原因：${intel.bottleneck}。`;
    return reply(text, intel.alertSeverity, buildShipRelated(ship), ship.id);
  }

  const text = language === "pt"
    ? `${getShipLocationSummary(ship, language)} ${getBlockingSummary(ship, language)} Risco atual: ${riskBadgeText(language, ship.risk)}. Próxima ação: ${intel.nextAction}.`
    : language === "en"
      ? `${getShipLocationSummary(ship, language)} ${getBlockingSummary(ship, language)} Current risk: ${riskBadgeText(language, ship.risk)}. Next action: ${intel.nextAction}.`
      : `${getShipLocationSummary(ship, language)} ${getBlockingSummary(ship, language)} 当前风险：${riskBadgeText(language, ship.risk)}。下一步：${intel.nextAction}。`;

  return reply(text, intel.alertSeverity, buildShipRelated(ship), ship.id);
}

export function buildOperationalReport(language: LanguageCode, focusShipId?: string | null): ReportData {
  const fleet = analyzeFleet(language);
  const criticalShips = fleet.filter((item) => item.alertSeverity === "critical").slice(0, 3);
  const relevantAlerts = alerts.filter((alert) => alert.severity !== "info").slice(0, 3);
  const byAgency = ["Receita Federal", "ANVISA", "Polícia Federal", "VIGIAGRO"].map((agency) => {
    const pending = ships.filter((ship) => ship.clearances.some((c) => c.agency === agency && c.status !== "aprovado"));
    return `${agency}: ${pending.length}`;
  });
  const climate = fleet
    .filter((item) => ["Alto", "Crítico", "High", "Critical", "高", "严重"].includes(item.climateRisk))
    .slice(0, 3)
    .map((item) => `${item.shipName} · ${item.climateRisk}`);
  const recommendations = fleet.slice(0, 3).map((item) => item.nextAction);
  const priorities = fleet.slice(0, 3).map((item) => `${item.shipName} · ${item.bottleneck}`);
  const focus = focusShipId ? ships.find((ship) => ship.id === focusShipId) ?? null : null;
  const focusIntel = focus ? analyzeShip(focus, language) : fleet[0] ?? null;

  const summary = language === "pt"
    ? focusIntel
      ? `${focusIntel.shipName} lidera o monitoramento com ${focusIntel.delayProbability}% de risco de atraso por ${focusIntel.bottleneck}. Os demais pontos críticos estão concentrados em clima e liberações pendentes.`
      : "A operação segue com atenção concentrada em clima, liberações e disputa de berço."
    : language === "en"
      ? focusIntel
        ? `${focusIntel.shipName} leads monitoring with ${focusIntel.delayProbability}% delay risk due to ${focusIntel.bottleneck}. The remaining critical points are concentrated in weather and pending clearances.`
        : "Operations remain focused on weather, clearances and berth conflicts."
      : focusIntel
        ? `${focusIntel.shipName} 目前是最关键对象，延误风险为 ${focusIntel.delayProbability}%，主要原因是 ${focusIntel.bottleneck}。其他关键点集中在天气和待处理放行。`
        : "当前运营重点集中在天气、放行和泊位冲突。";

  const text = [
    `${getMessage(language, "assistant.reportSummary")}: ${summary}`,
    `${getMessage(language, "assistant.reportAlerts")}: ${relevantAlerts.map((item) => item.title).join(" | ")}`,
    `${getMessage(language, "assistant.reportCriticalShips")}: ${criticalShips.map((item) => `${item.shipName} (${item.delayProbability}%)`).join(" | ")}`,
    `${getMessage(language, "assistant.reportByAgency")}: ${byAgency.join(" | ")}`,
    `${getMessage(language, "assistant.reportClimate")}: ${climate.join(" | ") || (language === "pt" ? "Sem risco climático crítico." : language === "en" ? "No critical weather risk." : "暂无关键天气风险。")}`,
    `${getMessage(language, "assistant.reportRecommendations")}: ${recommendations.join(" | ")}`,
    `${getMessage(language, "assistant.reportPriorities")}: ${priorities.join(" | ")}`,
  ].join("\n\n");

  return {
    title: language === "pt" ? "Relatório Inteligente PortOps" : language === "en" ? "PortOps Smart Report" : "PortOps 智能报告",
    summary,
    alerts: relevantAlerts.map((item) => item.title),
    criticalShips: criticalShips.map((item) => `${item.shipName} (${item.delayProbability}%)`),
    byAgency,
    climate,
    recommendations,
    priorities,
    text,
  };
}
