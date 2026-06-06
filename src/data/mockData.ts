// PortOps — centralized mock data simulating an integrated port operation.

export type ShipStatus = "transit" | "anchored" | "berthed" | "operating" | "departing";
export type ClearanceAgency = "Receita Federal" | "ANVISA" | "Polícia Federal" | "VIGIAGRO";
export type ClearanceStatus = "pendente" | "aprovado" | "bloqueado" | "em_analise";
export type AlertSeverity = "info" | "warning" | "critical";
export type RiskLevel = "low" | "medium" | "high" | "critical";

export interface Clearance {
  agency: ClearanceAgency;
  status: ClearanceStatus;
  updatedAt: string;
  note?: string;
}

export interface Pendencia {
  area: "Documental" | "Fiscalização" | "Sanitário" | "Operacional" | "Climático";
  description: string;
  agency?: string;
}

export interface Ship {
  id: string;
  name: string;
  imo: string;
  flag: string;
  type: "Container" | "Granel" | "Petroleiro" | "RoRo" | "Químico";
  loa: number;
  cargo: string;
  agent: string;
  origin: string;
  status: ShipStatus;
  berthId?: string;
  nextBerthId?: string;
  queuePosition?: number;
  eta: string;
  etb: string;
  etc: string;
  ets: string;
  etd: string;
  lat: number;
  lng: number;
  heading: number;
  speed: number;
  clearances: Clearance[];
  risk: RiskLevel;
  riskFactors: string[];
  pendencias: Pendencia[];
  history: { ts: string; event: string }[];
}

export interface Berth {
  id: string;
  name: string;
  zone: "Comercial" | "Container" | "Granel Sólido" | "Granel Líquido" | "Químico" | "RoRo";
  length: number;
  draft: number;
  status: "livre" | "ocupado" | "manutencao" | "reservado";
  occupiedBy?: string;
  nextShipId?: string;
  nextEtb?: string;
  utilization: number;
  conflict?: string;
}

export interface AlertItem {
  id: string;
  severity: AlertSeverity;
  title: string;
  description: string;
  source: string;
  timestamp: string;
  shipId?: string;
  recommendedAction?: string;
  origin?: string;
}

export interface DocumentItem {
  id: string;
  name: string;
  shipId: string;
  type: "BL" | "Manifesto" | "Certificado Sanitário" | "DI" | "Lista de Tripulação";
  status: "validado" | "pendente" | "rejeitado";
  uploadedBy: string;
  uploadedAt: string;
  size: string;
}

export interface RiskItem {
  id: string;
  shipId?: string;
  berthId?: string;
  description: string;
  impact: string;
  level: RiskLevel;
  deadline: string;
  mitigation: string;
  owner: string;
}

const now = Date.now();
const h = (n: number) => new Date(now + n * 3600 * 1000).toISOString();

