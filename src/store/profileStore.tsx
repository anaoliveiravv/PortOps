import { createContext, useContext, useState, ReactNode } from "react";
import type { ProfileId } from "@/data/profiles";

export interface UserSession {
  name: string;
  cpf: string;
  org: string;
}

interface Ctx {
  current: ProfileId | null;
  setProfile: (p: ProfileId | null) => void;
  session: UserSession | null;
  setSession: (s: UserSession | null) => void;
  logout: () => void;
}
const ProfileCtx = createContext<Ctx>({
  current: null,
  setProfile: () => {},
  session: null,
  setSession: () => {},
  logout: () => {},
});

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [current, setProfile] = useState<ProfileId | null>(null);
  const [session, setSession] = useState<UserSession | null>(null);
  const logout = () => { setProfile(null); setSession(null); };
  return (
    <ProfileCtx.Provider value={{ current, setProfile, session, setSession, logout }}>
      {children}
    </ProfileCtx.Provider>
  );
}

export const useProfile = () => useContext(ProfileCtx);
