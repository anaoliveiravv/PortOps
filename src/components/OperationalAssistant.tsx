import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowLeft, Bot, Copy, Download, FileText, MessageSquareMore, Send, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAssistant } from "@/store/assistantStore";
import { useLanguageCode, useT } from "@/i18n/useT";
import { analyzeFleet, answerAssistantQuery, buildOperationalReport, type AssistantAnswer } from "@/lib/portopsAi";
import { cn } from "@/lib/utils";
import { ShipLink } from "@/components/ShipLink";
import { ships } from "@/data/mockData";

type ChatMessage = {
  id: string;
  role: "assistant" | "user";
  text: string;
  severity?: "normal" | "attention" | "moderate" | "critical";
  related?: AssistantAnswer["related"];
  shipId?: string;
};

const QUICK_PROMPTS = {
  pt: [
    "Onde está o Iberia Bulk agora?",
    "O que está bloqueando a liberação do Nordic Tide?",
    "Quais navios estão mais críticos agora?",
  ],
  en: [
    "Where is Iberia Bulk right now?",
    "What is blocking Nordic Tide clearance?",
    "Which vessels are the most critical right now?",
  ],
  zh: [
    "Iberia Bulk 现在在哪里？",
    "是什么阻碍了 Nordic Tide 的放行？",
    "现在哪些船舶最关键？",
  ],
} as const;

const SEVERITY_STYLE: Record<NonNullable<ChatMessage["severity"]>, string> = {
  normal: "border-[#d5e2f1] bg-white text-foreground dark:border-border dark:bg-card",
  attention: "border-orange-200 bg-orange-50/80 text-foreground dark:border-warning/35 dark:bg-warning/10",
  moderate: "border-blue-200 bg-blue-50/80 text-foreground dark:border-info/35 dark:bg-info/10",
  critical: "border-red-200 bg-red-50/85 text-foreground dark:border-destructive/35 dark:bg-destructive/10",
};

function buildWelcomeMessage(language: "pt" | "en" | "zh", focusShipId: string | null) {
  const ship = focusShipId ? ships.find((item) => item.id === focusShipId) ?? null : null;

  if (!ship) {
    return language === "pt"
      ? "Estou pronto para responder sobre localização dos navios, gargalos, clima, documentos e liberações. Pergunte de forma direta."
      : language === "en"
        ? "I am ready to answer about vessel location, bottlenecks, weather, documents and clearances. Ask directly."
        : "我已准备好回答船舶位置、瓶颈、天气、文件和放行问题。请直接提问。";
  }

  return language === "pt"
    ? `Contexto carregado para ${ship.flag} ${ship.name}. Posso dizer onde ele está, o que trava a operação e qual deve ser a próxima ação.`
    : language === "en"
      ? `Context loaded for ${ship.flag} ${ship.name}. I can explain where it is, what is blocking the operation and what should happen next.`
      : `已载入 ${ship.flag} ${ship.name} 的上下文。我可以说明它的位置、阻塞原因以及下一步操作。`;
}