export const ships: Ship[] = [
  {
    id: "SHP-001", name: "MV Atlantic Star", imo: "9321483", flag: "🇵🇦",
    type: "Container", loa: 294, cargo: "2.450 TEU — Eletrônicos",
    agent: "Wilson Sons", origin: "Rotterdam (NL)",
    status: "operating", berthId: "B-03",
    eta: h(-12), etb: h(-6), etc: h(8), ets: h(14), etd: h(15),
    lat: 48, lng: 52, heading: 0, speed: 0,
    clearances: [
      { agency: "Receita Federal", status: "aprovado", updatedAt: h(-5) },
      { agency: "ANVISA", status: "aprovado", updatedAt: h(-4) },
      { agency: "Polícia Federal", status: "aprovado", updatedAt: h(-5) },
      { agency: "VIGIAGRO", status: "aprovado", updatedAt: h(-3) },
    ],
    risk: "low", riskFactors: [],
    pendencias: [],
    history: [
      { ts: h(-6), event: "Atracado no Berço 03" },
      { ts: h(-5), event: "Receita Federal liberou DI" },
      { ts: h(-2), event: "Operação iniciada — 1.200/2.450 TEU descarregados" },
    ],
  },
  {
    id: "SHP-002", name: "Santos Express", imo: "9456712", flag: "🇧🇷",
    type: "Container", loa: 230, cargo: "1.820 TEU — Diversos",
    agent: "Aliança Navegação", origin: "Buenos Aires (AR)",
    status: "berthed", berthId: "B-01",
    eta: h(-3), etb: h(-1), etc: h(11), ets: h(18), etd: h(19),
    lat: 42, lng: 50, heading: 0, speed: 0,
    clearances: [
      { agency: "Receita Federal", status: "aprovado", updatedAt: h(-1) },
      { agency: "ANVISA", status: "em_analise", updatedAt: h(-0.5) },
      { agency: "Polícia Federal", status: "aprovado", updatedAt: h(-1) },
      { agency: "VIGIAGRO", status: "pendente", updatedAt: h(-2) },
    ],
    risk: "medium",
    riskFactors: ["VIGIAGRO pendente", "ANVISA em análise"],
    pendencias: [
      { area: "Sanitário", description: "Aguardando inspeção sanitária da ANVISA", agency: "ANVISA" },
      { area: "Fiscalização", description: "Documentação fitossanitária não submetida", agency: "VIGIAGRO" },
    ],
    history: [
      { ts: h(-1), event: "Atracado no Berço 01" },
      { ts: h(-0.5), event: "ANVISA iniciou análise" },
    ],
  },
  {
    id: "SHP-003", name: "Iberia Bulk", imo: "9612330", flag: "🇪🇸",
    type: "Granel", loa: 225, cargo: "62.000 t — Soja",
    agent: "Marítima Iberia", origin: "Algeciras (ES)",
    status: "anchored", queuePosition: 1, nextBerthId: "B-06",
    eta: h(-18), etb: h(4), etc: h(28), ets: h(34), etd: h(35),
    lat: 25, lng: 70, heading: 90, speed: 0,
    clearances: [
      { agency: "Receita Federal", status: "aprovado", updatedAt: h(-10) },
      { agency: "ANVISA", status: "aprovado", updatedAt: h(-9) },
      { agency: "Polícia Federal", status: "aprovado", updatedAt: h(-9) },
      { agency: "VIGIAGRO", status: "em_analise", updatedAt: h(-2), note: "Análise fitossanitária da soja" },
    ],
    risk: "high",
    riskFactors: ["Fundeio há 18h", "VIGIAGRO em análise há 2h", "Berço destino em manutenção"],
    pendencias: [
      { area: "Fiscalização", description: "Análise fitossanitária ultrapassou SLA (2h)", agency: "VIGIAGRO" },
      { area: "Operacional", description: "Berço B-06 em manutenção até as 14h", agency: "Terminal" },
    ],
    history: [
      { ts: h(-18), event: "Fundeio na zona externa" },
      { ts: h(-2), event: "VIGIAGRO iniciou análise" },
    ],
  },
  {
    id: "SHP-004", name: "Nordic Tide", imo: "9778421", flag: "🇳🇴",
    type: "Petroleiro", loa: 248, cargo: "98.000 t — Petróleo bruto",
    agent: "Norske Shipping", origin: "Stavanger (NO)",
    status: "anchored", queuePosition: 2, nextBerthId: "B-07",
    eta: h(-8), etb: h(10), etc: h(40), ets: h(48), etd: h(49),
    lat: 18, lng: 78, heading: 110, speed: 0,
    clearances: [
      { agency: "Receita Federal", status: "pendente", updatedAt: h(-6) },
      { agency: "ANVISA", status: "pendente", updatedAt: h(-6) },
      { agency: "Polícia Federal", status: "aprovado", updatedAt: h(-7) },
      { agency: "VIGIAGRO", status: "pendente", updatedAt: h(-6) },
    ],
    risk: "critical",
    riskFactors: ["3 órgãos pendentes", "Carga perigosa", "Chuva forte prevista"],
    pendencias: [
      { area: "Documental", description: "DI não submetida — agente notificado", agency: "Receita Federal" },
      { area: "Sanitário", description: "Aguardando certificado sanitário", agency: "ANVISA" },
      { area: "Climático", description: "Janela de atracação ameaçada por tempestade", agency: "Meteorologia" },
    ],
    history: [
      { ts: h(-8), event: "Fundeio" },
      { ts: h(-7), event: "Polícia Federal liberou" },
    ],
  },
  {
    id: "SHP-005", name: "Pacific Dawn", imo: "9544021", flag: "🇸🇬",
    type: "Container", loa: 300, cargo: "3.100 TEU — Mistos",
    agent: "Maersk Brasil", origin: "Singapura (SG)",
    status: "transit", nextBerthId: "B-04",
    eta: h(6), etb: h(12), etc: h(36), ets: h(44), etd: h(45),
    lat: 8, lng: 88, heading: 280, speed: 14.5,
    clearances: [
      { agency: "Receita Federal", status: "em_analise", updatedAt: h(-1) },
      { agency: "ANVISA", status: "pendente", updatedAt: h(-2) },
      { agency: "Polícia Federal", status: "pendente", updatedAt: h(-2) },
      { agency: "VIGIAGRO", status: "pendente", updatedAt: h(-2) },
    ],
    risk: "medium",
    riskFactors: ["Conflito de berço com Cabo Frio", "3 órgãos pendentes"],
    pendencias: [
      { area: "Operacional", description: "Conflito de berço previsto com SHP-008", agency: "Terminal" },
    ],
    history: [{ ts: h(-12), event: "Saiu de Singapura · ETA 6h" }],
  },
  {
    id: "SHP-006", name: "Rio Verde", imo: "9388210", flag: "🇧🇷",
    type: "RoRo", loa: 180, cargo: "1.250 veículos",
    agent: "Wallenius", origin: "Itajaí (BR)",
    status: "transit", nextBerthId: "B-08",
    eta: h(2), etb: h(8), etc: h(20), ets: h(26), etd: h(27),
    lat: 70, lng: 30, heading: 200, speed: 12.2,
    clearances: [
      { agency: "Receita Federal", status: "aprovado", updatedAt: h(-3) },
      { agency: "ANVISA", status: "aprovado", updatedAt: h(-3) },
      { agency: "Polícia Federal", status: "em_analise", updatedAt: h(-1) },
      { agency: "VIGIAGRO", status: "aprovado", updatedAt: h(-3) },
    ],
    risk: "low", riskFactors: ["PF em análise — rotineiro"],
    pendencias: [],
    history: [{ ts: h(-4), event: "Em rota de cabotagem desde Itajaí" }],
  },
  {
    id: "SHP-007", name: "Hamburg Trader", imo: "9501122", flag: "🇩🇪",
    type: "Químico", loa: 195, cargo: "24.000 t — Químicos",
    agent: "Hapag-Lloyd", origin: "Hamburgo (DE)",
    status: "operating", berthId: "B-05",
    eta: h(-20), etb: h(-14), etc: h(4), ets: h(10), etd: h(11),
    lat: 55, lng: 56, heading: 0, speed: 0,
    clearances: [
      { agency: "Receita Federal", status: "aprovado", updatedAt: h(-12) },
      { agency: "ANVISA", status: "bloqueado", updatedAt: h(-1), note: "Divergência em certificado de produto perigoso" },
      { agency: "Polícia Federal", status: "aprovado", updatedAt: h(-12) },
      { agency: "VIGIAGRO", status: "aprovado", updatedAt: h(-12) },
    ],
    risk: "critical",
    riskFactors: ["ANVISA bloqueou operação", "Produto perigoso"],
    pendencias: [
      { area: "Sanitário", description: "Certificado de produto perigoso divergente", agency: "ANVISA" },
    ],
    history: [
      { ts: h(-14), event: "Atracado no Berço 05" },
      { ts: h(-1), event: "ANVISA bloqueou operação" },
    ],
  },
  {
    id: "SHP-008", name: "Cabo Frio", imo: "9655300", flag: "🇧🇷",
    type: "Granel", loa: 210, cargo: "55.000 t — Minério",
    agent: "Vale Logística", origin: "Tubarão (BR)",
    status: "anchored", queuePosition: 3, nextBerthId: "B-04",
    eta: h(-2), etb: h(18), etc: h(42), ets: h(50), etd: h(51),
    lat: 30, lng: 82, heading: 60, speed: 0,
    clearances: [
      { agency: "Receita Federal", status: "aprovado", updatedAt: h(-1) },
      { agency: "ANVISA", status: "aprovado", updatedAt: h(-1) },
      { agency: "Polícia Federal", status: "aprovado", updatedAt: h(-1) },
      { agency: "VIGIAGRO", status: "aprovado", updatedAt: h(-1) },
    ],
    risk: "medium",
    riskFactors: ["Conflito de berço com Pacific Dawn"],
    pendencias: [
      { area: "Operacional", description: "Disputa de berço B-04 com SHP-005", agency: "Terminal" },
    ],
    history: [{ ts: h(-2), event: "Aguardando atracação no fundeio" }],
  },
];

