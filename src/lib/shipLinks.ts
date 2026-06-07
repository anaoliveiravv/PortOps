export function getShipMapHref(shipId: string) {
  return `/mapa?ship=${encodeURIComponent(shipId)}`;
}

export function getShipBerthsHref(shipId: string, berthId?: string) {
  const params = new URLSearchParams({ ship: shipId });
  if (berthId) params.set("berth", berthId);
  return `/bercos?${params.toString()}`;
}

export function getShipRisksHref(shipId: string, riskId?: string) {
  const params = new URLSearchParams({ ship: shipId });
  if (riskId) params.set("risk", riskId);
  return `/riscos?${params.toString()}`;
}
