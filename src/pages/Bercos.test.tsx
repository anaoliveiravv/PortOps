import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import Bercos from "@/pages/Bercos";

vi.mock("@/i18n/useT", () => ({
  useLanguageCode: () => "pt",
  useT: () => (key: string) => key,
}));

describe("Bercos focused ship context", () => {
  it("marks only the explicit focused berth when berth is present in the URL", () => {
    render(
      <MemoryRouter initialEntries={["/bercos?ship=SHP-003&berth=B-06"]}>
        <Bercos />
      </MemoryRouter>,
    );

    expect(screen.getByText("Berço em foco")).toBeInTheDocument();
    expect(screen.queryByText("Navio selecionado")).not.toBeInTheDocument();
    expect(screen.getByText("Berço 06").closest("[aria-current='true']")).toBeInTheDocument();
    expect(screen.getByText("Berço 01").closest("[aria-current='true']")).not.toBeInTheDocument();
  });

  it("shows the focused ship and marks the related berth after icon cleanup", () => {
    render(
      <MemoryRouter initialEntries={["/bercos?ship=SHP-002"]}>
        <Bercos />
      </MemoryRouter>,
    );

    expect(screen.getByText("Navio selecionado")).toBeInTheDocument();
    expect(screen.getByText("Berço 01")).toBeInTheDocument();
  });
});
