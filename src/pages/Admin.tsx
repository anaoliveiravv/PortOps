import { type FormEvent, type ReactNode, useState } from "react";
import { Users, Shield, Building2, Plus, Search, MoreHorizontal, Link2, CheckCircle2, Clock3, XCircle } from "lucide-react";
import { PROFILES, type ProfileId } from "@/data/profiles";
import { useLanguageCode } from "@/i18n/useT";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "@/components/ui/sonner";
import { SummaryMetricCard, SummaryMetricsPanel } from "@/components/SummaryMetrics";
import { cn } from "@/lib/utils";

interface User {
  id: string;
  name: string;
  cpf: string;
  email: string;
  profile: ProfileId;
  org: string;
  active: boolean;
}

type AssignmentForm = {
  name: string;
  cpf: string;
  email: string;
  profile: ProfileId;
  org: string;
  active: boolean;
};

type ProfileRequestStatus = "analysis" | "approved" | "rejected";

interface ProfileRequest {
  id: string;
  user: string;
  requestedProfile: string;
  status: ProfileRequestStatus;
}

const PROFILE_REQUESTS_SEED: ProfileRequest[] = [
  { id: "pr1", user: "João Silva", requestedProfile: "Receita Federal", status: "analysis" },
  { id: "pr2", user: "Maria Santos", requestedProfile: "ANVISA", status: "analysis" },
];

const REQUEST_STATUS_VIEW: Record<ProfileRequestStatus, {
  label: string;
  className: string;
  icon: typeof Clock3;
}> = {
  analysis: {
    label: "Em análise",
    className: "border-warning/25 bg-warning/10 text-warning",
    icon: Clock3,
  },
  approved: {
    label: "Aprovado",
    className: "border-success/25 bg-success/10 text-success",
    icon: CheckCircle2,
  },
  rejected: {
    label: "Rejeitado",
    className: "border-destructive/25 bg-destructive/10 text-destructive",
    icon: XCircle,
  },
};

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

const DEFAULT_PROFILE: ProfileId = "gestor_porto";

function createInitialForm(): AssignmentForm {
  return {
    name: "",
    cpf: "",
    email: "",
    profile: DEFAULT_PROFILE,
    org: PROFILES[DEFAULT_PROFILE].org,
    active: true,
  };
}

