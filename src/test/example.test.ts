import { describe, it, expect } from "vitest";
import { alerts, berths, riskItems, ships } from "@/data/mockData";

describe("example", () => {
  it("should pass", () => {
    expect(true).toBe(true);
  });
});

describe("expanded mock data", () => {
  it("keeps the operational dataset connected after adding vessels", () => {
    expect(ships).toHaveLength(20);
    expect(ships.filter((ship) => ship.status === "anchored").map((ship) => ship.queuePosition).sort((a, b) => (a ?? 0) - (b ?? 0))).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
    expect(berths.some((berth) => berth.occupiedBy === "SHP-017")).toBe(true);
    expect(alerts.some((alert) => alert.shipId === "SHP-015" && alert.riskId === "R-008")).toBe(true);
    expect(riskItems.some((risk) => risk.shipId === "SHP-012")).toBe(true);
  });
});