export const berths: Berth[] = [
  { id: "B-01", name: "Berço 01", zone: "Comercial",    length: 280, draft: 13, status: "ocupado", occupiedBy: "SHP-002", utilization: 78 },
  { id: "B-02", name: "Berço 02", zone: "Comercial",    length: 260, draft: 12, status: "livre",                            utilization: 64 },
  { id: "B-03", name: "Berço 03", zone: "Container",    length: 320, draft: 15, status: "ocupado", occupiedBy: "SHP-001", nextShipId: "SHP-006", nextEtb: h(15), utilization: 91 },
  { id: "B-04", name: "Berço 04", zone: "Container",    length: 320, draft: 15, status: "reservado", nextShipId: "SHP-005", nextEtb: h(12), utilization: 72, conflict: "SHP-005 e SHP-008 disputam atracação" },
  { id: "B-05", name: "Berço 05", zone: "Químico",      length: 220, draft: 11, status: "ocupado", occupiedBy: "SHP-007", utilization: 55 },
  { id: "B-06", name: "Berço 06", zone: "Granel Sólido",length: 250, draft: 14, status: "manutencao", nextShipId: "SHP-003", nextEtb: h(4),  utilization: 0,  conflict: "Manutenção pode atrasar atracação de SHP-003" },
  { id: "B-07", name: "Berço 07", zone: "Granel Líquido",length: 280, draft: 16, status: "livre", nextShipId: "SHP-004", nextEtb: h(10), utilization: 48 },
  { id: "B-08", name: "Berço 08", zone: "RoRo",         length: 200, draft: 10, status: "livre", nextShipId: "SHP-006", nextEtb: h(8),  utilization: 33 },
];

