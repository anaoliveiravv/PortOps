import { fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import Alertas from "@/pages/Alertas";

vi.mock("@/i18n/useT", () => ({
  useLanguageCode: () => "pt",
  useT: () => (key: string) => key,
}));

describe("Alertas modal", () => {
  it("opens alert details with recommended action", () => {
    render(
      <MemoryRouter>
        <Alertas />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByText("ANVISA bloqueou MV Hamburg Trader"));

    const dialog = screen.getByRole("dialog");
    expect(within(dialog).getByText("ANVISA bloqueou MV Hamburg Trader")).toBeInTheDocument();
    expect(within(dialog).getByText("Ação recomendada")).toBeInTheDocument();
    expect(within(dialog).getByText("Agente deve reapresentar certificado MSDS atualizado.")).toBeInTheDocument();
  });
});
