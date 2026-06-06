import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useEffect } from "react";
import { BrowserRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { OperationalAssistant } from "@/components/OperationalAssistant";
import { AssistantProvider, useAssistant } from "@/store/assistantStore";

vi.mock("@/i18n/useT", () => {
  const messages: Record<string, string> = {
    "assistant.title": "Assistente Operacional PortOps",
    "assistant.subtitle": "Perguntas rápidas, alertas e apoio à decisão operacional.",
    "assistant.placeholder": "Pergunte sobre navios, riscos, pendências ou clima...",
    "assistant.quickTitle": "Perguntas rápidas",
    "assistant.chat": "Assistente",
    "assistant.reports": "Relatórios Inteligentes",
    "assistant.reportSummary": "Resumo executivo",
    "assistant.reportCopy": "Copiar relatório",
    "assistant.reportDownload": "Baixar .txt",
    "assistant.reportAlerts": "Principais alertas",
    "assistant.reportCriticalShips": "Navios críticos",
    "assistant.reportByAgency": "Pendências por órgão",
    "assistant.reportClimate": "Riscos climáticos",
    "assistant.reportRecommendations": "Recomendações de ação",
    "assistant.reportPriorities": "Próximas prioridades",
    "common.back": "Voltar",
    "common.send": "Enviar",
  };

  return {
    useLanguageCode: () => "pt",
    useT: () => (key: string) => messages[key] ?? key,
  };
});

function Harness() {
  const { openAssistant } = useAssistant();

  useEffect(() => {
    openAssistant();
  }, [openAssistant]);

  return <OperationalAssistant />;
}

function renderAssistant() {
  return render(
    <BrowserRouter>
      <AssistantProvider>
        <Harness />
      </AssistantProvider>
    </BrowserRouter>,
  );
}

function sendPrompt(prompt: string) {
  const input = screen.getByPlaceholderText("Pergunte sobre navios, riscos, pendências ou clima...");
  fireEvent.change(input, { target: { value: prompt } });
  fireEvent.click(screen.getByRole("button", { name: "Enviar" }));
}

describe("OperationalAssistant memory", () => {
  it("clears remembered vessel only when the chat is cleared", async () => {
    renderAssistant();

    sendPrompt("gere um relatório do navio santo express");
    expect((await screen.findAllByText(/Santos Express/)).length).toBeGreaterThan(0);

    sendPrompt("e o risco dele?");
    expect(await screen.findByText(/Para Santos Express, o maior risco ativo/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Limpar conversa" }));
    await waitFor(() => {
      expect(screen.queryByText(/Santos Express/)).not.toBeInTheDocument();
    });

    sendPrompt("e o risco dele?");
    await waitFor(() => {
      expect(screen.queryByText(/Santos Express/)).not.toBeInTheDocument();
    });
    expect(screen.getByText(/Ainda não encontrei um match direto/i)).toBeInTheDocument();
  });
});
