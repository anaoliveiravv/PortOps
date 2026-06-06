import { useState } from "react";
import { Users, Shield, Building2, Plus, Search, MoreHorizontal } from "lucide-react";
import { PROFILES, type ProfileId } from "@/data/profiles";
import { useLanguageCode } from "@/i18n/useT";

interface User {
  id: string;
  name: string;
  cpf: string;
  email: string;
  profile: ProfileId;
  org: string;
  active: boolean;
}

const SEED: User[] = [
  { id: "u1", name: "Maria Silva",     cpf: "***.***.***-12", email: "maria.silva@portodesantos.gov.br", profile: "gestor_porto",     org: "APSP",            active: true },
  { id: "u2", name: "João Pereira",    cpf: "***.***.***-45", email: "j.pereira@rfb.gov.br",             profile: "fiscal_receita",   org: "Receita Federal", active: true },
  { id: "u3", name: "Camila Souza",    cpf: "***.***.***-78", email: "csouza@anvisa.gov.br",             profile: "fiscal_anvisa",    org: "ANVISA",          active: true },
  { id: "u4", name: "Rodrigo Lima",    cpf: "***.***.***-09", email: "rlima@agro.gov.br",                profile: "fiscal_vigiagro",  org: "VIGIAGRO",        active: true },
  { id: "u5", name: "TCP Operações",   cpf: "***.***.***-33", email: "ops@tcp.com.br",                   profile: "operador",         org: "Terminal TCP",    active: true },
  { id: "u6", name: "Wilson Sons",     cpf: "***.***.***-21", email: "agencia@wilsonsons.com.br",        profile: "agente",           org: "Wilson Sons",     active: true },
  { id: "u7", name: "APSP Admin",      cpf: "***.***.***-55", email: "admin@apsp.gov.br",                profile: "admin_portuaria",  org: "APSP · Admin",    active: true },
  { id: "u8", name: "Patrícia Freitas", cpf: "***.***.***-67", email: "pf@pf.gov.br",                     profile: "policia_federal",  org: "Polícia Federal", active: true },
  { id: "u9", name: "TransMar Cargo",   cpf: "***.***.***-88", email: "operacao@transmar.com.br",         profile: "transportadora",   org: "Operador Logístico", active: true },
];

