import { NavLink, useLocation } from "react-router-dom";
import { LayoutDashboard, Map, Anchor, Hourglass, ShieldCheck, FolderOpen, Bell, LogOut, Users, AlertTriangle, Bot, ChevronRight, Moon, Sun } from "lucide-react";
import { useProfile } from "@/store/profileStore";
import { PROFILES } from "@/data/profiles";
import { cn } from "@/lib/utils";
import { LanguageSelector } from "@/components/LanguageSelector";
import { useLanguageCode, useT } from "@/i18n/useT";
import { useAssistant } from "@/store/assistantStore";
import { OperationalAssistant } from "@/components/OperationalAssistant";
import { useTheme } from "@/store/themeStore";

const NAV = [
  { to: "/mapa",       icon: Map,             labelKey: "nav.map" },
  { to: "/dashboard",  icon: LayoutDashboard, labelKey: "nav.dashboard" },
  { to: "/bercos",     icon: Anchor,          labelKey: "nav.berths" },
  { to: "/fila",       icon: Hourglass,       labelKey: "nav.queue" },
  { to: "/liberacoes", icon: ShieldCheck,     labelKey: "nav.clearances" },
  { to: "/documentos", icon: FolderOpen,      labelKey: "nav.documents" },
  { to: "/alertas",    icon: Bell,            labelKey: "nav.alerts" },
  { to: "/riscos",     icon: AlertTriangle,   labelKey: "nav.risks" },
  { to: "/admin",      icon: Users,           labelKey: "nav.admin" },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const { current, session, logout } = useProfile();
  const profile = current ? PROFILES[current] : null;
  const location = useLocation();
  const t = useT();
  const language = useLanguageCode();
  const { openAssistant, open } = useAssistant();
  const { theme, toggleTheme } = useTheme();

  const visibleNav = NAV.filter((n) => profile?.permissions.includes(n.to));
  const currentItem = NAV.find((n) => location.pathname.startsWith(n.to));
  const currentLabel = currentItem ? t(currentItem.labelKey) : t("app.title");

  return (
    <div className="flex h-[100dvh] flex-col overflow-hidden bg-background lg:flex-row">
      <aside className="navy-sheen relative flex max-h-[11rem] w-full shrink-0 flex-col border-b border-[#236198]/35 text-sidebar-foreground lg:max-h-none lg:w-[14.5rem] lg:border-b-0 lg:border-r">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-[radial-gradient(circle_at_22%_20%,rgba(88,174,255,0.18),transparent_34%)]" />
        <div className="relative flex items-center gap-2.5 border-b border-white/10 px-3.5 py-3 lg:px-4 lg:py-3.5">
          <div className="grid h-10 w-10 place-items-center rounded-[0.9rem] border border-white/[0.12] bg-[#0d4b95]/60 shadow-[0_20px_42px_-28px_rgba(62,159,255,0.9)] lg:h-9 lg:w-9">
            <Anchor className="h-5 w-5 text-white" strokeWidth={2.1} />
          </div>
          <div>
            <div className="text-lg font-bold leading-none tracking-[-0.03em] text-white lg:text-xl">PortOps</div>
          </div>
        </div>

        <nav className="relative flex gap-2 overflow-x-auto px-3 py-2.5 lg:flex-1 lg:flex-col lg:gap-1.5 lg:overflow-x-hidden lg:overflow-y-auto lg:px-3 lg:py-3">
          {visibleNav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  "group relative flex shrink-0 items-center gap-2.5 whitespace-nowrap rounded-[0.85rem] border px-3 py-2.5 text-[0.86rem] transition-all duration-300 active:scale-[0.99] lg:shrink lg:px-3 lg:py-2 lg:text-[0.82rem]",
                  isActive
                    ? "bg-[#0759ce] text-white border-[#4db5ff]/40 shadow-[0_12px_32px_-24px_rgba(77,181,255,0.95)]"
                    : "border-transparent text-sidebar-foreground/90 hover:bg-white/10 hover:border-white/10 hover:text-white"
                )
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && <span className="absolute inset-x-4 -bottom-1 h-1 rounded-t-full bg-[#6ad4ff] shadow-[0_0_18px_rgba(106,212,255,0.85)] lg:inset-x-auto lg:-right-1 lg:bottom-2.5 lg:top-2.5 lg:h-auto lg:w-1 lg:rounded-l-full" />}
                  <item.icon className={cn("h-[1.125rem] w-[1.125rem] lg:h-4 lg:w-4", isActive ? "text-white" : "text-sidebar-foreground/80 group-hover:text-white")} strokeWidth={1.85} />
                  <span className="font-medium">{t(item.labelKey)}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {profile && (
          <div className="relative hidden border-t border-white/10 p-3 lg:block">
            <div className="mb-2 rounded-[0.95rem] border border-white/10 bg-white/[0.055] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_20px_48px_-36px_rgba(50,157,255,0.55)]">
              <div className="mb-1 flex items-center gap-2">
                <profile.icon className="h-3.5 w-3.5 text-[#4bb2ff]" />
                <div className="truncate text-[11px] font-semibold text-white">{profile.name}</div>
                <ChevronRight className="ml-auto h-3.5 w-3.5 text-white/70" />
              </div>
              <div className="truncate font-mono text-[9px] text-sidebar-foreground/70">{profile.org}</div>
              {session && (
                <div className="mt-1.5 truncate font-mono text-[9px] leading-relaxed text-sidebar-foreground/60">
                  {session.name} · {session.cpf}
                </div>
              )}
            </div>
            <button onClick={logout} className="flex w-full items-center justify-center gap-2 rounded-[0.8rem] border border-white/10 px-3 py-2 text-[11px] text-sidebar-foreground/80 transition-all duration-200 hover:bg-white/10 hover:text-white active:scale-[0.98]">
              <LogOut className="h-3.5 w-3.5" /> {t("common.logout")}
            </button>
          </div>
        )}
      </aside>

      <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <header className="min-h-[4.35rem] border-b border-[#cbd9ea]/90 bg-white/90 backdrop-blur-xl px-6 py-3 flex items-center justify-between gap-5 shrink-0 shadow-[0_16px_38px_-34px_rgba(25,64,113,0.65)] dark:border-slate-700/80 dark:bg-slate-900/95">
          <div className="flex min-w-0 items-center gap-5">
            <div>
              <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-muted-foreground">PortOps</div>
              <h1 className="text-[1rem] font-semibold tracking-[-0.01em] text-foreground">{currentLabel}</h1>
            </div>
            <span className="hidden md:inline text-[10px] font-mono uppercase tracking-[0.22em] text-muted-foreground">/ {location.pathname.replace("/", "")}</span>
            <LanguageSelector className="hidden shrink-0 md:inline-flex" />
          </div>
          <div className="flex shrink-0 items-center gap-3 text-[11px] font-mono">
            <LanguageSelector className="md:hidden" />
            <span className="text-muted-foreground hidden lg:inline whitespace-nowrap">{new Date().toLocaleString("pt-BR")}</span>
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={theme === "dark" ? "Ativar tema claro" : "Ativar tema escuro"}
              title={theme === "dark" ? "Tema claro" : "Tema escuro"}
              className="grid h-10 w-10 place-items-center rounded-full border border-[#cbd9ea] bg-white text-[#183153] shadow-sm transition-colors hover:bg-[#f4f8fd] dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            {profile && (
              <div className="hidden min-w-[9.5rem] rounded-[0.9rem] border border-[#b9d2ef] bg-white/90 px-3 py-2 text-right shadow-[0_20px_42px_-30px_rgba(20,70,132,0.48)] sm:block">
                <div className="text-[9px] font-mono uppercase tracking-[0.18em] text-muted-foreground">{language === "pt" ? "Sessão ativa" : language === "en" ? "Active session" : "当前会话"}</div>
                <div className="mt-0.5 truncate text-sm font-semibold text-foreground">{profile.name}</div>
              </div>
            )}
          </div>
        </header>
        <div className="flex-1 overflow-auto bg-background">{children}</div>
        {!open && (
          <button
            type="button"
            onClick={() => openAssistant()}
            className="fixed bottom-6 right-6 z-50 inline-flex items-center gap-2 rounded-full border border-[#7cbcff]/50 px-4 py-3 text-sm font-semibold primary-action"
          >
            <Bot className="h-4 w-4" />
            {t("assistant.chat")}
          </button>
        )}
        <OperationalAssistant />
      </main>
    </div>
  );
}
