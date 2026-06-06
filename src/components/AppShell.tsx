import { NavLink, useLocation } from "react-router-dom";
import { LayoutDashboard, Map, Anchor, Hourglass, ShieldCheck, FolderOpen, Bell, LogOut, Radio, Users, AlertTriangle, Bot } from "lucide-react";
import { useProfile } from "@/store/profileStore";
import { PROFILES } from "@/data/profiles";
import { cn } from "@/lib/utils";
import { LanguageSelector } from "@/components/LanguageSelector";
import { useT } from "@/i18n/useT";
import { useAssistant } from "@/store/assistantStore";
import { OperationalAssistant } from "@/components/OperationalAssistant";

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
  const { openAssistant, open } = useAssistant();

  const visibleNav = NAV.filter((n) => profile?.permissions.includes(n.to));
  const currentItem = NAV.find((n) => location.pathname.startsWith(n.to));
  const currentLabel = currentItem ? t(currentItem.labelKey) : t("app.title");

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <aside className="navy-sheen w-72 shrink-0 text-sidebar-foreground flex flex-col border-r border-sidebar-border/80">
        <div className="px-6 py-6 flex items-center gap-3 border-b border-sidebar-border/90">
          <div className="h-11 w-11 rounded-2xl bg-white/8 border border-white/10 grid place-items-center shadow-lg">
            <Anchor className="h-5 w-5 text-white" strokeWidth={2.4} />
          </div>
          <div>
            <div className="font-bold tracking-tight text-white leading-none text-xl">PortOps</div>
            <div className="text-[10px] uppercase tracking-[0.22em] text-sidebar-foreground/65 mt-1 font-mono">{t("app.integration")}</div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {visibleNav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-4 py-3 rounded-2xl text-[13px] transition-all group relative border",
                  isActive
                    ? "bg-white text-sidebar border-white/20 shadow-lg shadow-black/10"
                    : "border-transparent text-sidebar-foreground hover:bg-white/7 hover:border-white/10 hover:text-white"
                )
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && <span className="absolute left-0 top-3 bottom-3 w-1 rounded-r-full bg-accent" />}
                  <item.icon className={cn("h-4 w-4", isActive ? "text-primary" : "text-sidebar-foreground/80")} />
                  <span>{t(item.labelKey)}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {profile && (
          <div className="p-4 border-t border-sidebar-border/90">
            <div className="rounded-2xl border border-white/10 bg-white/6 p-4 mb-3">
              <div className="flex items-center gap-2 mb-1.5">
                <profile.icon className="h-3.5 w-3.5 text-accent" />
                <div className="text-xs font-semibold text-white truncate">{profile.name}</div>
              </div>
              <div className="text-[10px] text-sidebar-foreground/70 font-mono truncate">{profile.org}</div>
              {session && (
                <div className="mt-2 text-[10px] font-mono text-sidebar-foreground/60 leading-relaxed">
                  {session.name} · {session.cpf}
                </div>
              )}
            </div>
            <button onClick={logout} className="w-full flex items-center justify-center gap-2 text-xs text-sidebar-foreground/80 hover:text-white px-3 py-2.5 rounded-2xl border border-white/10 hover:bg-white/7 transition-colors">
              <LogOut className="h-3.5 w-3.5" /> {t("common.logout")}
            </button>
          </div>
        )}
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 border-b border-border/80 bg-white/85 backdrop-blur-sm px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div>
              <div className="text-[11px] font-mono uppercase tracking-[0.22em] text-muted-foreground">PortOps</div>
              <h1 className="text-[15px] font-semibold tracking-wide text-foreground">{currentLabel}</h1>
            </div>
            <span className="hidden md:inline text-[10px] font-mono uppercase tracking-[0.18em] text-muted-foreground">/ {location.pathname.replace("/", "")}</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] font-mono">
            <LanguageSelector className="scale-[0.92] origin-right" />
            <span className="inline-flex items-center gap-2 rounded-full border border-success/25 bg-success/10 px-3 py-1.5 text-success">
              <span className="relative inline-block h-2 w-2 rounded-full bg-success">
                <span className="absolute inset-0 rounded-full bg-success animate-ping opacity-75" />
              </span>
              {t("app.systemsOnline")}
            </span>
            <span className="text-muted-foreground hidden xl:flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5">
              <Radio className="h-3 w-3" /> {t("app.integration")}
            </span>
            <span className="text-muted-foreground hidden md:inline">{new Date().toLocaleString("pt-BR")}</span>
          </div>
        </header>
        <div className="flex-1 overflow-auto bg-background">{children}</div>
        {!open && (
          <button
            type="button"
            onClick={() => openAssistant()}
            className="fixed bottom-6 right-6 z-50 inline-flex items-center gap-2 rounded-full border border-[#cfe0f3] bg-[#1351b4] px-4 py-3 text-sm font-semibold text-white shadow-[0_24px_60px_-30px_rgba(19,81,180,0.95)] transition hover:translate-y-[-1px] hover:bg-[#0f469a]"
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
