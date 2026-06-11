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
  riskId?: string;
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
      { agency: "VIGIAGRO", status: "em_analise", updatedAt: h(-2) },
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
      { agency: "ANVISA", status: "bloqueado", updatedAt: h(-1)},
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
  {
    id: "SHP-009", name: "Amazon Trader", imo: "9721408", flag: "🇱🇷",
    type: "Container", loa: 286, cargo: "2.020 TEU — Insumos industriais",
    agent: "MSC Brasil", origin: "Cartagena (CO)",
    status: "anchored", queuePosition: 4, nextBerthId: "B-02",
    eta: h(-6), etb: h(9), etc: h(30), ets: h(38), etd: h(39),
    lat: -2.46, lng: -44.23, heading: 95, speed: 0,
    clearances: [
      { agency: "Receita Federal", status: "em_analise", updatedAt: h(-2) },
      { agency: "ANVISA", status: "aprovado", updatedAt: h(-3) },
      { agency: "Polícia Federal", status: "aprovado", updatedAt: h(-3) },
      { agency: "VIGIAGRO", status: "pendente", updatedAt: h(-2) },
    ],
    risk: "medium",
    riskFactors: ["VIGIAGRO pendente", "Fila de fundeio crescente"],
    pendencias: [
      { area: "Fiscalização", description: "Certificado vegetal aguardando validação", agency: "VIGIAGRO" },
    ],
    history: [{ ts: h(-6), event: "Chegada ao fundeio externo" }],
  },
  {
    id: "SHP-010", name: "Gulf Pioneer", imo: "9482201", flag: "🇺🇸",
    type: "Petroleiro", loa: 260, cargo: "86.000 t — Derivados",
    agent: "Transpetro", origin: "Houston (US)",
    status: "transit", nextBerthId: "B-07",
    eta: h(16), etb: h(22), etc: h(52), ets: h(60), etd: h(61),
    lat: 10, lng: -60, heading: 135, speed: 13.1,
    clearances: [
      { agency: "Receita Federal", status: "pendente", updatedAt: h(-1) },
      { agency: "ANVISA", status: "aprovado", updatedAt: h(-1) },
      { agency: "Polícia Federal", status: "aprovado", updatedAt: h(-1) },
      { agency: "VIGIAGRO", status: "aprovado", updatedAt: h(-1) },
    ],
    risk: "high",
    riskFactors: ["Carga sensível", "DI pendente"],
    pendencias: [
      { area: "Documental", description: "DI de derivados ainda não submetida", agency: "Receita Federal" },
    ],
    history: [{ ts: h(-20), event: "Em rota pelo Caribe rumo ao Maranhão" }],
  },
  {
    id: "SHP-011", name: "Durban Spirit", imo: "9318820", flag: "🇿🇦",
    type: "Granel", loa: 235, cargo: "70.000 t — Fertilizantes",
    agent: "Cargill Ocean", origin: "Durban (ZA)",
    status: "transit", nextBerthId: "B-06",
    eta: h(24), etb: h(32), etc: h(58), ets: h(66), etd: h(67),
    lat: -20, lng: 5, heading: 285, speed: 12.8,
    clearances: [
      { agency: "Receita Federal", status: "aprovado", updatedAt: h(-4) },
      { agency: "ANVISA", status: "aprovado", updatedAt: h(-4) },
      { agency: "Polícia Federal", status: "em_analise", updatedAt: h(-2) },
      { agency: "VIGIAGRO", status: "em_analise", updatedAt: h(-2) },
    ],
    risk: "medium",
    riskFactors: ["VIGIAGRO em análise", "Berço de granel pressionado"],
    pendencias: [
      { area: "Fiscalização", description: "Amostragem de fertilizante em pré-análise", agency: "VIGIAGRO" },
    ],
    history: [{ ts: h(-30), event: "Cruzou o Atlântico Sul em rota oeste" }],
  },
  {
    id: "SHP-012", name: "Shanghai Bridge", imo: "9765120", flag: "🇨🇳",
    type: "Container", loa: 330, cargo: "4.200 TEU — Máquinas",
    agent: "Cosco Shipping", origin: "Shanghai (CN)",
    status: "transit", nextBerthId: "B-04",
    eta: h(36), etb: h(44), etc: h(78), ets: h(86), etd: h(87),
    lat: -12, lng: 34, heading: 248, speed: 15.4,
    clearances: [
      { agency: "Receita Federal", status: "em_analise", updatedAt: h(-2) },
      { agency: "ANVISA", status: "pendente", updatedAt: h(-2) },
      { agency: "Polícia Federal", status: "pendente", updatedAt: h(-2) },
      { agency: "VIGIAGRO", status: "aprovado", updatedAt: h(-2) },
    ],
    risk: "high",
    riskFactors: ["3 documentos em revisão", "ETA em janela de alta ocupação"],
    pendencias: [
      { area: "Documental", description: "Manifesto complementar aguardando conferência", agency: "Receita Federal" },
      { area: "Sanitário", description: "Declaração sanitária de bordo pendente", agency: "ANVISA" },
    ],
    history: [{ ts: h(-96), event: "Partida de Shanghai com escala técnica concluída" }],
  },
  {
    id: "SHP-013", name: "Antwerp Mariner", imo: "9440190", flag: "🇧🇪",
    type: "RoRo", loa: 199, cargo: "980 veículos",
    agent: "Grimaldi", origin: "Antuérpia (BE)",
    status: "anchored", queuePosition: 5, nextBerthId: "B-08",
    eta: h(-4), etb: h(14), etc: h(29), ets: h(36), etd: h(37),
    lat: -2.49, lng: -44.22, heading: 80, speed: 0,
    clearances: [
      { agency: "Receita Federal", status: "aprovado", updatedAt: h(-5) },
      { agency: "ANVISA", status: "aprovado", updatedAt: h(-5) },
      { agency: "Polícia Federal", status: "aprovado", updatedAt: h(-5) },
      { agency: "VIGIAGRO", status: "aprovado", updatedAt: h(-5) },
    ],
    risk: "low",
    riskFactors: [],
    pendencias: [],
    history: [{ ts: h(-4), event: "Fundeado aguardando janela RoRo" }],
  },
  {
    id: "SHP-014", name: "Andes Mineral", imo: "9637742", flag: "🇨🇱",
    type: "Granel", loa: 229, cargo: "64.000 t — Concentrado mineral",
    agent: "Vale Logística", origin: "Valparaíso (CL)",
    status: "transit", nextBerthId: "B-06",
    eta: h(28), etb: h(40), etc: h(72), ets: h(80), etd: h(81),
    lat: -31, lng: -48, heading: 18, speed: 11.9,
    clearances: [
      { agency: "Receita Federal", status: "aprovado", updatedAt: h(-3) },
      { agency: "ANVISA", status: "aprovado", updatedAt: h(-3) },
      { agency: "Polícia Federal", status: "aprovado", updatedAt: h(-3) },
      { agency: "VIGIAGRO", status: "aprovado", updatedAt: h(-3) },
    ],
    risk: "low",
    riskFactors: ["Mar agitado no Atlântico Sul"],
    pendencias: [],
    history: [{ ts: h(-60), event: "Contornou o extremo sul e subiu pela costa brasileira" }],
  },
  {
    id: "SHP-015", name: "Lagos Crown", imo: "9573305", flag: "🇳🇬",
    type: "Químico", loa: 188, cargo: "18.500 t — Soda cáustica",
    agent: "Odfjell Brasil", origin: "Lagos (NG)",
    status: "anchored", queuePosition: 6, nextBerthId: "B-05",
    eta: h(-10), etb: h(6), etc: h(25), ets: h(31), etd: h(32),
    lat: -2.44, lng: -44.21, heading: 110, speed: 0,
    clearances: [
      { agency: "Receita Federal", status: "aprovado", updatedAt: h(-8) },
      { agency: "ANVISA", status: "bloqueado", updatedAt: h(-1) },
      { agency: "Polícia Federal", status: "aprovado", updatedAt: h(-8) },
      { agency: "VIGIAGRO", status: "aprovado", updatedAt: h(-8) },
    ],
    risk: "critical",
    riskFactors: ["ANVISA bloqueou certificado químico", "Carga perigosa no fundeio"],
    pendencias: [
      { area: "Sanitário", description: "Divergência em certificado de produto químico", agency: "ANVISA" },
    ],
    history: [{ ts: h(-10), event: "Chegada ao fundeio com bloqueio sanitário posterior" }],
  },
  {
    id: "SHP-016", name: "Delta Horizon", imo: "9498834", flag: "🇺🇸",
    type: "Container", loa: 275, cargo: "1.640 TEU — Peças automotivas",
    agent: "Maersk Brasil", origin: "New Orleans (US)",
    status: "transit", nextBerthId: "B-03",
    eta: h(18), etb: h(28), etc: h(56), ets: h(64), etd: h(65),
    lat: 6, lng: -58, heading: 132, speed: 14.2,
    clearances: [
      { agency: "Receita Federal", status: "em_analise", updatedAt: h(-1) },
      { agency: "ANVISA", status: "aprovado", updatedAt: h(-1) },
      { agency: "Polícia Federal", status: "aprovado", updatedAt: h(-1) },
      { agency: "VIGIAGRO", status: "aprovado", updatedAt: h(-1) },
    ],
    risk: "medium",
    riskFactors: ["Conexão documental com carga automotiva"],
    pendencias: [
      { area: "Documental", description: "Conferência de manifesto em andamento", agency: "Receita Federal" },
    ],
    history: [{ ts: h(-18), event: "Saiu do Golfo do México para corredor Norte" }],
  },
  {
    id: "SHP-017", name: "Lisboa Wave", imo: "9367718", flag: "🇵🇹",
    type: "Container", loa: 242, cargo: "1.320 TEU — Alimentos embalados",
    agent: "Aliança Navegação", origin: "Lisboa (PT)",
    status: "berthed", berthId: "B-02",
    eta: h(-5), etb: h(-2), etc: h(10), ets: h(16), etd: h(17),
    lat: -2.55, lng: -44.35, heading: 0, speed: 0,
    clearances: [
      { agency: "Receita Federal", status: "aprovado", updatedAt: h(-3) },
      { agency: "ANVISA", status: "em_analise", updatedAt: h(-1) },
      { agency: "Polícia Federal", status: "aprovado", updatedAt: h(-3) },
      { agency: "VIGIAGRO", status: "aprovado", updatedAt: h(-3) },
    ],
    risk: "medium",
    riskFactors: ["ANVISA em análise durante operação"],
    pendencias: [
      { area: "Sanitário", description: "Amostra de alimento embalado em conferência", agency: "ANVISA" },
    ],
    history: [{ ts: h(-2), event: "Atracado no Berço 02" }],
  },
  {
    id: "SHP-018", name: "Dakar Pearl", imo: "9552104", flag: "🇸🇳",
    type: "Granel", loa: 214, cargo: "48.000 t — Trigo",
    agent: "Marítima Norte", origin: "Dakar (SN)",
    status: "anchored", queuePosition: 7, nextBerthId: "B-06",
    eta: h(-1), etb: h(20), etc: h(46), ets: h(54), etd: h(55),
    lat: -2.51, lng: -44.24, heading: 75, speed: 0,
    clearances: [
      { agency: "Receita Federal", status: "aprovado", updatedAt: h(-2) },
      { agency: "ANVISA", status: "aprovado", updatedAt: h(-2) },
      { agency: "Polícia Federal", status: "aprovado", updatedAt: h(-2) },
      { agency: "VIGIAGRO", status: "pendente", updatedAt: h(-1) },
    ],
    risk: "high",
    riskFactors: ["VIGIAGRO pendente para trigo", "Berço B-06 com pressão operacional"],
    pendencias: [
      { area: "Fiscalização", description: "Inspeção fitossanitária de trigo aguardando agenda", agency: "VIGIAGRO" },
    ],
    history: [{ ts: h(-1), event: "Fundeado após travessia direta do Atlântico" }],
  },
  {
    id: "SHP-019", name: "Cape Aurora", imo: "9415224", flag: "🇵🇦",
    type: "Petroleiro", loa: 252, cargo: "92.000 t — Óleo combustível",
    agent: "Petrobras Transporte", origin: "Cidade do Cabo (ZA)",
    status: "departing", berthId: "B-07",
    eta: h(-34), etb: h(-28), etc: h(-3), ets: h(1), etd: h(2),
    lat: -2.58, lng: -44.38, heading: 42, speed: 4.5,
    clearances: [
      { agency: "Receita Federal", status: "aprovado", updatedAt: h(-26) },
      { agency: "ANVISA", status: "aprovado", updatedAt: h(-26) },
      { agency: "Polícia Federal", status: "aprovado", updatedAt: h(-26) },
      { agency: "VIGIAGRO", status: "aprovado", updatedAt: h(-26) },
    ],
    risk: "low",
    riskFactors: [],
    pendencias: [],
    history: [{ ts: h(-28), event: "Atracado no Berço 07" }, { ts: h(-1), event: "Iniciou desatracação assistida" }],
  },
  {
    id: "SHP-020", name: "Santos Voyager", imo: "9600187", flag: "🇧🇷",
    type: "Container", loa: 221, cargo: "1.180 TEU — Cabotagem",
    agent: "Log-In Logística", origin: "Santos (BR)",
    status: "anchored", queuePosition: 8, nextBerthId: "B-03",
    eta: h(-12), etb: h(26), etc: h(45), ets: h(52), etd: h(53),
    lat: -2.53, lng: -44.25, heading: 88, speed: 0,
    clearances: [
      { agency: "Receita Federal", status: "aprovado", updatedAt: h(-8) },
      { agency: "ANVISA", status: "aprovado", updatedAt: h(-8) },
      { agency: "Polícia Federal", status: "em_analise", updatedAt: h(-2) },
      { agency: "VIGIAGRO", status: "aprovado", updatedAt: h(-8) },
    ],
    risk: "medium",
    riskFactors: ["Fundeio prolongado", "PF em análise"],
    pendencias: [
      { area: "Operacional", description: "Janela depende da saída do Berço 03", agency: "Terminal" },
    ],
    history: [{ ts: h(-12), event: "Fundeio após rota de cabotagem" }],
  },
];