export default function Admin() {
  const language = useLanguageCode();
  const [users] = useState<User[]>(SEED);
  const [q, setQ] = useState("");
  const [profileFilter, setProfileFilter] = useState<ProfileId | "all">("all");

  const filtered = users.filter((u) => {
    if (profileFilter !== "all" && u.profile !== profileFilter) return false;
    if (!q) return true;
    const s = q.toLowerCase();
    return u.name.toLowerCase().includes(s) || u.email.toLowerCase().includes(s) || u.org.toLowerCase().includes(s);
  });

  const stats = {
    total: users.length,
    active: users.filter((u) => u.active).length,
    orgs: new Set(users.map((u) => u.org)).size,
    profiles: new Set(users.map((u) => u.profile)).size,
  };

  return (
    <div className="mx-auto max-w-[1440px] p-6 lg:p-8 space-y-6 animate-fade-in">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-[11px] font-mono uppercase tracking-[0.2em] text-accent mb-1">{language === "pt" ? "Administração" : language === "en" ? "Administration" : "管理"}</div>
          <h1 className="text-2xl font-bold tracking-tight">{language === "pt" ? "Usuários, vínculos e permissões" : language === "en" ? "Users, assignments and permissions" : "用户、绑定与权限"}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {language === "pt"
              ? "Gestão de credenciamento institucional. Perfis são identificados automaticamente via gov.br."
              : language === "en"
                ? "Institutional credential management. Profiles are identified automatically through gov.br."
                : "机构凭证管理。用户身份通过 gov.br 自动识别。"}
          </p>
        </div>
        <button className="primary-action flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold">
          <Plus className="h-4 w-4" /> {language === "pt" ? "Novo vínculo" : language === "en" ? "New assignment" : "新增绑定"}
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: language === "pt" ? "Usuários totais" : language === "en" ? "Total users" : "用户总数", value: stats.total, icon: Users },
          { label: language === "pt" ? "Ativos" : language === "en" ? "Active" : "活跃", value: stats.active, icon: Shield },
          { label: language === "pt" ? "Organizações" : language === "en" ? "Organizations" : "机构数", value: stats.orgs, icon: Building2 },
          { label: language === "pt" ? "Perfis distintos" : language === "en" ? "Distinct profiles" : "不同身份", value: stats.profiles, icon: Shield },
        ].map((s) => (
          <div key={s.label} className="card-flat p-4">
            <div className="flex items-start justify-between mb-2">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-mono">{s.label}</div>
              <s.icon className="h-4 w-4 text-accent" />
            </div>
            <div className="text-2xl font-bold font-mono tracking-tight">{s.value}</div>
          </div>
        ))}
      </div>

      <div className="premium-panel overflow-hidden">
        <div className="p-3 border-b border-border flex flex-wrap gap-2 items-center">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={language === "pt" ? "Buscar nome, e-mail ou organização..." : language === "en" ? "Search name, email or organization..." : "搜索姓名、邮箱或机构..."}
              className="w-full bg-secondary border border-border rounded pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-accent"
            />
          </div>
          <select
            value={profileFilter}
            onChange={(e) => setProfileFilter(e.target.value as ProfileId | "all")}
            className="bg-secondary border border-border rounded px-3 py-2 text-sm"
          >
            <option value="all">{language === "pt" ? "Todos os perfis" : language === "en" ? "All profiles" : "全部身份"}</option>
            {Object.values(PROFILES).map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
        <table className="w-full text-sm">
          <thead className="text-[10px] uppercase tracking-wider text-muted-foreground font-mono bg-secondary/40">
            <tr className="border-b border-border">
              <th className="text-left px-5 py-2.5">{language === "pt" ? "Usuário" : language === "en" ? "User" : "用户"}</th>
              <th className="text-left px-2 py-2.5">{language === "pt" ? "Perfil" : language === "en" ? "Profile" : "身份"}</th>
              <th className="text-left px-2 py-2.5">{language === "pt" ? "Organização" : language === "en" ? "Organization" : "机构"}</th>
              <th className="text-left px-2 py-2.5">{language === "pt" ? "Status" : language === "en" ? "Status" : "状态"}</th>
              <th className="text-right px-5 py-2.5">{language === "pt" ? "Ações" : language === "en" ? "Actions" : "操作"}</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => {
              const p = PROFILES[u.profile];
              return (
                <tr key={u.id} className="border-b border-border/60 hover:bg-secondary/40">
                  <td className="px-5 py-3">
                    <div className="font-medium">{u.name}</div>
                    <div className="text-[11px] text-muted-foreground font-mono">{u.email} · {u.cpf}</div>
                  </td>
                  <td className="px-2 py-3">
                    <div className="flex items-center gap-2">
                      <p.icon className="h-3.5 w-3.5 text-accent" />
                      <span className="text-xs">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-2 py-3 text-xs text-muted-foreground">{u.org}</td>
                  <td className="px-2 py-3">
                    <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded border ${u.active ? "text-success border-success/40 bg-success/10" : "text-muted-foreground border-border bg-secondary"}`}>
                      {u.active ? (language === "pt" ? "Ativo" : language === "en" ? "Active" : "活跃") : (language === "pt" ? "Inativo" : language === "en" ? "Inactive" : "停用")}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <button className="p-1.5 hover:bg-secondary rounded"><MoreHorizontal className="h-4 w-4" /></button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="premium-panel p-5">
        <div className="text-sm font-semibold mb-1">{language === "pt" ? "Matriz de permissões por perfil" : language === "en" ? "Permission matrix by profile" : "按身份划分的权限矩阵"}</div>
        <div className="text-xs text-muted-foreground mb-4">{language === "pt" ? "Áreas da plataforma acessíveis por cada perfil institucional." : language === "en" ? "Platform areas accessible to each institutional profile." : "各机构身份可访问的平台区域。"}</div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-[10px] uppercase tracking-wider text-muted-foreground font-mono">
              <tr className="border-b border-border">
                <th className="text-left px-3 py-2">{language === "pt" ? "Perfil" : language === "en" ? "Profile" : "身份"}</th>
                {[
                  language === "pt" ? "Mapa" : language === "en" ? "Map" : "地图",
                  "Dashboard",
                  language === "pt" ? "Berços" : language === "en" ? "Berths" : "泊位",
                  language === "pt" ? "Fila" : language === "en" ? "Queue" : "队列",
                  language === "pt" ? "Liberações" : language === "en" ? "Clearances" : "放行",
                  language === "pt" ? "Documentos" : language === "en" ? "Documents" : "文件",
                  language === "pt" ? "Alertas" : language === "en" ? "Alerts" : "警报",
                  language === "pt" ? "Riscos" : language === "en" ? "Risks" : "风险",
                  "Admin",
                ].map((c) => (
                  <th key={c} className="text-center px-2 py-2">{c}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Object.values(PROFILES).map((p) => {
                const cols = ["/mapa","/dashboard","/bercos","/fila","/liberacoes","/documentos","/alertas","/riscos","/admin"];
                return (
                  <tr key={p.id} className="border-b border-border/40">
                    <td className="px-3 py-2.5 font-medium text-xs">{p.name}</td>
                    {cols.map((c) => (
                      <td key={c} className="text-center px-2 py-2.5">
                        {p.permissions.includes(c)
                          ? <span className="inline-block h-2 w-2 rounded-full bg-success" />
                          : <span className="inline-block h-2 w-2 rounded-full bg-border" />}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
