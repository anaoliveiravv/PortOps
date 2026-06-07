import { describe, expect, it } from "vitest";
import { PROFILES } from "@/data/profiles";

const canonicalMenuOrder = [
  "/mapa",
  "/dashboard",
  "/bercos",
  "/fila",
  "/liberacoes",
  "/documentos",
  "/alertas",
  "/riscos",
];
const canonicalAdminMenuOrder = [...canonicalMenuOrder, "/admin"];

describe("port authority navigation", () => {
  it("keeps authority and admin profiles in the canonical menu order", () => {
    expect(PROFILES.gestor_porto.permissions).toEqual(canonicalMenuOrder);
    expect(PROFILES.admin_portuaria.permissions).toEqual(canonicalMenuOrder);
    expect(PROFILES.admin.permissions).toEqual(canonicalAdminMenuOrder);
  });
});