export const berths: Berth[] = [
  { id: "B-01", name: "Berço 01", zone: "Comercial",    length: 280, draft: 13, status: "ocupado", occupiedBy: "SHP-002", utilization: 78 },
  { id: "B-02", name: "Berço 02", zone: "Comercial",    length: 260, draft: 12, status: "ocupado", occupiedBy: "SHP-017", nextShipId: "SHP-009", nextEtb: h(9), utilization: 69 },
  { id: "B-03", name: "Berço 03", zone: "Container",    length: 320, draft: 15, status: "ocupado", occupiedBy: "SHP-001", nextShipId: "SHP-016", nextEtb: h(28), utilization: 94 },
  { id: "B-04", name: "Berço 04", zone: "Container",    length: 320, draft: 15, status: "reservado", nextShipId: "SHP-005", nextEtb: h(12), utilization: 72, conflict: "SHP-005 e SHP-008 disputam atracação" },
  { id: "B-05", name: "Berço 05", zone: "Químico",      length: 220, draft: 11, status: "ocupado", occupiedBy: "SHP-007", utilization: 55 },
  { id: "B-06", name: "Berço 06", zone: "Granel Sólido",length: 250, draft: 14, status: "manutencao", nextShipId: "SHP-003", nextEtb: h(4),  utilization: 0,  conflict: "Manutenção pode atrasar atracação de SHP-003" },
  { id: "B-07", name: "Berço 07", zone: "Granel Líquido",length: 280, draft: 16, status: "ocupado", occupiedBy: "SHP-019", nextShipId: "SHP-004", nextEtb: h(10), utilization: 82 },
  { id: "B-08", name: "Berço 08", zone: "RoRo",         length: 200, draft: 10, status: "livre", nextShipId: "SHP-013", nextEtb: h(14),  utilization: 41 },
];