export const alerts: AlertItem[] = [
  { id: "A-001", severity: "critical", title: "ANVISA bloqueou MV Hamburg Trader", description: "Divergência em certificado de produto perigoso. Operação suspensa no Berço 05.", source: "ANVISA", timestamp: h(-1), shipId: "SHP-007", origin: "Inspeção sanitária", recommendedAction: "Agente deve reapresentar certificado MSDS atualizado." },
  { id: "A-002", severity: "warning",  title: "VIGIAGRO pendente — Iberia Bulk",   description: "Análise fitossanitária da soja há mais de 2h. Risco de atrasar atracação.", source: "VIGIAGRO", timestamp: h(-2), shipId: "SHP-003", origin: "SLA ultrapassado", recommendedAction: "Escalar para coordenação VIGIAGRO; reagendar atracação se necessário." },
  { id: "A-003", severity: "warning",  title: "Previsão de chuva forte às 16h",     description: "Operação reduzida em ~35%. 2 berços de granel afetados.",                                            source: "Meteorologia", timestamp: h(-0.5), origin: "Boletim INMET", recommendedAction: "Antecipar operações em granel; suspender movimentações sensíveis." },
  { id: "A-004", severity: "critical", title: "Nordic Tide aguarda 3 liberações",   description: "Carga perigosa sem DI, ANVISA e VIGIAGRO. Atracação prevista em 10h.",                              source: "Sistema",       timestamp: h(-3), shipId: "SHP-004", origin: "Documentação", recommendedAction: "Notificar agente Norske Shipping para envio imediato dos documentos." },
  { id: "A-005", severity: "warning",  title: "Conflito de berço previsto",          description: "Pacific Dawn (ETB +12h) e Cabo Frio competem pelo Berço 04.",                                       source: "Sistema",       timestamp: h(-0.2), shipId: "SHP-005", origin: "Programação", recommendedAction: "Realocar SHP-008 para B-02 (livre)." },
  { id: "A-006", severity: "info",     title: "Receita liberou Santos Express",      description: "Documentação validada. Operação pode iniciar assim que ANVISA aprovar.",                            source: "Receita Federal", timestamp: h(-1), shipId: "SHP-002" },
];

