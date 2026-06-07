import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import Riscos from "@/pages/Riscos";

vi.mock("@/i18n/useT", () => ({
  useLanguageCode: () => "pt",
  useT: () => (key: string) => key,
}));

describe("Riscos focused ship context", () => {
  it("marks only the explicit focused risk when risk is present in the URL", () => {
    render(
      <MemoryRouter initialEntries={["/riscos?ship=SHP-003&risk=R-003"]}>
        <Riscos />
      </MemoryRouter>,
    );

    expect(screen.getByText(/Visualizando informações de Iberia Bulk · IMO 9612330/i)).toBeInTheDocument();
    expect(screen.queryByText("Risco em foco")).not.toBeInTheDocument();
    expect(screen.queryByText("Navio selecionado")).not.toBeInTheDocument();
    expect(screen.getByText("VIGIAGRO ultrapassou SLA de 2h").closest("[aria-current='true']")).toBeInTheDocument();
    expect(screen.getByText("Berço 06 em manutenção programada").closest("[aria-current='true']")).not.toBeInTheDocument();
  });

  it("shows the focused ship and marks direct and berth-related risks", () => {
    render(
      <MemoryRouter initialEntries={["/riscos?ship=SHP-003"]}>
        <Riscos />
      </MemoryRouter>,
    );

    expect(screen.getByText(/Visualizando informações de Iberia Bulk · IMO 9612330/i)).toBeInTheDocument();
    expect(screen.getAllByText("Navio selecionado")).toHaveLength(2);
    expect(screen.getByText("VIGIAGRO ultrapassou SLA de 2h")).toBeInTheDocument();
    expect(screen.getByText("Berço 06 em manutenção programada")).toBeInTheDocument();
  });
});
