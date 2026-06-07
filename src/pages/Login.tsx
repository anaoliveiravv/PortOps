import { FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Anchor, ChevronRight, LifeBuoy, LockKeyhole, ShieldCheck, KeyRound, UserRound, CheckCircle2 } from "lucide-react";
import { useProfile } from "@/store/profileStore";
import { PROFILES, DEMO_PROFILES, detectProfile, type ProfileId } from "@/data/profiles";
import shipImage from "../../fotosbase/navio.png";
import { Input } from "@/components/ui/input";
import { LanguageSelector } from "@/components/LanguageSelector";
import { useLanguageCode, useT } from "@/i18n/useT";
import { cn } from "@/lib/utils";

type Step = "landing" | "gov" | "success" | "demo";

export default function Login() {
  const { setProfile, setSession } = useProfile();
  const navigate = useNavigate();
  const t = useT();
  const language = useLanguageCode();
  const [step, setStep] = useState<Step>("landing");
  const [cpf, setCpf] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    document.title =
      language === "pt"
        ? "PortOps - Operações Portuárias Integradas"
        : language === "en"
          ? "PortOps - Integrated Port Operations"
          : "PortOps - 综合港口运营";
  }, [language]);

  const handleGovEntry = (event: FormEvent) => {
    event.preventDefault();
    setStep("success");
    const detected = detectProfile();
    setSession({
      name: "Maria Silva",
      cpf: "***.***.***-12",
      org: PROFILES[detected].org,
    });
  };

  const enterAs = (id: ProfileId) => {
    setProfile(id);
    setSession({
      name: "Maria Silva",
      cpf: "***.***.***-12",
      org: PROFILES[id].org,
    });
    navigate(id === "admin" ? "/admin" : "/mapa");
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
            alt="Navio porta-contêineres no terminal portuário"
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
              <p className="mt-5 max-w-[23rem] text-[0.92rem] leading-[1.7] text-white/[0.78]">
                {t("login.heroLead")}
              </p>
            </div>
          </div>
        </section>

        <section className="relative flex min-h-screen items-center justify-center overflow-y-auto bg-[radial-gradient(circle_at_top,rgba(63,119,209,0.12),transparent_26%),linear-gradient(180deg,#f8fbff_0%,#edf3fb_100%)] px-5 py-5 sm:px-8 sm:py-6 lg:px-10 lg:py-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(255,255,255,0.88),transparent_44%)]" />

          <div className={cn("relative z-10 flex min-h-0 w-full flex-col justify-center", step === "gov" ? "max-w-[46rem]" : "max-w-[35rem]")}>
            <div className="mb-6 flex items-center gap-3 lg:hidden">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-[#1653b8] text-white">
                <Anchor className="h-5 w-5" strokeWidth={2.2} />
              </div>
              <div>
                <div className="text-2xl font-bold tracking-[-0.03em] text-[#183153]">PortOps</div>
              </div>
            </div>

            <div
              className="premium-panel flex max-h-[calc(100dvh-6.5rem)] min-h-[32rem] flex-col overflow-y-auto rounded-[2rem] px-6 py-6 sm:min-h-[35rem] sm:px-8 sm:py-7 lg:px-10"
            >
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
                <p className="mt-3 text-[0.98rem] leading-7 text-[#6d7f99]">
                  {t("login.heroLead")}
                </p>
              </div>

              {step === "landing" && (
                <div className="mt-6 flex flex-1 flex-col justify-center">
                  <div className="rounded-[1.45rem] border border-[#dce5f2] bg-[linear-gradient(180deg,#f8fbff_0%,#f3f7fd_100%)] px-5 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] sm:px-6">
                    <div className="flex items-start gap-4">
                      <div className="mt-0.5 grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white text-[#1351b4] shadow-[0_10px_22px_-18px_rgba(19,81,180,0.8)]">
                        <LockKeyhole className="h-5 w-5" strokeWidth={2.1} />
                      </div>
                      <p className="text-left text-[0.98rem] leading-7 text-[#5f708a]">
                        {t("login.accessNotice").replace("Prata ou Ouro.", "")}
                        <strong className="font-semibold text-[#183153]">{t("login.level")}</strong>
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setStep("gov")}
                    className="primary-action mt-7 flex h-[4.2rem] w-full items-center justify-center gap-4 rounded-[1.25rem] px-6 text-[1rem] font-semibold"
                  >
                    <span className="rounded-full bg-white px-4 py-2 text-[0.96rem] font-bold leading-none text-[#1351b4]">
                      gov.br
                    </span>
                    {t("login.enterWithGov")}
                  </button>
                </div>
              )}

              {step === "gov" && (
                <form onSubmit={handleGovEntry} className="mt-4 flex flex-1 flex-col rounded-[1.55rem] border border-[#b9cff0] bg-white px-5 py-4 shadow-[0_22px_64px_-46px_rgba(19,50,95,0.68),inset_0_1px_0_rgba(255,255,255,0.92)] sm:px-6 sm:py-5">
                  <div className="flex flex-col gap-3 border-b border-[#d6e4f5] pb-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex min-w-0 items-center gap-3.5">
                      <div className="grid h-14 w-14 shrink-0 place-items-center rounded-[1rem] bg-[#0649b9] text-[0.95rem] font-bold tracking-[-0.04em] shadow-[0_16px_30px_-24px_rgba(5,55,145,0.95)]">
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
                        <div className="whitespace-nowrap text-lg font-bold leading-tight tracking-[-0.04em] text-[#102a4c] sm:text-[1.35rem]">{t("login.enterWithGov")}</div>
                      </div>
                    </div>
                    <div className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full border border-[#c4d8f3] bg-white/90 px-3.5 py-1.5 text-[9px] font-bold uppercase tracking-[0.18em] text-[#0649b9] shadow-[inset_0_1px_0_rgba(255,255,255,0.94)]">
                      <ShieldCheck className="h-3.5 w-3.5 text-[#7b95b8]" />
                      Prata/Ouro
                    </div>
                  </div>

                  <div className="mt-4 space-y-4">
                    <div>
                      <label className="mb-2 flex items-center gap-2.5 text-[10px] font-bold uppercase tracking-[0.3em] text-[#102a4c]">
                        <UserRound className="h-4 w-4 text-[#0649b9]" /> {t("login.cpf")}
                      </label>
                      <Input
                        value={cpf}
                        onChange={(e) => setCpf(e.target.value)}
                        className="h-14 rounded-[0.95rem] border-[#bcd0ea] bg-white px-5 text-base text-[#183153] shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] placeholder:text-[#9aacc5]/80 hover:border-[#9fbee7] focus-visible:ring-[#8bb8f3]"
                        placeholder="123.456.789-00"
                      />
                    </div>
                    <div>
                      <label className="mb-2 flex items-center gap-2.5 text-[10px] font-bold uppercase tracking-[0.3em] text-[#102a4c]">
                        <KeyRound className="h-4 w-4 text-[#0649b9]" /> {t("login.password")}
                      </label>
                      <Input
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        type="password"
                        className="h-14 rounded-[0.95rem] border-[#bcd0ea] bg-white px-5 text-base text-[#183153] shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] placeholder:text-[#9aacc5]/80 hover:border-[#9fbee7] focus-visible:ring-[#8bb8f3]"
                        placeholder="Digite a senha"
                      />
                    </div>
                  </div>

                  <div className="mt-auto flex items-center justify-between gap-4 pt-5">
                    <button
                      type="button"
                      onClick={() => setStep("landing")}
                      className="min-w-28 rounded-[1rem] border border-[#a9c4eb] bg-white px-5 py-2.5 text-sm font-bold text-[#0649b9] transition-colors hover:bg-[#f4f8fd]"
                    >
                      {t("common.back")}
                    </button>
                    <button
                      type="submit"
                      className="primary-action inline-flex h-12 min-w-44 items-center justify-center gap-3 rounded-[1rem] px-8 text-base font-bold"
                    >
                      Entrar <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 border-t border-[#d6e4f5] pt-3 text-[11px] text-[#637592]">
                    <span>Está com dúvidas e precisa de ajuda?</span>
                    <a href="#" className="font-semibold text-[#0649b9] hover:underline">Esqueci minha senha</a>
                    <a href="#" className="font-semibold text-[#0649b9] hover:underline">Termos de Uso</a>
                    <a href="#" className="font-semibold text-[#0649b9] hover:underline">Aviso de privacidade</a>
                    <a href="#" className="font-semibold text-[#0649b9] hover:underline">Cadastre-se</a>
                  </div>
                </form>
              )}

              {step === "success" && (
                <div className="mt-7 flex flex-1 flex-col justify-center rounded-[1.55rem] border border-[#dce7f3] bg-[linear-gradient(180deg,#f8fbff_0%,#eef5fd_100%)] p-5 text-center">
                  <div className="mx-auto grid h-14 w-14 place-items-center rounded-full border border-success/20 bg-success/10 text-success">
                    <CheckCircle2 className="h-7 w-7" />
                  </div>
                  <div className="login-display-label mt-4 text-[#1f5dc4]">
                    {t("login.successTitle")}
                  </div>
                  <div className="mt-3 text-[1.2rem] font-bold tracking-[-0.03em] text-[#183153] sm:text-[1.28rem]">
                    {t("login.successLead")}
                  </div>
                  <p className="mt-3 text-sm leading-6 text-[#6d7f99]">
                    {t("login.successBody")}
                  </p>
                  <button
                    onClick={() => setStep("demo")}
                    className="primary-action mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-full px-5 text-sm font-semibold"
                  >
                    {t("common.continue")} <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              )}

              {step === "demo" && (
                <div className="mt-6 flex min-h-0 flex-1 flex-col">
                  <div className="login-display-label rounded-[1.1rem] bg-[#edf5ff] px-4 py-3 text-center text-[#1f5dc4]">
                    {t("login.selectProfile")}
                  </div>
                  <p className="mt-3 text-center text-sm leading-6 text-[#6d7f99]">
                    {t("login.profileLead")}
                  </p>

                  <div className="mt-4 min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
                    {DEMO_PROFILES.map((id) => {
                      const profile = PROFILES[id];
                      return (
                        <button
                          key={id}
                          onClick={() => enterAs(id)}
                          className="flex w-full items-center gap-3 rounded-[1.15rem] border border-[#dde6f2] bg-[#fbfdff] px-4 py-2.5 text-left transition-colors hover:border-[#b9cdec] hover:bg-[#f4f8fe]"
                        >
                          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#edf4ff] text-[#1351b4]">
                            <profile.icon className="h-4 w-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-sm font-semibold text-[#183153]">{profile.name}</div>
                            <div className="truncate text-[0.72rem] uppercase tracking-[0.18em] text-[#70829b]">
                              {profile.org}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-5 flex items-center justify-center gap-5 text-sm text-[#6f8099]">
              <a href="#" className="inline-flex items-center gap-2 transition-colors hover:text-[#183153]">
                <LifeBuoy className="h-4 w-4" />
                Suporte
              </a>
              <span className="text-[#b2bfd1]">•</span>
              <a href="#" className="transition-colors hover:text-[#183153]">
                Termos de uso
              </a>
              <span className="text-[#b2bfd1]">•</span>
              <a href="#" className="transition-colors hover:text-[#183153]">
                Privacidade
              </a>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