export const documents: DocumentItem[] = [
  { id: "D-001", name: "BL_AtlanticStar_2450TEU.pdf",  shipId: "SHP-001", type: "BL",                    status: "validado", uploadedBy: "Wilson Sons",     uploadedAt: h(-10), size: "1.2 MB" },
  { id: "D-002", name: "Manifesto_SantosExpress.pdf",  shipId: "SHP-002", type: "Manifesto",             status: "validado", uploadedBy: "Aliança Navegação",uploadedAt: h(-4),  size: "880 KB" },
  { id: "D-003", name: "CertSanitario_IberiaBulk.pdf", shipId: "SHP-003", type: "Certificado Sanitário", status: "pendente", uploadedBy: "Marítima Iberia",  uploadedAt: h(-2),  size: "640 KB" },
  { id: "D-004", name: "DI_NordicTide.xml",            shipId: "SHP-004", type: "DI",                    status: "pendente", uploadedBy: "Norske Shipping",  uploadedAt: h(-6),  size: "210 KB" },
  { id: "D-005", name: "Tripulacao_HamburgTrader.pdf", shipId: "SHP-007", type: "Lista de Tripulação",   status: "rejeitado",uploadedBy: "Hapag-Lloyd",      uploadedAt: h(-3),  size: "320 KB" },
  { id: "D-006", name: "BL_PacificDawn.pdf",           shipId: "SHP-005", type: "BL",                    status: "pendente", uploadedBy: "Maersk Brasil",    uploadedAt: h(-1),  size: "1.5 MB" },
];

export const riskItems: RiskItem[] = [
  { id: "R-001", shipId: "SHP-007", level: "critical", description: "Operação de carga perigosa bloqueada pela ANVISA", impact: "Indisponibilidade do Berço 05 por até 12h; multa potencial.", deadline: h(2),  mitigation: "Reapresentar certificado MSDS e acionar plantão ANVISA.", owner: "Hapag-Lloyd · ANVISA" },
  { id: "R-002", shipId: "SHP-004", level: "critical", description: "Petroleiro sem liberações em janela climática crítica", impact: "Perda da janela de atracação · custo demurrage R$ 180k/dia.", deadline: h(8),  mitigation: "Forçar envio de DI e certificados; ativar contingência climática.", owner: "Norske Shipping" },
  { id: "R-003", shipId: "SHP-003", level: "high",     description: "VIGIAGRO ultrapassou SLA de 2h", impact: "Atraso na cadeia de exportação de soja; fila bloqueada.", deadline: h(1),  mitigation: "Escalar à coordenação VIGIAGRO; reagendar atracação em B-06.", owner: "VIGIAGRO" },
  { id: "R-004", berthId: "B-04",   level: "high",     description: "Conflito de atracação no Berço 04", impact: "Dois navios programados para o mesmo berço em janela próxima.", deadline: h(10), mitigation: "Realocar SHP-008 para B-02; comunicar agentes.", owner: "Operador Terminal" },
  { id: "R-005",                     level: "medium",   description: "Tempestade prevista 16h–20h", impact: "Operação reduzida em 35%; cargas sensíveis em risco.", deadline: h(4),  mitigation: "Antecipar movimentações; suspender granel exposto.", owner: "Meteorologia · Terminal" },
  { id: "R-006", berthId: "B-06",   level: "medium",   description: "Berço 06 em manutenção programada", impact: "Atraso na atracação de Iberia Bulk em ~6h.", deadline: h(3),  mitigation: "Acompanhar conclusão de manutenção; manter SHP-003 informado.", owner: "Manutenção Portuária" },
  { id: "R-007", shipId: "SHP-002", level: "low",      description: "ANVISA em análise rotineira", impact: "Sem impacto previsto se concluída em até 2h.", deadline: h(2),  mitigation: "Monitorar resposta; sem ação proativa necessária.", owner: "ANVISA" },
];

export const kpiSeries = Array.from({ length: 12 }, (_, i) => ({
  hora: `${String(i * 2).padStart(2, "0")}h`,
  espera: Math.round(8 + Math.sin(i / 2) * 4 + Math.random() * 2),
  ocupacao: Math.round(55 + Math.cos(i / 3) * 15 + Math.random() * 5),
  throughput: Math.round(120 + Math.sin(i / 1.5) * 40 + Math.random() * 20),
}));
