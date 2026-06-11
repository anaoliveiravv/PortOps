import { FormEvent, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Anchor,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock3,
  FileText,
  KeyRound,
  LifeBuoy,
  LockKeyhole,
  ShieldCheck,
  UserRound,
  X,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import { useProfile } from "@/store/profileStore";
import { PROFILES, type ProfileId } from "@/data/profiles";
import shipImage from "../../fotosbase/navio.png";
import { Input } from "@/components/ui/input";
import { LanguageSelector } from "@/components/LanguageSelector";
import { useLanguageCode, useT } from "@/i18n/useT";
import { cn } from "@/lib/utils";

type Step = "login" | "request" | "status";
type GovLevel = "Prata" | "Ouro";
type ProfileRequestStatus = "analysis" | "approved" | "rejected";

interface AccessProfile {
  id: ProfileId;
  level: GovLevel;
}

interface ProfileRequest {
  profile: ProfileId;
  requestedAt: Date;
  status: ProfileRequestStatus;
}

const ACCESS_PROFILES: AccessProfile[] = [
  { id: "gestor_porto", level: "Ouro" },
  { id: "fiscal_receita", level: "Ouro" },
  { id: "policia_federal", level: "Ouro" },
  { id: "fiscal_anvisa", level: "Prata" },
  { id: "fiscal_vigiagro", level: "Prata" },
  { id: "operador", level: "Prata" },
  { id: "agente", level: "Prata" },
  { id: "transportadora", level: "Prata" },
];

const STATUS_CONTENT: Record<ProfileRequestStatus, {
  title: string;
  message: string;
  statusLabel: string;
  icon: LucideIcon;
  tone: string;
}> = {
  analysis: {
    title: "Em analise",
    message: "Sua solicitacao de acesso foi enviada para validacao institucional.",
    statusLabel: "Em analise",
    icon: Clock3,
    tone: "border-warning/25 bg-warning/10 text-warning",
  },
  approved: {
    title: "Aprovado",
    message: "Seu perfil foi liberado e ja pode ser usado na plataforma.",
    statusLabel: "Aprovado",
    icon: CheckCircle2,
    tone: "border-success/25 bg-success/10 text-success",
  },
  rejected: {
    title: "Rejeitado",
    message: "Nao foi possivel validar o vinculo com o perfil solicitado.",
    statusLabel: "Rejeitado",
    icon: XCircle,
    tone: "border-destructive/25 bg-destructive/10 text-destructive",
  },
};

const formatRequestDate = (date: Date) =>
  new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);

function GovBrand() {
  return (
    <span aria-label="gov.br" className="rounded-full bg-white px-4 py-2 text-[0.96rem] font-bold leading-none tracking-[-0.05em]">
      <span className="text-[#2f80ed]">g</span>
      <span className="text-[#f2c94c]">o</span>
      <span className="text-[#27ae60]">v</span>
      <span className="text-[#1f2937]">.</span>
      <span className="text-[#2f80ed]">b</span>
      <span className="text-[#f2c94c]">r</span>
    </span>
  );
}

