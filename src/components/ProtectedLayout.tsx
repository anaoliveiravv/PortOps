import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useProfile } from "@/store/profileStore";
import { AppShell } from "@/components/AppShell";
import { PROFILES } from "@/data/profiles";
import { ShieldAlert } from "lucide-react";
import { useT } from "@/i18n/useT";

export default function ProtectedLayout({ children }: { children: ReactNode }) {
  const { current, session } = useProfile();
  const location = useLocation();
  const t = useT();
  if (!current || !session) return <Navigate to="/login" replace />;

  const profile = PROFILES[current];
  const allowed = profile.permissions.some((p) => location.pathname.startsWith(p));

  if (!allowed) {
    return (
      <AppShell>
        <div className="p-10 max-w-xl mx-auto mt-16 rounded-md border border-border bg-card text-center">
          <div className="h-12 w-12 rounded-full bg-warning/15 text-warning grid place-items-center mx-auto mb-4">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-bold mb-2">{t("protected.restrictedTitle")}</h2>
          <p className="text-sm text-muted-foreground">
            {t("protected.restrictedBody")} <strong>{profile.name}</strong>.
          </p>
        </div>
      </AppShell>
    );
  }

  return <AppShell>{children}</AppShell>;
}
