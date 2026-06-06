import { describe, expect, it } from "vitest";
import { answerAssistantQuery } from "@/lib/portopsAi";

describe("answerAssistantQuery", () => {
  it("matches a slightly misspelled Santos Express query without falling back to Nordic Tide", () => {
    const answer = answerAssistantQuery("gere um relatório do navio santo express", "pt");

    expect(answer.shipId).toBe("SHP-002");
    expect(answer.related?.[0]).toMatchObject({ label: "Santos Express", shipId: "SHP-002" });
    expect(answer.text).toContain("Santos Express");
    expect(answer.text).not.toContain("Nordic Tide");
  });

  it("prioritizes the vessel mentioned in the query over the focused vessel", () => {
    const answer = answerAssistantQuery("o que está bloqueando o Iberia Bulk?", "pt", "SHP-004");

    expect(answer.shipId).toBe("SHP-003");
    expect(answer.related?.[0]).toMatchObject({ label: "Iberia Bulk", shipId: "SHP-003" });
  });

  it("uses the remembered vessel for follow-up questions without a vessel name", () => {
    const answer = answerAssistantQuery("e o risco dele?", "pt", null, "SHP-002");

    expect(answer.shipId).toBe("SHP-002");
    expect(answer.text).toContain("Santos Express");
  });

  it("lets an explicitly mentioned vessel override the remembered vessel", () => {
    const answer = answerAssistantQuery("e o risco do Iberia Bulk?", "pt", null, "SHP-002");

    expect(answer.shipId).toBe("SHP-003");
    expect(answer.related?.[0]).toMatchObject({ label: "Iberia Bulk", shipId: "SHP-003" });
  });

  it("keeps fleet-wide questions as fleet summaries", () => {
    const answer = answerAssistantQuery("quais navios estão mais críticos agora?", "pt");

    expect(answer.text).toContain("A maior prioridade agora");
    expect(answer.related?.length).toBeGreaterThan(1);
  });
});