export const alerts: AlertItem[] = [
  { id: "A-001", severity: "critical", title: "ANVISA bloqueou MV Hamburg Trader", description: "Divergência em certificado de produto perigoso. Operação suspensa no Berço 05.", source: "ANVISA", timestamp: h(-1), shipId: "SHP-007", riskId: "R-001", origin: "Inspeção sanitária", recommendedAction: "Agente deve reapresentar certificado MSDS atualizado." },
  { id: "A-002", severity: "warning",  title: "VIGIAGRO pendente — Iberia Bulk",   description: "Análise fitossanitária da soja há mais de 2h. Risco de atrasar atracação.", source: "VIGIAGRO", timestamp: h(-2), shipId: "SHP-003", riskId: "R-003", origin: "SLA ultrapassado", recommendedAction: "Escalar para coordenação VIGIAGRO; reagendar atracação se necessário." },
  { id: "A-003", severity: "warning",  title: "Previsão de chuva forte às 16h",     description: "Operação reduzida em ~35%. 2 berços de granel afetados.",                                            source: "Meteorologia", timestamp: h(-0.5), riskId: "R-005", origin: "Boletim INMET", recommendedAction: "Antecipar operações em granel; suspender movimentações sensíveis." },
  { id: "A-004", severity: "critical", title: "Nordic Tide aguarda 3 liberações",   description: "Carga perigosa sem DI, ANVISA e VIGIAGRO. Atracação prevista em 10h.",                              source: "Sistema",       timestamp: h(-3), shipId: "SHP-004", riskId: "R-002", origin: "Documentação", recommendedAction: "Notificar agente Norske Shipping para envio imediato dos documentos." },
  { id: "A-005", severity: "warning",  title: "Conflito de berço previsto",          description: "Pacific Dawn (ETB +12h) e Cabo Frio competem pelo Berço 04.",                                       source: "Sistema",       timestamp: h(-0.2), shipId: "SHP-005", riskId: "R-004", origin: "Programação", recommendedAction: "Realocar SHP-008 para B-02 (livre)." },
  { id: "A-006", severity: "info",     title: "Receita liberou Santos Express",      description: "Documentação validada. Operação pode iniciar assim que ANVISA aprovar.",                            source: "Receita Federal", timestamp: h(-1), shipId: "SHP-002", riskId: "R-007" },
  { id: "A-007", severity: "critical", title: "Lagos Crown bloqueado no fundeio",    description: "Carga química aguarda correção documental da ANVISA antes da atracação no Berço 05.",                 source: "ANVISA", timestamp: h(-1), shipId: "SHP-015", riskId: "R-008", origin: "Certificado químico", recommendedAction: "Solicitar certificado revisado ao agente Odfjell Brasil e manter navio fora da janela de atracação." },
  { id: "A-008", severity: "warning",  title: "Trigo do Dakar Pearl sem agenda",     description: "Inspeção VIGIAGRO pendente pode empurrar atracação do granel para depois da manutenção do B-06.",     source: "VIGIAGRO", timestamp: h(-0.7), shipId: "SHP-018", riskId: "R-009", origin: "Agenda fitossanitária", recommendedAction: "Reservar equipe VIGIAGRO para a primeira janela disponível e confirmar documentação do trigo." },
  { id: "A-009", severity: "warning",  title: "DI pendente no Gulf Pioneer",         description: "Petroleiro em rota com carga sensível e documentação fiscal ainda pendente.",                         source: "Receita Federal", timestamp: h(-0.4), shipId: "SHP-010", riskId: "R-010", origin: "Documentação", recommendedAction: "Acionar Transpetro para envio imediato da DI antes da chegada ao canal de aproximação." },
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
  { id: "R-008", shipId: "SHP-015", level: "critical", description: "Carga química bloqueada no fundeio", impact: "Risco de ocupar janela do Berço 05 sem liberação sanitária.", deadline: h(5), mitigation: "Corrigir certificado químico e revalidar antes de autorizar atracação.", owner: "Odfjell Brasil · ANVISA" },
  { id: "R-009", shipId: "SHP-018", level: "high",     description: "Inspeção VIGIAGRO sem agenda para trigo", impact: "Pode atrasar fila de granel e uso do Berço 06.", deadline: h(7), mitigation: "Reservar equipe de inspeção e confirmar certificado fitossanitário.", owner: "VIGIAGRO" },
  { id: "R-010", shipId: "SHP-010", level: "high",     description: "Petroleiro com DI pendente em rota", impact: "Atracação do Gulf Pioneer pode ser bloqueada na chegada.", deadline: h(12), mitigation: "Exigir envio da DI e validar pendências fiscais antes do ETB.", owner: "Receita Federal · Transpetro" },
  { id: "R-011", shipId: "SHP-012", level: "high",     description: "Shanghai Bridge chega em janela de alta ocupação", impact: "Pode competir com navios de cabotagem no Berço 04.", deadline: h(20), mitigation: "Revisar sequência de atracação e antecipar conferência documental.", owner: "Operador Terminal" },
  { id: "R-012", shipId: "SHP-020", level: "medium",   description: "Cabotagem com fundeio prolongado", impact: "Atraso em cargas domésticas e pressão sobre Berço 03.", deadline: h(14), mitigation: "Confirmar saída do B-03 e preparar janela alternativa no B-02.", owner: "Log-In Logística" },
];

export const kpiSeries = Array.from({ length: 12 }, (_, i) => ({
  hora: `${String(i * 2).padStart(2, "0")}h`,
  espera: Math.round(8 + Math.sin(i / 2) * 4 + Math.random() * 2),
  ocupacao: Math.round(55 + Math.cos(i / 3) * 15 + Math.random() * 5),
  throughput: Math.round(120 + Math.sin(i / 1.5) * 40 + Math.random() * 20),
}));
