import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

export type AssistantMode = "chat" | "report";

interface AssistantContextValue {
  open: boolean;
  mode: AssistantMode;
  focusShipId: string | null;
  openAssistant: (shipId?: string | null) => void;
  openReport: (shipId?: string | null) => void;
  closeAssistant: () => void;
  setFocusShipId: (shipId: string | null) => void;
}

const AssistantContext = createContext<AssistantContextValue>({
  open: false,
  mode: "chat",
  focusShipId: null,
  openAssistant: () => {},
  openReport: () => {},
  closeAssistant: () => {},
  setFocusShipId: () => {},
});

export function AssistantProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<AssistantMode>("chat");
  const [focusShipId, setFocusShipId] = useState<string | null>(null);

  const value = useMemo(
    () => ({
      open,
      mode,
      focusShipId,
      openAssistant: (shipId?: string | null) => {
        setMode("chat");
        setFocusShipId(shipId ?? null);
        setOpen(true);
      },
      openReport: (shipId?: string | null) => {
        setMode("report");
        setFocusShipId(shipId ?? null);
        setOpen(true);
      },
      closeAssistant: () => setOpen(false),
      setFocusShipId,
    }),
    [open, mode, focusShipId],
  );

  return <AssistantContext.Provider value={value}>{children}</AssistantContext.Provider>;
}

export function useAssistant() {
  return useContext(AssistantContext);
}