export default function Login() {
  const { setProfile, setSession } = useProfile();
  const navigate = useNavigate();
  const t = useT();
  const language = useLanguageCode();
  const [step, setStep] = useState<Step>("login");
  const [cpf, setCpf] = useState("");
  const [password, setPassword] = useState("");
  const [selectedAccess, setSelectedAccess] = useState<AccessProfile | null>(null);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [profileRequest, setProfileRequest] = useState<ProfileRequest | null>(null);

  useEffect(() => {
    const root = document.documentElement;
    const hadDark = root.classList.contains("dark");
    const hadLight = root.classList.contains("light");
    let applying = false;

    const applyLightLogin = () => {
      if (applying) return;
      applying = true;
      root.classList.remove("dark");
      root.classList.add("light");
      applying = false;
    };

    applyLightLogin();

    const observer = new MutationObserver(() => {
      if (root.classList.contains("dark") || !root.classList.contains("light")) {
        applyLightLogin();
      }
    });

    observer.observe(root, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => {
      observer.disconnect();
      root.classList.remove("light");
      if (hadDark) root.classList.add("dark");
      if (hadLight) root.classList.add("light");
    };
  }, []);

  useEffect(() => {
    document.title =
      language === "pt"
        ? "PortOps - Acesso Institucional"
        : language === "en"
          ? "PortOps - Institutional Access"
          : "PortOps - 机构访问";
  }, [language]);

  const requestedProfile = profileRequest ? PROFILES[profileRequest.profile] : null;
  const requestedLevel = useMemo(
    () => ACCESS_PROFILES.find((item) => item.id === profileRequest?.profile)?.level ?? "Prata",
    [profileRequest],
  );

  const authenticateWithGov = (event?: FormEvent) => {
    event?.preventDefault();
    setSession({
      name: "Maria Silva",
      cpf: "***.***.***-12",
      org: "Gov.br",
    });
    setStep("request");
  };

  const openAuthorization = (access: AccessProfile) => {
    setSelectedAccess(access);
    setTermsAccepted(false);
  };

  const authorizeAccess = () => {
    if (!selectedAccess || !termsAccepted) return;
    setProfileRequest({
      profile: selectedAccess.id,
      requestedAt: new Date(),
      status: "analysis",
    });
    setSelectedAccess(null);
    setStep("status");
  };

  const enterApprovedProfile = () => {
    if (!profileRequest || profileRequest.status !== "approved") return;

    const id = profileRequest.profile;
    setProfile(id);
    setSession({
      name: "Maria Silva",
      cpf: "***.***.***-12",
      org: PROFILES[id].org,
    });
    navigate("/dashboard");
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f3f6fb] font-sans text-foreground">
      <div className="absolute right-4 top-4 z-20">
        <LanguageSelector />
      </div>

      <div className="grid min-h-screen lg:grid-cols-[1.23fr_1fr]">
        <section className="relative hidden min-h-screen overflow-hidden lg:block">
          <img
            src={shipImage}
            alt="Navio porta-conteineres no terminal portuario"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(6,35,77,0.18),rgba(8,39,83,0.4)),linear-gradient(90deg,rgba(7,39,84,0.94)_0%,rgba(8,47,98,0.7)_34%,rgba(9,46,95,0.26)_68%,rgba(9,46,95,0.18)_100%)]" />

          <div className="relative z-10 flex h-full flex-col justify-center px-14 py-12 text-white">
            <div className="flex items-center gap-4">
              <div className="grid h-14 w-14 place-items-center rounded-2xl bg-[#1653b8] shadow-[0_18px_40px_-24px_rgba(8,32,74,0.95)]">
                <Anchor className="h-7 w-7" strokeWidth={2.2} />
              </div>
              <div>
                <div className="text-[3rem] font-bold leading-none tracking-[-0.03em]">PortOps</div>
              </div>
            </div>

            <div className="max-w-[24rem] pt-12">
              <h1 className="max-w-[23rem] text-[2rem] font-bold leading-[1.02] tracking-[-0.05em] text-white xl:text-[2.25rem]">
                <span className="block whitespace-nowrap">{t("login.heroTitle1")}</span>
                <span className="block whitespace-nowrap">{t("login.heroTitle2")}</span>
              </h1>
            </div>
          </div>
        </section>

        <section className="relative flex min-h-screen items-center justify-center overflow-y-auto bg-[radial-gradient(circle_at_top,rgba(63,119,209,0.12),transparent_26%),linear-gradient(180deg,#f8fbff_0%,#edf3fb_100%)] px-5 py-5 sm:px-8 sm:py-6 lg:px-10 lg:py-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(255,255,255,0.88),transparent_44%)]" />

          <div className="relative z-10 flex min-h-0 w-full max-w-[35rem] flex-col justify-center">
            <div className="mb-6 flex items-center gap-3 lg:hidden">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-[#1653b8] text-white">
                <Anchor className="h-5 w-5" strokeWidth={2.2} />
              </div>
              <div>
                <div className="text-2xl font-bold tracking-[-0.03em] text-[#183153]">PortOps</div>
              </div>
            </div>

            <div
              className={cn(
                "premium-panel flex h-[calc(100dvh-5rem)] min-h-[29rem] flex-col overflow-y-auto rounded-[1.65rem] px-6 py-6 sm:min-h-[31rem] sm:px-8 sm:py-7 lg:px-10",
                step === "login" && "justify-center",
              )}
            >
              {step === "login" && (
                <>
                  <div className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-[1.4rem] border border-[#d9e3f1] bg-[#f7faff] text-[#1351b4] shadow-[0_12px_26px_-18px_rgba(19,81,180,0.5)] sm:h-16 sm:w-16">
                    <ShieldCheck className="h-7 w-7" strokeWidth={2.1} />
                  </div>

                  <div className="text-center">
                    <div className="login-display-label text-[#1f5dc4]">
                      {t("login.accessInstitutional")}
                    </div>
                    <h2 className="mt-3 text-[2rem] font-bold tracking-[-0.04em] text-[#183153] sm:text-[2.3rem]">
                      {t("login.submit")}
                    </h2>
                  </div>

                  <form onSubmit={authenticateWithGov} className="mx-auto mt-8 flex w-full flex-col rounded-[1.15rem] border border-[#b9cff0] bg-white px-4 py-4 shadow-[0_18px_48px_-38px_rgba(19,50,95,0.58),inset_0_1px_0_rgba(255,255,255,0.92)] sm:px-5">
                    <div className="flex flex-col gap-3 border-b border-[#d6e4f5] pb-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-[0.78rem] bg-[#0649b9] text-[0.74rem] font-bold tracking-[-0.04em] shadow-[0_14px_26px_-22px_rgba(5,55,145,0.95)]">
                          <span aria-label="gov.br">
                            <span className="text-[#2f80ed]">g</span>
                            <span className="text-[#f2c94c]">o</span>
                            <span className="text-[#27ae60]">v</span>
                            <span className="text-white">.</span>
                            <span className="text-[#2f80ed]">b</span>
                            <span className="text-[#f2c94c]">r</span>
                          </span>
                        </div>
                        <div className="min-w-0">
                          <div className="whitespace-nowrap text-base font-bold leading-tight tracking-[-0.02em] text-[#102a4c] sm:text-lg">{t("login.enterWithGov")}</div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 space-y-3">
                      <div>
                        <label className="mb-1.5 flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.1em] text-[#102a4c]">
                          <UserRound className="h-3.5 w-3.5 text-[#0649b9]" /> {t("login.cpf")}
                        </label>
                        <Input
                          value={cpf}
                          onChange={(event) => setCpf(event.target.value)}
                          className="h-12 rounded-[0.78rem] border-[#bcd0ea] bg-white px-4 text-sm text-[#183153] shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] placeholder:text-[#9aacc5]/80 hover:border-[#9fbee7] focus-visible:ring-[#8bb8f3]"
                          placeholder="123.456.789-00"
                          autoComplete="username"
                        />
                      </div>
                      <div>
                        <label className="mb-1.5 flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.1em] text-[#102a4c]">
                          <KeyRound className="h-3.5 w-3.5 text-[#0649b9]" /> {t("login.password")}
                        </label>
                        <Input
                          value={password}
                          onChange={(event) => setPassword(event.target.value)}
                          type="password"
                          className="h-12 rounded-[0.78rem] border-[#bcd0ea] bg-white px-4 text-sm text-[#183153] shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] placeholder:text-[#9aacc5]/80 hover:border-[#9fbee7] focus-visible:ring-[#8bb8f3]"
                          placeholder="Digite a senha"
                          autoComplete="current-password"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="primary-action mt-4 flex h-[4.2rem] w-full items-center justify-center gap-4 rounded-[1.25rem] px-6 text-[1rem] font-semibold"
                    >
                      <GovBrand />
                      {t("login.enterWithGov")} <ChevronRight className="h-4 w-4" />
                    </button>

                    <div className="mt-4 flex items-center justify-center border-t border-[#d6e4f5] pt-3">
                      <button
                        type="button"
                        onClick={() => authenticateWithGov()}
                        className="w-full rounded-[0.8rem] border border-[#a9c4eb] bg-white px-4 py-3 text-sm font-bold text-[#0649b9] transition-colors hover:bg-[#f4f8fd]"
                      >
                        Solicitar acesso
                      </button>
                    </div>
                  </form>
                </>
              )}

              {step === "request" && (
                <div className="flex min-h-0 flex-1 flex-col">
                  <div className="text-center">
                    <div className="login-display-label text-[#1f5dc4]">
                      Fluxo de acesso institucional inspirado no Gov.br
                    </div>
                    <h2 className="mt-3 text-[1.9rem] font-bold tracking-[-0.04em] text-[#183153] sm:text-[2.15rem]">
                      Solicitar Novo Acesso
                    </h2>
                    <p className="mx-auto mt-3 max-w-[30rem] text-sm leading-6 text-[#6d7f99]">
                      Selecione o perfil institucional desejado para iniciar a validacao de acesso.
                    </p>
                  </div>

                  <div className="mt-5 grid min-h-0 flex-1 grid-cols-1 gap-3 overflow-y-auto pr-1 sm:grid-cols-2">
                    {ACCESS_PROFILES.map((access) => {
                      const profile = PROFILES[access.id];
                      const Icon = profile.icon;

                      return (
                        <button
                          key={access.id}
                          type="button"
                          onClick={() => openAuthorization(access)}
                          className="group grid min-h-[7.75rem] grid-cols-[4.25rem_1fr] overflow-hidden rounded-[1.15rem] border border-[#dde6f2] bg-[#fbfdff] text-left transition-colors hover:border-[#9fc7f2] hover:bg-[#f4f8fe]"
                        >
                          <div className="grid place-items-center px-3">
                            <div className="grid h-12 w-12 place-items-center rounded-xl bg-[#edf4ff] text-[#1351b4]">
                              <Icon className="h-5 w-5" />
                            </div>
                          </div>
                          <div className="min-w-0 px-2 py-4">
                            <div className="text-sm font-bold leading-tight text-[#183153]">{profile.name}</div>
                            <div className="mt-1 text-xs text-[#53687f]">Exige gov.br {access.level}</div>
                            <div className="mt-1 truncate text-[0.68rem] uppercase tracking-[0.14em] text-[#70829b]">{profile.org}</div>
                          </div>
                          <div className="col-span-2 border-t border-[#d6e4f5] bg-[#eef5ff] px-3 py-2 text-center text-xs font-semibold text-[#102a4c]">
                            Exige gov.br {access.level}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {step === "status" && profileRequest && requestedProfile && (
                <div className="my-auto flex flex-col justify-center">
                  {(() => {
                    const content = STATUS_CONTENT[profileRequest.status];
                    const Icon = content.icon;

                    return (
                      <div className="rounded-[1.25rem] border border-[#d8e4f2] bg-[linear-gradient(180deg,#ffffff_0%,#f6faff_100%)] p-4 text-center shadow-[0_18px_48px_-40px_rgba(19,50,95,0.5),inset_0_1px_0_rgba(255,255,255,0.94)] sm:p-5">
                        <div className={cn("mx-auto grid h-10 w-10 place-items-center rounded-full border shadow-[0_10px_22px_-18px_currentColor]", content.tone)}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="mt-3 text-[0.9rem] font-semibold leading-tight text-[#1f5dc4]">
                          Acompanhamento da Solicitacao
                        </div>
                        <h3 className="mt-2 text-[1.55rem] font-extrabold leading-tight tracking-[-0.03em] text-[#183153]">
                          {content.title}
                        </h3>
                        <p className="mx-auto mt-2 max-w-[27rem] text-[0.8rem] leading-5 text-[#6d7f99]">
                          {content.message}
                        </p>

                        <div className="mt-4 rounded-[1rem] border border-[#dce5f2] bg-white/86 px-3 py-3 text-left shadow-[0_14px_32px_-30px_rgba(19,50,95,0.45)]">
                          <div className="grid gap-0 divide-y divide-[#d6e4f5] text-sm sm:grid-cols-3 sm:divide-x sm:divide-y-0">
                            <StatusInfoItem icon={UserRound} label="Perfil solicitado" value={requestedProfile.name} />
                            <StatusInfoItem icon={CalendarDays} label="Data da solicitacao" value={formatRequestDate(profileRequest.requestedAt)} />
                            <StatusInfoItem icon={LockKeyhole} label="Status" value={content.statusLabel} valueClassName={content.tone} />
                          </div>
                        </div>

                        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-center">
                          {profileRequest.status === "approved" && (
                            <button
                              type="button"
                              onClick={enterApprovedProfile}
                              className="primary-action inline-flex h-10 items-center justify-center gap-2 rounded-full px-5 text-sm font-semibold"
                            >
                              Acessar perfil aprovado <ChevronRight className="h-4 w-4" />
                            </button>
                          )}
                          {profileRequest.status === "rejected" && (
                            <button
                              type="button"
                              onClick={() => setStep("request")}
                              className="primary-action inline-flex h-10 items-center justify-center gap-2 rounded-full px-5 text-sm font-semibold"
                            >
                              Solicitar novo acesso
                            </button>
                          )}
                        </div>

                        <div className="mt-4 border-t border-[#d6e4f5] pt-3">
                          <div className="mb-2 text-[9px] font-bold uppercase tracking-[0.14em] text-[#70829b]">Prototipo</div>
                          <div className="flex flex-wrap justify-center gap-1.5">
                            {(["analysis", "approved", "rejected"] as ProfileRequestStatus[]).map((status) => (
                              <button
                                key={status}
                                type="button"
                                onClick={() => setProfileRequest((current) => current ? { ...current, status } : current)}
                                className={cn(
                                  "rounded-full border px-3 py-1.5 text-[0.72rem] font-bold transition-colors",
                                  profileRequest.status === status
                                    ? STATUS_CONTENT[status].tone
                                    : "border-[#d5e2f1] bg-white text-[#637592] hover:bg-[#f4f8fd]",
                                )}
                              >
                                {STATUS_CONTENT[status].statusLabel}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>

            {step === "login" && (
              <div className="absolute -bottom-10 left-0 right-0 flex items-center justify-center gap-5 text-sm text-[#6f8099]">
                <a href="#" className="inline-flex items-center gap-2 transition-colors hover:text-[#183153]">
                  <LifeBuoy className="h-4 w-4" />
                  Suporte
                </a>
                <span className="text-[#b2bfd1]">-</span>
                <a href="#" className="transition-colors hover:text-[#183153]">
                  Termos de uso
                </a>
                <span className="text-[#b2bfd1]">-</span>
                <a href="#" className="transition-colors hover:text-[#183153]">
                  Privacidade
                </a>
              </div>
            )}
          </div>
        </section>
      </div>

      {selectedAccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-[2px]" role="dialog" aria-modal="true" aria-labelledby="authorization-title">
          <div className="w-full max-w-[28rem] rounded-[1.15rem] border border-[#d7e4f2] bg-white p-5 shadow-[0_34px_90px_-42px_rgba(15,23,42,0.75)]">
            <div className="flex items-start justify-between gap-4">
              <h2 id="authorization-title" className="text-xl font-extrabold tracking-[-0.03em] text-[#004b82]">
                Autorizacao de Compartilhamento de Dados
              </h2>
              <button
                type="button"
                onClick={() => setSelectedAccess(null)}
                className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-[#53687f] transition-colors hover:bg-[#eef5ff] hover:text-[#102a4c]"
                aria-label="Fechar autorizacao"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="mt-4 text-sm leading-6 text-[#111827]">
              A Plataforma Integrada de Gestao Portuaria solicita acesso aos seus dados cadastrais para criar a solicitacao do perfil
              {" "}<strong>{PROFILES[selectedAccess.id].name}</strong> e validar o nivel gov.br <strong>{selectedAccess.level}</strong>.
            </p>

            <div className="mt-4 rounded-lg border border-[#d5e2f1] bg-[#f8fbff] p-3">
              <div className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[#0759ce]">
                <FileText className="h-3.5 w-3.5" /> Dados utilizados
              </div>
              <ul className="space-y-1.5 text-xs leading-5 text-[#405672]">
                <li>Nome completo, CPF e e-mail cadastrado no Gov.br.</li>
                <li>Nivel da conta Gov.br: {selectedAccess.level}.</li>
                <li>Perfil solicitado e orgao ou vinculo institucional.</li>
              </ul>
            </div>

            <label className="mt-4 flex cursor-pointer items-start gap-2 text-sm text-[#111827]">
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={(event) => setTermsAccepted(event.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-[#7a9ab8] text-[#1351b4] focus:ring-[#1351b4]"
              />
              <span>
                Li e concordo com os <a href="#" className="font-semibold text-[#0759ce] underline">Termos de Uso</a>.
              </span>
            </label>

            <div className="mt-5 grid gap-2">
              <button
                type="button"
                onClick={authorizeAccess}
                disabled={!termsAccepted}
                className="h-10 rounded-[0.8rem] bg-[#1351b4] text-sm font-bold text-white transition-colors hover:bg-[#0d459d] disabled:cursor-not-allowed disabled:bg-[#a9b8ca]"
              >
                Autorizar
              </button>
              <button
                type="button"
                onClick={() => setSelectedAccess(null)}
                className="h-10 rounded-[0.8rem] bg-[#e5e7eb] text-sm font-semibold text-[#374151] transition-colors hover:bg-[#d8dde5]"
              >
                Negar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatusInfoItem({
  icon: Icon,
  label,
  value,
  valueClassName,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <div className="px-2 py-2 text-center sm:py-1">
      <Icon className="mx-auto h-4 w-4 text-[#0759ce]" />
      <div className="mt-1.5 text-[9px] font-bold uppercase tracking-[0.12em] text-[#70829b]">{label}</div>
      <div className={cn("mt-1 text-[0.78rem] font-bold leading-snug text-[#183153]", valueClassName && "inline-flex rounded-full border px-3 py-1 text-[0.76rem]", valueClassName)}>
        {value}
      </div>
    </div>
  );
}
