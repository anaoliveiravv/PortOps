import { Anchor, Building2, Landmark, HeartPulse, Sprout, Ship as ShipIcon, ShieldCheck } from "lucide-react";

export type ProfileId =
  | "gestor_porto"
  | "operador"
  | "agente"
  | "fiscal_receita"
  | "policia_federal"
  | "fiscal_anvisa"
  | "fiscal_vigiagro"
  | "transportadora"
  | "admin_portuaria"
  | "admin";

export interface Profile {
  id: ProfileId;
  name: string;
  org: string;
  icon: typeof Anchor;
  description: string;
  permissions: string[];
}

const FULL = ["/mapa", "/dashboard", "/bercos", "/fila", "/liberacoes", "/documentos", "/alertas", "/riscos", "/admin"];
const OPS  = ["/mapa", "/bercos", "/fila", "/alertas", "/riscos", "/dashboard"];
const REGULATOR = ["/mapa", "/liberacoes", "/documentos", "/alertas", "/dashboard"];
const PORT_AUTHORITY = FULL.filter((p) => p !== "/admin");

export const PROFILES: Record<ProfileId, Profile> = {
  gestor_porto:    { id: "gestor_porto",    name: "Autoridade Portuária",      org: "Autoridade Portuária",          icon: Building2,  description: "Visão estratégica e consolidada da operação.",                permissions: PORT_AUTHORITY },
  operador:        { id: "operador",        name: "Operador de Terminal",      org: "Terminal Portuário",            icon: Anchor,     description: "Atracação, berços, fila e operação do terminal.",            permissions: OPS },
  agente:          { id: "agente",          name: "Agente Marítimo",           org: "Agência Marítima",              icon: ShipIcon,   description: "Acompanhamento dos navios da agência e documentação.",       permissions: ["/mapa", "/documentos", "/liberacoes", "/alertas", "/dashboard"] },
  fiscal_receita:  { id: "fiscal_receita",  name: "Receita Federal",          org: "Receita Federal do Brasil",     icon: Landmark,   description: "Liberações aduaneiras e documentos fiscais.",                permissions: REGULATOR },
  policia_federal:  { id: "policia_federal", name: "Polícia Federal",          org: "Polícia Federal",               icon: ShieldCheck,description: "Controle de acesso, tripulação e validações de segurança.",   permissions: ["/mapa", "/liberacoes", "/documentos", "/alertas", "/dashboard"] },
  fiscal_anvisa:   { id: "fiscal_anvisa",   name: "ANVISA",                   org: "Agência Nacional de Vigilância Sanitária", icon: HeartPulse, description: "Vigilância sanitária e cargas sensíveis.",                   permissions: REGULATOR },
  fiscal_vigiagro: { id: "fiscal_vigiagro", name: "VIGIAGRO",                 org: "Vigilância Agropecuária Internacional", icon: Sprout, description: "Inspeção agropecuária e certificados fitossanitários.",       permissions: REGULATOR },
  transportadora:   { id: "transportadora",  name: "Transportadora",           org: "Operador Logístico",            icon: ShipIcon,   description: "Acompanhamento operacional da carga e janelas de coleta.",   permissions: ["/mapa", "/documentos", "/alertas", "/dashboard"] },
  admin_portuaria: { id: "admin_portuaria", name: "Administração Portuária",  org: "Autoridade Portuária · Admin",  icon: Building2,  description: "Gestão administrativa do porto: contratos, recursos, planejamento.", permissions: PORT_AUTHORITY },
  admin:           { id: "admin",           name: "Administrador PortOps",    org: "PortOps · Administração",       icon: ShieldCheck,description: "Gerencia usuários, vínculos institucionais e permissões.",   permissions: FULL },
};

export const DEMO_PROFILES: ProfileId[] = [
  "gestor_porto",
  "fiscal_receita",
  "policia_federal",
  "fiscal_anvisa",
  "fiscal_vigiagro",
  "operador",
  "agente",
  "transportadora",
  "admin_portuaria",
  "admin",
];

// Simulated identification: in production this would come from gov.br + institutional binding.
export function detectProfile(): ProfileId {
  return "gestor_porto";
}
