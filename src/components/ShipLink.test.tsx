import { describe, expect, it } from "vitest";
import { getShipBerthsHref, getShipMapHref, getShipRisksHref } from "@/lib/shipLinks";

describe("ship contextual links", () => {
  it("builds map, berth and risk links with the focused ship id", () => {
    expect(getShipMapHref("SHP-002")).toBe("/mapa?ship=SHP-002");
    expect(getShipBerthsHref("SHP-002")).toBe("/bercos?ship=SHP-002");
    expect(getShipRisksHref("SHP-002")).toBe("/riscos?ship=SHP-002");
  });

  it("builds contextual berth and risk links with focused item ids", () => {
    expect(getShipBerthsHref("SHP-003", "B-06")).toBe("/bercos?ship=SHP-003&berth=B-06");
    expect(getShipRisksHref("SHP-003", "R-003")).toBe("/riscos?ship=SHP-003&risk=R-003");
  });
});