export function OperationalAssistant() {
  const t = useT();
  const language = useLanguageCode();
  const { open, mode, focusShipId, closeAssistant, openAssistant, openReport } = useAssistant();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [rememberedShipId, setRememberedShipId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const report = useMemo(() => buildOperationalReport(language, focusShipId), [language, focusShipId]);
  const fleetPreview = useMemo(() => analyzeFleet(language).slice(0, 3), [language]);
  const quickPrompts = QUICK_PROMPTS[language];
  const closeLabel = language === "pt" ? "Fechar assistente" : language === "en" ? "Close assistant" : "关闭助手";
  const clearLabel = language === "pt" ? "Limpar conversa" : language === "en" ? "Clear chat" : "清空对话";

  const createWelcomeMessage = useCallback((shipId?: string | null): ChatMessage => ({
    id: `welcome-${shipId ?? "fleet"}-${language}-${Date.now()}`,
    role: "assistant",
    text: buildWelcomeMessage(language, shipId ?? null),
    severity: "normal",
  }), [language]);

  useEffect(() => {
    if (!open) return;

    const activeShipId = rememberedShipId ?? focusShipId ?? null;

    if (messages.length === 0) {
      setInput("");
      setMessages([createWelcomeMessage(activeShipId)]);
    }

    if (focusShipId && focusShipId !== rememberedShipId) {
      setRememberedShipId(focusShipId);
    }
  }, [open, createWelcomeMessage, focusShipId, rememberedShipId, messages.length]);

  useEffect(() => {
    if (!open) {
      setCopied(false);
    }
  }, [open]);

  const handlePrompt = (prompt: string) => {
    const trimmedPrompt = prompt.trim();
    if (!trimmedPrompt) return;

    const answer = answerAssistantQuery(trimmedPrompt, language, focusShipId, rememberedShipId);
    const timestamp = Date.now();

    if (answer.shipId) {
      setRememberedShipId(answer.shipId);
    }

    setMessages((current) => [
      ...current,
      { id: `user-${timestamp}`, role: "user", text: trimmedPrompt },
      {
        id: `assistant-${timestamp}`,
        role: "assistant",
        text: answer.text,
        severity: answer.severity,
        related: answer.related,
        shipId: answer.shipId,
      },
    ]);
  };

  const handleSubmit = () => {
    if (!input.trim()) return;
    handlePrompt(input);
    setInput("");
  };

  const handleClearChat = () => {
    const nextShipId = focusShipId ?? null;
    setInput("");
    setRememberedShipId(nextShipId);
    setMessages([createWelcomeMessage(nextShipId)]);
  };

  const handleCopyReport = async () => {
    await navigator.clipboard.writeText(report.text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  const handleDownloadReport = () => {
    const blob = new Blob([report.text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "portops-relatorio-inteligente.txt";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-x-3 bottom-3 z-[60] sm:inset-x-auto sm:bottom-6 sm:right-6">
      <div className="w-full max-w-[calc(100vw-1.5rem)] sm:w-[28rem]">
        <div className="flex h-[min(44rem,calc(100dvh-1.5rem))] flex-col overflow-hidden rounded-[1.75rem] border border-[#cfe0f3] bg-[linear-gradient(180deg,#f8fbff_0%,#edf4fb_100%)] shadow-[0_26px_80px_-34px_rgba(16,45,87,0.48)] backdrop-blur-xl dark:border-border dark:bg-card dark:shadow-[0_26px_80px_-34px_rgba(0,0,0,0.78)] sm:h-[min(44rem,calc(100dvh-7rem))]">
          <div className="sticky top-0 z-10 border-b border-border/70 bg-white/90 backdrop-blur-xl dark:bg-card/95">
            <div className="flex items-start justify-between gap-3 px-4 pb-3 pt-4 sm:px-5">
              <div className="flex min-w-0 items-center gap-3">
                {mode === "report" && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openAssistant(focusShipId)}
                    className="shrink-0 rounded-full"
                    aria-label={t("common.back")}
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                )}
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-[#1351b4] text-white shadow-[0_18px_36px_-24px_rgba(19,81,180,0.9)]">
                  <Bot className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <div className="truncate text-[0.98rem] font-semibold text-[#183153]">{t("assistant.title")}</div>
                  <div className="truncate text-xs text-[#6d7f99]">{mode === "report" ? t("assistant.reports") : t("assistant.subtitle")}</div>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                {mode === "chat" && (
                  <Button variant="ghost" size="icon" onClick={handleClearChat} className="rounded-full" aria-label={clearLabel} title={clearLabel}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
                <Button variant="ghost" size="icon" onClick={closeAssistant} className="rounded-full" aria-label={closeLabel}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="px-4 pb-4 sm:px-5">
              <div className="grid grid-cols-2 gap-2 rounded-full border border-border bg-white p-1 dark:bg-secondary">
                <button
                  type="button"
                  onClick={() => openAssistant(focusShipId)}
                  className={cn(
                    "inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition-colors",
                    mode === "chat" ? "bg-[#1351b4] text-white shadow-sm" : "text-muted-foreground hover:bg-secondary dark:hover:bg-muted",
                  )}
                >
                  <MessageSquareMore className="h-4 w-4" />
                  {t("assistant.chat")}
                </button>
                <button
                  type="button"
                  onClick={() => openReport(focusShipId)}
                  className={cn(
                    "inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition-colors",
                    mode === "report" ? "bg-[#1351b4] text-white shadow-sm" : "text-muted-foreground hover:bg-secondary dark:hover:bg-muted",
                  )}
                >
                  <FileText className="h-4 w-4" />
                  {t("assistant.reports")}
                </button>
              </div>
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-5">
            {mode === "chat" ? (
              <div className="space-y-4">
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-[0.24em] text-muted-foreground">{t("assistant.quickTitle")}</div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {quickPrompts.map((prompt) => (
                      <button
                        key={prompt}
                        type="button"
                        onClick={() => handlePrompt(prompt)}
                        className="rounded-full border border-border bg-white px-3 py-2 text-left text-xs text-[#183153] shadow-sm transition-colors hover:border-[#1351b4]/30 hover:bg-[#f5f9ff] dark:bg-secondary dark:text-foreground dark:hover:border-primary/40 dark:hover:bg-muted"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={cn(
                        "rounded-[1.35rem] border px-4 py-3 text-sm leading-6 shadow-sm",
                        message.role === "user"
                          ? "ml-8 border-[#d7e3f5] bg-[#edf4ff] text-[#183153] dark:border-primary/25 dark:bg-primary/10 dark:text-foreground"
                          : SEVERITY_STYLE[message.severity ?? "normal"],
                      )}
                    >
                      <div className="whitespace-pre-line">{message.text}</div>
                      {message.related && message.related.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {message.related.map((item) =>
                            item.shipId ? (
                              <ShipLink
                                key={`${message.id}-${item.label}-${item.shipId}`}
                                shipId={item.shipId}
                                className="inline-flex items-center rounded-full border border-primary/20 bg-white px-3 py-1 text-[11px] font-semibold text-primary no-underline hover:border-primary/40 hover:bg-primary/5 dark:bg-secondary"
                              >
                                {item.label}
                              </ShipLink>
                            ) : (
                              <span
                                key={`${message.id}-${item.label}`}
                                className="inline-flex items-center rounded-full border border-border bg-white px-3 py-1 text-[11px] font-semibold text-muted-foreground dark:bg-secondary"
                              >
                                {item.label}
                              </span>
                            ),
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="rounded-[1.5rem] border border-border bg-white p-4 shadow-[0_18px_46px_-34px_rgba(16,45,87,0.34)] dark:bg-card">
                  <div className="text-[10px] font-mono uppercase tracking-[0.24em] text-muted-foreground">{t("assistant.reportSummary")}</div>
                  <div className="mt-2 text-sm leading-7 text-[#183153]">{report.summary}</div>
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <Button onClick={handleCopyReport} variant="outline" className="rounded-full border-[#cfe0f3] bg-white dark:bg-secondary">
                      <Copy className="h-4 w-4" />
                      {copied ? "OK" : t("assistant.reportCopy")}
                    </Button>
                    <Button onClick={handleDownloadReport} className="rounded-full bg-[#1351b4] hover:bg-[#0f469a]">
                      <Download className="h-4 w-4" />
                      {t("assistant.reportDownload")}
                    </Button>
                  </div>
                </div>

                <ReportList title={t("assistant.reportAlerts")} items={report.alerts} />
                <ReportList title={t("assistant.reportCriticalShips")} items={report.criticalShips} />
                <ReportList title={t("assistant.reportByAgency")} items={report.byAgency} />
                <ReportList title={t("assistant.reportClimate")} items={report.climate} />
                <ReportList title={t("assistant.reportRecommendations")} items={report.recommendations} />
                <ReportList title={t("assistant.reportPriorities")} items={report.priorities} />
              </div>
            )}
          </div>

          {mode === "chat" && (
            <div className="border-t border-border/60 bg-white/90 px-4 py-4 backdrop-blur dark:bg-card/95 sm:px-5">
              <div className="rounded-[1.5rem] border border-border bg-white p-3 shadow-[0_18px_46px_-34px_rgba(16,45,87,0.34)] dark:bg-secondary">
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                      event.preventDefault();
                      handleSubmit();
                    }
                  }}
                  placeholder={t("assistant.placeholder")}
                  className="min-h-[84px] border-0 bg-transparent p-0 text-[0.95rem] text-foreground shadow-none focus-visible:ring-0"
                />
                <div className="mt-3 flex items-center justify-between gap-3">
                  <div className="truncate text-[11px] text-muted-foreground">
                    {fleetPreview.map((item) => item.shipName).join(" · ")}
                  </div>
                  <Button onClick={handleSubmit} className="rounded-full bg-[#1351b4] px-4 text-white hover:bg-[#0f469a]">
                    <Send className="h-4 w-4" />
                    {t("common.send")}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ReportList({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-[1.35rem] border border-border bg-white p-4 shadow-[0_14px_36px_-34px_rgba(16,45,87,0.28)] dark:bg-card">
      <div className="text-[10px] font-mono uppercase tracking-[0.24em] text-muted-foreground">{title}</div>
      <div className="mt-3 space-y-2">
        {items.length ? (
          items.map((item) => (
            <div key={item} className="rounded-2xl border border-[#dce5f2] bg-[#f8fbff] px-3 py-2 text-sm text-[#183153] dark:border-border dark:bg-secondary dark:text-foreground">
              {item}
            </div>
          ))
        ) : (
          <div className="rounded-2xl border border-dashed border-border px-3 py-2 text-sm text-muted-foreground">
            -
          </div>
        )}
      </div>
    </div>
  );
}