export default function Admin() {
  const language = useLanguageCode();
  const [users, setUsers] = useState<User[]>(SEED);
  const [q, setQ] = useState("");
  const [profileFilter, setProfileFilter] = useState<ProfileId | "all">("all");
  const [assignmentOpen, setAssignmentOpen] = useState(false);
  const [form, setForm] = useState<AssignmentForm>(() => createInitialForm());
  const [profileRequests, setProfileRequests] = useState<ProfileRequest[]>(PROFILE_REQUESTS_SEED);

  const resetForm = () => setForm(createInitialForm());

  const handleAssignmentOpenChange = (open: boolean) => {
    setAssignmentOpen(open);
    if (!open) {
      resetForm();
    }
  };

  const updateProfile = (profile: ProfileId) => {
    setForm((current) => ({
      ...current,
      profile,
      org: PROFILES[profile].org,
    }));
  };

  const handleCreateAssignment = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const name = form.name.trim();
    const cpf = form.cpf.trim();
    const email = form.email.trim();
    const org = form.org.trim();

    if (!name || !cpf || !email || !org || !form.profile) {
      toast(language === "pt" ? "Preencha todos os campos obrigatórios." : language === "en" ? "Fill in all required fields." : "请填写所有必填字段。");
      return;
    }

    setUsers((current) => {
      const nextNumber =
        current.reduce((max, user) => {
          const numericId = Number(user.id.replace(/^u/, ""));
          return Number.isFinite(numericId) ? Math.max(max, numericId) : max;
        }, 0) + 1;

      const nextUser: User = {
        id: `u${nextNumber}`,
        name,
        cpf,
        email,
        profile: form.profile,
        org,
        active: form.active,
      };

      return [nextUser, ...current];
    });

    setAssignmentOpen(false);
    resetForm();
    toast(language === "pt" ? "Vínculo institucional criado." : language === "en" ? "Institutional assignment created." : "机构绑定已创建。");
  };

  const updateProfileRequestStatus = (id: string, status: ProfileRequestStatus) => {
    setProfileRequests((current) =>
      current.map((request) =>
        request.id === id ? { ...request, status } : request
      )
    );
  };

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
        <button onClick={() => setAssignmentOpen(true)} className="primary-action flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold">
          <Plus className="h-4 w-4" /> {language === "pt" ? "Novo vínculo" : language === "en" ? "New assignment" : "新增绑定"}
        </button>
      </div>

      <SummaryMetricsPanel>
        {[
          { label: language === "pt" ? "Usuários totais" : language === "en" ? "Total users" : "用户总数", value: stats.total, icon: Users },
          { label: language === "pt" ? "Ativos" : language === "en" ? "Active" : "活跃", value: stats.active, icon: Shield },
          { label: language === "pt" ? "Organizações" : language === "en" ? "Organizations" : "机构数", value: stats.orgs, icon: Building2 },
          { label: language === "pt" ? "Perfis distintos" : language === "en" ? "Distinct profiles" : "不同身份", value: stats.profiles, icon: Shield },
        ].map((s) => (
          <SummaryMetricCard key={s.label}>
            <div className="flex items-start justify-between mb-2">
              <div className="text-[10px] uppercase tracking-wider text-[#405672] font-mono">{s.label}</div>
              <s.icon className="h-4 w-4 text-[#0759ce]" />
            </div>
            <div className="text-2xl font-bold font-mono tracking-tight text-[#102a4c]">{s.value}</div>
          </SummaryMetricCard>
        ))}
      </SummaryMetricsPanel>

      <div className="premium-panel overflow-hidden">
        <div className="flex flex-col gap-1 border-b border-border px-5 py-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="text-[11px] font-mono uppercase tracking-[0.18em] text-accent">
              {language === "pt" ? "Validação institucional" : language === "en" ? "Institutional validation" : "机构验证"}
            </div>
            <h2 className="mt-1 text-lg font-bold tracking-[-0.02em]">
              {language === "pt" ? "Solicitações de Perfil" : language === "en" ? "Profile Requests" : "身份申请"}
            </h2>
          </div>
          <p className="max-w-xl text-xs leading-5 text-muted-foreground">
            {language === "pt"
              ? "Protótipo de aprovação por órgão responsável para demonstrar controle de acesso institucional."
              : language === "en"
                ? "Approval prototype by responsible agency to demonstrate institutional access control."
                : "按负责机构审批的原型，用于展示机构访问控制。"}
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary/40 text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
              <tr className="border-b border-border">
                <th className="px-5 py-2.5 text-left">{language === "pt" ? "Usuário" : language === "en" ? "User" : "用户"}</th>
                <th className="px-3 py-2.5 text-left">{language === "pt" ? "Perfil Solicitado" : language === "en" ? "Requested Profile" : "申请身份"}</th>
                <th className="px-3 py-2.5 text-left">Status</th>
                <th className="px-5 py-2.5 text-right">{language === "pt" ? "Ações" : language === "en" ? "Actions" : "操作"}</th>
              </tr>
            </thead>
            <tbody>
              {profileRequests.map((request) => {
                const view = REQUEST_STATUS_VIEW[request.status];
                const Icon = view.icon;

                return (
                  <tr key={request.id} className="border-b border-border/60 hover:bg-secondary/40">
                    <td className="px-5 py-3 font-medium">{request.user}</td>
                    <td className="px-3 py-3 text-xs text-muted-foreground">{request.requestedProfile}</td>
                    <td className="px-3 py-3">
                      <span className={cn("inline-flex min-h-[1.75rem] items-center justify-center gap-1.5 rounded-[0.52rem] border px-2.5 py-1 text-[0.72rem] font-semibold leading-none", view.className)}>
                        <Icon className="h-3.5 w-3.5 shrink-0" />
                        {view.label}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex flex-wrap justify-end gap-2">
                        <button
                          onClick={() => updateProfileRequestStatus(request.id, "approved")}
                          className="rounded-lg border border-success/30 bg-success/5 px-3 py-1.5 text-xs font-semibold text-success transition hover:bg-success hover:text-white"
                        >
                          Aprovar
                        </button>
                        <button
                          onClick={() => updateProfileRequestStatus(request.id, "rejected")}
                          className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-1.5 text-xs font-semibold text-destructive transition hover:bg-destructive hover:text-white"
                        >
                          Rejeitar
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
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
                    <span className={`inline-flex min-h-[1.75rem] items-center justify-center gap-1.5 rounded-[0.52rem] border px-2.5 py-1 text-[0.72rem] font-semibold leading-none tracking-[-0.01em] shadow-[inset_0_1px_0_rgba(255,255,255,0.75)] ${u.active ? "border-emerald-200 bg-emerald-50/80 text-emerald-700" : "border-slate-200 bg-slate-50/90 text-slate-600"}`}>
                      <Shield className="h-3.5 w-3.5 shrink-0" />
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

      <Dialog open={assignmentOpen} onOpenChange={handleAssignmentOpenChange}>
        <DialogContent className="max-w-2xl overflow-hidden rounded-[1.75rem] border-[#d5e2f1] bg-white p-0 shadow-[0_30px_80px_-42px_rgba(19,50,95,0.48)]">
          <div className="bg-[linear-gradient(180deg,#f8fbff_0%,#eef5fd_100%)] px-7 py-6">
            <DialogHeader>
              <div className="mb-3 grid h-11 w-11 place-items-center rounded-2xl border border-[#cfe0f3] bg-white text-[#0759ce] shadow-[0_16px_34px_-28px_rgba(7,89,206,0.72)]">
                <Link2 className="h-5 w-5" />
              </div>
              <DialogTitle className="text-2xl tracking-[-0.03em]">
                {language === "pt" ? "Novo vínculo institucional" : language === "en" ? "New institutional assignment" : "新增机构绑定"}
              </DialogTitle>
              <DialogDescription className="max-w-xl leading-6">
                {language === "pt"
                  ? "Cadastre um vínculo simulado para testar perfis, permissões e credenciais institucionais no protótipo."
                  : language === "en"
                    ? "Create a simulated assignment to test profiles, permissions and institutional credentials in the prototype."
                    : "创建模拟绑定，用于在原型中测试身份、权限和机构凭证。"}
              </DialogDescription>
            </DialogHeader>
          </div>

          <form onSubmit={handleCreateAssignment} className="space-y-5 p-7">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label={language === "pt" ? "Nome" : language === "en" ? "Name" : "姓名"}>
                <input
                  value={form.name}
                  onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                  placeholder={language === "pt" ? "Ex.: Ana Costa" : language === "en" ? "E.g. Ana Costa" : "例如：Ana Costa"}
                  className="w-full rounded-2xl border border-[#cfe0f3] bg-[#f8fbff] px-4 py-3 text-sm outline-none transition focus:border-[#0759ce] focus:bg-white"
                />
              </Field>

              <Field label="CPF">
                <input
                  value={form.cpf}
                  onChange={(event) => setForm((current) => ({ ...current, cpf: event.target.value }))}
                  placeholder="123.456.789-00"
                  className="w-full rounded-2xl border border-[#cfe0f3] bg-[#f8fbff] px-4 py-3 text-sm outline-none transition focus:border-[#0759ce] focus:bg-white"
                />
              </Field>

              <Field label={language === "pt" ? "E-mail" : language === "en" ? "Email" : "邮箱"}>
                <input
                  value={form.email}
                  onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                  placeholder="usuario@org.gov.br"
                  className="w-full rounded-2xl border border-[#cfe0f3] bg-[#f8fbff] px-4 py-3 text-sm outline-none transition focus:border-[#0759ce] focus:bg-white"
                />
              </Field>

              <Field label={language === "pt" ? "Perfil" : language === "en" ? "Profile" : "身份"}>
                <select
                  value={form.profile}
                  onChange={(event) => updateProfile(event.target.value as ProfileId)}
                  className="w-full rounded-2xl border border-[#cfe0f3] bg-[#f8fbff] px-4 py-3 text-sm outline-none transition focus:border-[#0759ce] focus:bg-white"
                >
                  {Object.values(PROFILES).map((profile) => (
                    <option key={profile.id} value={profile.id}>
                      {profile.name}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            <Field label={language === "pt" ? "Organização" : language === "en" ? "Organization" : "机构"}>
              <input
                value={form.org}
                onChange={(event) => setForm((current) => ({ ...current, org: event.target.value }))}
                className="w-full rounded-2xl border border-[#cfe0f3] bg-[#f8fbff] px-4 py-3 text-sm outline-none transition focus:border-[#0759ce] focus:bg-white"
              />
            </Field>

            <label className="flex items-center justify-between gap-4 rounded-2xl border border-[#d5e2f1] bg-[#f8fbff] px-4 py-3">
              <div>
                <div className="text-sm font-semibold text-foreground">{language === "pt" ? "Vínculo ativo" : language === "en" ? "Active assignment" : "启用绑定"}</div>
                <div className="mt-0.5 text-xs text-muted-foreground">
                  {language === "pt" ? "Usuário aparece como ativo na administração." : language === "en" ? "User appears as active in administration." : "用户将在管理中显示为启用。"}
                </div>
              </div>
              <input
                type="checkbox"
                checked={form.active}
                onChange={(event) => setForm((current) => ({ ...current, active: event.target.checked }))}
                className="h-5 w-5 accent-[#0759ce]"
              />
            </label>

            <div className="flex flex-col-reverse gap-3 border-t border-[#d5e2f1] pt-5 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => handleAssignmentOpenChange(false)}
                className="rounded-2xl border border-[#cfe0f3] bg-white px-5 py-3 text-sm font-semibold text-muted-foreground transition hover:bg-[#f4f8fd] hover:text-foreground"
              >
                {language === "pt" ? "Cancelar" : language === "en" ? "Cancel" : "取消"}
              </button>
              <button type="submit" className="primary-action rounded-2xl px-5 py-3 text-sm font-semibold">
                {language === "pt" ? "Criar vínculo" : language === "en" ? "Create assignment" : "创建绑定"}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="space-y-2 text-sm">
      <span className="font-semibold text-foreground">{label}</span>
      {children}
    </label>
  );
}
