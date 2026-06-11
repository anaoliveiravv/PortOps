import { Fragment, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  ships as initialShips,
  type RiskLevel,
  type Ship,
} from "@/data/mockData";
import { ClearanceBadge, ShipStatusBadge, RiskBadge, RISK_HSL } from "@/components/StatusBadges";
import {
  Anchor,
  Clock,
  FileText,
  History,
  MapPinned,
  Navigation,
  Sparkles,
  ShieldCheck,
  TriangleAlert,
  X,
  type LucideIcon,
} from "lucide-react";
import {
  Map,
  MapControls,
  MapMarker,
  MapRoute,
  MarkerContent,
  MarkerLabel,
  MarkerPopup,
  MarkerTooltip,
  type MapRef,
} from "@/components/ui/map";
import { cn } from "@/lib/utils";
import { useLanguageCode, useT } from "@/i18n/useT";
import { analyzeShip } from "@/lib/portopsAi";
import { useAssistant } from "@/store/assistantStore";
import { getShipBerthsHref, getShipRisksHref } from "@/lib/shipLinks";

const WORLD_CENTER: [number, number] = [-18, 8];

const ROUTE_COLORS: Record<string, string> = {
  low: "#2e9e54",
  medium: "#d78a1d",
  high: "#de6e2f",
  critical: "#c63d3d",
};

type PortPoint = {
  id: string;
  name: string;
  longitude: number;
  latitude: number;
  label: string;
};

const PORTS: PortPoint[] = [
  { id: "rotterdam", name: "Rotterdam", longitude: 4.4777, latitude: 51.9244, label: "Origem Europa" },
  { id: "buenos_aires", name: "Buenos Aires", longitude: -58.3816, latitude: -34.6037, label: "Origem Cone Sul" },
  { id: "algeciras", name: "Algeciras", longitude: -5.4562, latitude: 36.1408, label: "Origem Mediterrâneo" },
  { id: "stavanger", name: "Stavanger", longitude: 5.7331, latitude: 58.97, label: "Origem Mar do Norte" },
  { id: "singapura", name: "Singapura", longitude: 103.8198, latitude: 1.3521, label: "Origem Ásia" },
  { id: "itajai_origem", name: "Itajaí", longitude: -48.6638, latitude: -26.9101, label: "Origem Cabotagem" },
  { id: "hamburgo", name: "Hamburgo", longitude: 9.9937, latitude: 53.5511, label: "Origem Europa" },
  { id: "tubarao", name: "Tubarão", longitude: -40.2944, latitude: -20.2824, label: "Origem Brasil" },
  { id: "cartagena", name: "Cartagena", longitude: -75.4794, latitude: 10.391, label: "Origem Caribe" },
  { id: "houston", name: "Houston", longitude: -95.0179, latitude: 29.728, label: "Origem Golfo" },
  { id: "durban", name: "Durban", longitude: 31.0218, latitude: -29.8587, label: "Origem África Austral" },
  { id: "shanghai", name: "Shanghai", longitude: 121.4737, latitude: 31.2304, label: "Origem Ásia" },
  { id: "antwerp", name: "Antuérpia", longitude: 4.4025, latitude: 51.2194, label: "Origem Europa" },
  { id: "valparaiso", name: "Valparaíso", longitude: -71.6273, latitude: -33.0472, label: "Origem Pacífico Sul" },
  { id: "lagos", name: "Lagos", longitude: 3.3792, latitude: 6.5244, label: "Origem África Ocidental" },
  { id: "new_orleans", name: "New Orleans", longitude: -90.0715, latitude: 29.9511, label: "Origem Golfo" },
  { id: "lisboa", name: "Lisboa", longitude: -9.1393, latitude: 38.7223, label: "Origem Atlântico Norte" },
  { id: "dakar", name: "Dakar", longitude: -17.4677, latitude: 14.7167, label: "Origem África Ocidental" },
  { id: "cape_town", name: "Cidade do Cabo", longitude: 18.4241, latitude: -33.9249, label: "Origem África Austral" },
  { id: "santos", name: "Santos", longitude: -46.3336, latitude: -23.9608, label: "Origem Cabotagem" },
  { id: "hub", name: "PortOps Hub", longitude: -44.3028, latitude: -2.5297, label: "Centro integrado" },
  { id: "itaqui", name: "Porto do Itaqui", longitude: -44.3651, latitude: -2.5652, label: "Porto principal" },
  { id: "ponta_madeira", name: "Ponta da Madeira", longitude: -44.3786, latitude: -2.5718, label: "Terminal mineral" },
  { id: "alumar", name: "Alumar", longitude: -44.3398, latitude: -2.6242, label: "Terminal químico" },
  { id: "fundeio", name: "Área de fundeio", longitude: -44.252, latitude: -2.472, label: "Aproximação" },
];

const ORIGIN_BY_SHIP: Record<string, string> = {
  "SHP-001": "rotterdam",
  "SHP-002": "buenos_aires",
  "SHP-003": "algeciras",
  "SHP-004": "stavanger",
  "SHP-005": "singapura",
  "SHP-006": "itajai_origem",
  "SHP-007": "hamburgo",
  "SHP-008": "tubarao",
  "SHP-009": "cartagena",
  "SHP-010": "houston",
  "SHP-011": "durban",
  "SHP-012": "shanghai",
  "SHP-013": "antwerp",
  "SHP-014": "valparaiso",
  "SHP-015": "lagos",
  "SHP-016": "new_orleans",
  "SHP-017": "lisboa",
  "SHP-018": "dakar",
  "SHP-019": "cape_town",
  "SHP-020": "santos",
};

const DESTINATION_BY_SHIP: Record<string, string> = {
  "SHP-001": "itaqui",
  "SHP-002": "hub",
  "SHP-003": "itaqui",
  "SHP-004": "ponta_madeira",
  "SHP-005": "hub",
  "SHP-006": "hub",
  "SHP-007": "alumar",
  "SHP-008": "itaqui",
  "SHP-009": "hub",
  "SHP-010": "ponta_madeira",
  "SHP-011": "itaqui",
  "SHP-012": "hub",
  "SHP-013": "hub",
  "SHP-014": "itaqui",
  "SHP-015": "alumar",
  "SHP-016": "itaqui",
  "SHP-017": "hub",
  "SHP-018": "itaqui",
  "SHP-019": "ponta_madeira",
  "SHP-020": "itaqui",
};

const LOCAL_POSITION_BY_SHIP: Record<string, { longitude: number; latitude: number }> = {
  "SHP-001": { longitude: -44.343, latitude: -2.563 },
  "SHP-002": { longitude: -44.319, latitude: -2.546 },
  "SHP-003": { longitude: -44.263, latitude: -2.477 },
  "SHP-004": { longitude: -44.238, latitude: -2.455 },
  "SHP-005": { longitude: -22.2, latitude: -1.3 },
  "SHP-006": { longitude: -44.277, latitude: -2.506 },
  "SHP-007": { longitude: -44.332, latitude: -2.612 },
  "SHP-008": { longitude: -44.248, latitude: -2.486 },
  "SHP-009": { longitude: -44.23, latitude: -2.46 },
  "SHP-010": { longitude: -58.6, latitude: 6.5 },
  "SHP-011": { longitude: 4.8, latitude: -19.4 },
  "SHP-012": { longitude: 34.2, latitude: -12.1 },
  "SHP-013": { longitude: -44.22, latitude: -2.49 },
  "SHP-014": { longitude: -48.1, latitude: -30.8 },
  "SHP-015": { longitude: -44.21, latitude: -2.44 },
  "SHP-016": { longitude: -57.8, latitude: 5.8 },
  "SHP-017": { longitude: -44.35, latitude: -2.55 },
  "SHP-018": { longitude: -44.24, latitude: -2.51 },
  "SHP-019": { longitude: -44.38, latitude: -2.58 },
  "SHP-020": { longitude: -44.25, latitude: -2.53 },
};

const INITIAL_ROUTE_PROGRESS: Record<string, number> = {
  "SHP-001": 0.58,
  "SHP-002": 0.42,
  "SHP-003": 0.5,
  "SHP-004": 0.62,
  "SHP-005": 0.36,
  "SHP-006": 0.44,
  "SHP-007": 0.54,
  "SHP-008": 0.47,
  "SHP-009": 1,
  "SHP-010": 0.66,
  "SHP-011": 0.54,
  "SHP-012": 0.62,
  "SHP-013": 1,
  "SHP-014": 0.58,
  "SHP-015": 1,
  "SHP-016": 0.62,
  "SHP-017": 1,
  "SHP-018": 1,
  "SHP-019": 1,
  "SHP-020": 1,
};

const ROUTE_SPEED_BY_SHIP: Record<string, number> = {
  "SHP-001": 0.005,
  "SHP-002": 0.0065,
  "SHP-003": 0.0055,
  "SHP-004": 0.0048,
  "SHP-005": 0.0036,
  "SHP-006": 0.0068,
  "SHP-007": 0.0049,
  "SHP-008": 0.006,
  "SHP-010": 0.0048,
  "SHP-011": 0.0042,
  "SHP-012": 0.0032,
  "SHP-014": 0.004,
  "SHP-016": 0.0049,
};

const ROUTE_PATHS_BY_SHIP: Record<string, [number, number][]> = {
  "SHP-001": [
    [4.4777, 51.9244],
    [2.0, 51.2],
    [-1.8, 50.3],
    [-5.4, 48.8],
    [-9.8, 43.8],
    [-18.4, 31.8],
    [-28.4, 17.2],
    [-35.5, 4.8],
    [-41.9, -0.8],
    [-44.15, -2.18],
    [-44.3651, -2.5652],
  ],
  "SHP-002": [
    [-58.3816, -34.6037],
    [-56.1, -35.1],
    [-48.7, -31.2],
    [-42.8, -23.2],
    [-37.6, -13.8],
    [-36.8, -6.2],
    [-41.7, -1.0],
    [-44.12, -2.12],
    [-44.3028, -2.5297],
  ],
  "SHP-003": [
    [-5.4562, 36.1408],
    [-10.2, 34.6],
    [-18.5, 27.1],
    [-25.2, 17.4],
    [-31.8, 9.2],
    [-37.4, 2.1],
    [-42.8, -0.7],
    [-44.15, -2.2],
    [-44.3651, -2.5652],
  ],
  "SHP-004": [
    [5.7331, 58.97],
    [1.2, 57.3],
    [-3.4, 54.2],
    [-7.6, 49.1],
    [-13.6, 39.2],
    [-22.8, 26.1],
    [-31.6, 13.4],
    [-38.6, 3.2],
    [-42.9, -0.8],
    [-44.18, -2.14],
    [-44.3786, -2.5718],
  ],
  "SHP-005": [
    [103.8198, 1.3521],
    [94.2, 5.6],
    [79.6, 6.1],
    [64.4, 2.3],
    [52.8, -8.9],
    [39.5, -23.4],
    [18.6, -34.8],
    [-1.2, -31.2],
    [-18.4, -21.8],
    [-31.3, -10.6],
    [-38.6, -2.5],
    [-42.9, -0.8],
    [-44.12, -2.12],
    [-44.3028, -2.5297],
  ],
  "SHP-006": [
    [-48.6638, -26.9101],
    [-48.2, -27.9],
    [-43.9, -24.0],
    [-38.2, -15.0],
    [-36.9, -8.0],
    [-39.2, -3.0],
    [-43.0, -1.0],
    [-44.1, -2.08],
    [-44.3028, -2.5297],
  ],
  "SHP-007": [
    [9.9937, 53.5511],
    [5.4, 54.0],
    [1.4, 51.5],
    [-2.4, 49.9],
    [-10.9, 41.6],
    [-20.8, 28.8],
    [-29.4, 16.1],
    [-36.9, 5.1],
    [-42.7, -0.8],
    [-44.17, -2.18],
    [-44.3398, -2.6242],
  ],
  "SHP-008": [
    [-40.2944, -20.2824],
    [-40.9, -21.0],
    [-38.7, -15.5],
    [-37.8, -9.4],
    [-39.6, -4.1],
    [-43.0, -1.0],
    [-44.15, -2.18],
    [-44.3651, -2.5652],
  ],
  "SHP-009": [
    [-75.4794, 10.391],
    [-72.2, 13.0],
    [-64.0, 12.2],
    [-54.0, 7.4],
    [-46.8, 1.8],
    [-44.12, -2.12],
    [-44.3028, -2.5297],
  ],
  "SHP-010": [
    [-95.0179, 29.728],
    [-91.0, 27.4],
    [-84.8, 23.5],
    [-77.8, 18.0],
    [-67.4, 12.4],
    [-56.8, 6.8],
    [-47.5, 1.8],
    [-44.18, -2.14],
    [-44.3786, -2.5718],
  ],
  "SHP-011": [
    [31.0218, -29.8587],
    [23.5, -35.2],
    [12.0, -35.4],
    [-2.5, -29.8],
    [-17.0, -20.4],
    [-30.5, -8.6],
    [-39.8, -1.8],
    [-44.15, -2.18],
    [-44.3651, -2.5652],
  ],
  "SHP-012": [
    [121.4737, 31.2304],
    [122.8, 22.2],
    [112.8, 8.6],
    [94.0, 2.0],
    [76.0, -7.5],
    [56.0, -20.0],
    [34.0, -34.5],
    [10.0, -34.0],
    [-10.0, -27.0],
    [-27.0, -12.5],
    [-39.6, -1.6],
    [-44.12, -2.12],
    [-44.3028, -2.5297],
  ],
  "SHP-013": [
    [4.4025, 51.2194],
    [2.0, 51.2],
    [-1.8, 50.4],
    [-5.4, 48.8],
    [-11.2, 41.6],
    [-21.5, 27.4],
    [-31.0, 12.8],
    [-39.8, 1.4],
    [-44.12, -2.12],
    [-44.3028, -2.5297],
  ],
  "SHP-014": [
    [-71.6273, -33.0472],
    [-76.2, -43.0],
    [-67.6, -55.4],
    [-51.0, -48.0],
    [-43.0, -34.0],
    [-38.6, -18.4],
    [-39.4, -6.2],
    [-43.4, -1.1],
    [-44.15, -2.18],
    [-44.3651, -2.5652],
  ],
  "SHP-015": [
    [3.3792, 6.5244],
    [-7.0, 4.0],
    [-20.5, 0.4],
    [-34.0, -1.2],
    [-42.7, -1.4],
    [-44.17, -2.18],
    [-44.3398, -2.6242],
  ],
  "SHP-016": [
    [-90.0715, 29.9511],
    [-87.0, 26.2],
    [-81.0, 22.0],
    [-72.2, 16.2],
    [-62.0, 10.0],
    [-52.0, 4.0],
    [-44.6, -1.7],
    [-44.15, -2.18],
    [-44.3651, -2.5652],
  ],
  "SHP-017": [
    [-9.1393, 38.7223],
    [-12.8, 35.2],
    [-20.8, 25.0],
    [-30.0, 11.4],
    [-38.0, 1.2],
    [-43.2, -1.1],
    [-44.12, -2.12],
    [-44.3028, -2.5297],
  ],
  "SHP-018": [
    [-17.4677, 14.7167],
    [-24.0, 10.2],
    [-32.0, 4.8],
    [-39.8, 0.0],
    [-44.15, -2.18],
    [-44.3651, -2.5652],
  ],
  "SHP-019": [
    [18.4241, -33.9249],
    [8.0, -34.2],
    [-7.0, -29.0],
    [-23.5, -15.0],
    [-36.5, -3.0],
    [-44.18, -2.14],
    [-44.3786, -2.5718],
  ],
  "SHP-020": [
    [-46.3336, -23.9608],
    [-44.4, -24.8],
    [-39.0, -16.0],
    [-37.2, -8.4],
    [-39.6, -3.2],
    [-43.0, -1.0],
    [-44.15, -2.18],
    [-44.3651, -2.5652],
  ],
};

type WeatherEvent = {
  id: string;
  symbol: string;
  label: string;
  severity: "info" | "warning" | "critical";
  longitude: number;
  latitude: number;
  note: string;
};

const WEATHER_EVENTS: WeatherEvent[] = [
  {
    id: "W-001",
    symbol: "⛈️",
    label: "Tempestade",
    severity: "critical",
    longitude: -28,
    latitude: 9.5,
    note: "Corredor atlântico com vento forte e raio de segurança ampliado.",
  },
  {
    id: "W-002",
    symbol: "🌧️",
    label: "Chuva",
    severity: "warning",
    longitude: -12.5,
    latitude: 28.5,
    note: "Visibilidade reduzida no trecho de aproximação ao Atlântico Norte.",
  },
  {
    id: "W-003",
    symbol: "🌊",
    label: "Mar agitado",
    severity: "warning",
    longitude: -40.8,
    latitude: -9.8,
    note: "Ondulação mais forte no corredor de chegada ao Maranhão.",
  },
  {
    id: "W-004",
    symbol: "💨",
    label: "Ventania",
    severity: "info",
    longitude: 18,
    latitude: 41.5,
    note: "Rajadas moderadas no Mediterrâneo, sem bloqueio operacional.",
  },
];

type MapShip = Ship & {
  routeProgress: number;
};

export default function MapaNavios() {
  const t = useT();
  const language = useLanguageCode();
  const { openAssistant, openReport } = useAssistant();
  const mapRef = useRef<MapRef | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const [ships, setShips] = useState<MapShip[]>(
    initialShips.map((ship) => {
      const routeProgress = ship.status === "transit" ? INITIAL_ROUTE_PROGRESS[ship.id] ?? 0.28 : 1;
      const route = getShipRouteCoordinates(ship.id);
      const position =
        ship.status === "transit" && route
          ? getPointAlongRoute(route, routeProgress)
          : getInitialShipPosition(ship);

      return {
        ...ship,
        lng: position.longitude,
        lat: position.latitude,
        routeProgress,
      };
    })
  );
  const [selectedId, setSelectedId] = useState<string | null>(initialShips[0].id);
  const [highlightShipId, setHighlightShipId] = useState<string | null>(initialShips[0].id);

  const requestedShipId = searchParams.get("ship");

  useEffect(() => {
    const timer = setInterval(() => {
      setShips((prev) =>
        prev.map((ship) => {
          if (ship.status !== "transit") return ship;

          const route = getShipRouteCoordinates(ship.id);
          if (!route) return ship;

          const nextProgress = Math.min(ship.routeProgress + (ROUTE_SPEED_BY_SHIP[ship.id] ?? 0.005), 0.985);
          const nextPoint = getPointAlongRoute(route, nextProgress);

          return {
            ...ship,
            lng: nextPoint.longitude,
            lat: nextPoint.latitude,
            routeProgress: nextProgress,
          };
        })
      );
    }, 1800);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!requestedShipId) return;
    if (!ships.some((ship) => ship.id === requestedShipId)) return;
    setSelectedId(requestedShipId);
    setHighlightShipId(requestedShipId);
  }, [requestedShipId, ships]);

  useEffect(() => {
    if (!highlightShipId) return;
    const timer = window.setTimeout(() => setHighlightShipId((current) => (current === highlightShipId ? null : current)), 2600);
    return () => window.clearTimeout(timer);
  }, [highlightShipId]);

  const selectedShip = ships.find((ship) => ship.id === selectedId);

  useEffect(() => {
    if (!selectedShip || !mapRef.current) return;
    mapRef.current.flyTo({
      center: [selectedShip.lng, selectedShip.lat],
      zoom: selectedShip.status === "transit" ? 4.6 : 10.8,
      duration: 1400,
      essential: true,
    });
  }, [selectedShip]);

  const focusShip = (shipId: string, updateQuery = true) => {
    setSelectedId(shipId);
    setHighlightShipId(shipId);
    if (updateQuery) {
      setSearchParams((current) => {
        const next = new URLSearchParams(current);
        next.set("ship", shipId);
        return next;
      });
    }
  };

  const clearFocusedShip = () => {
    setSelectedId(null);
    setSearchParams((current) => {
      const next = new URLSearchParams(current);
      next.delete("ship");
      return next;
    });
  };

  const counts = useMemo(
    () => ({
      critical: ships.filter((ship) => ship.risk === "critical").length,
      high: ships.filter((ship) => ship.risk === "high").length,
      medium: ships.filter((ship) => ship.risk === "medium").length,
      low: ships.filter((ship) => ship.risk === "low").length,
    }),
    [ships]
  );

  const selectedDestination = selectedShip
    ? PORTS.find((port) => port.id === DESTINATION_BY_SHIP[selectedShip.id]) ?? PORTS[0]
    : null;
  const selectedOrigin = selectedShip
    ? PORTS.find((port) => port.id === ORIGIN_BY_SHIP[selectedShip.id]) ?? null
    : null;
  const selectedWeather = selectedShip ? WEATHER_EVENTS.slice(0, selectedShip.risk === "critical" ? 2 : 1) : [];

  return (
    <div className="flex h-full bg-[#eef3f8]">
      <div className="flex flex-1 flex-col">
        <div className="mx-4 mt-4 flex items-center justify-between rounded-[1.35rem] border border-[#d5e2f1] bg-white/[0.92] px-5 py-3 shadow-[0_18px_42px_-32px_rgba(20,63,111,0.55)] backdrop-blur">
          <div className="flex items-center gap-3">
            <MapPinned className="h-4 w-4 text-accent" />
            <div>
              <div className="text-[13px] font-semibold">{t("map.title")}</div>
            </div>
          </div>

          <div className="hidden items-center gap-4 text-[11px] font-mono md:flex">
            {[
              { key: "critical", label: "Crítico", color: RISK_HSL.critical, total: counts.critical },
              { key: "high", label: "Alto", color: RISK_HSL.high, total: counts.high },
              { key: "medium", label: "Atenção", color: RISK_HSL.medium, total: counts.medium },
              { key: "low", label: "Normal", color: RISK_HSL.low, total: counts.low },
            ].map((item) => (
              <div key={item.key} className="flex items-center gap-1.5 uppercase">
                <span className="h-2 w-2 rounded-full" style={{ background: `hsl(${item.color})` }} />
                <span className="text-muted-foreground">{item.label}</span>
                <span className="text-foreground font-semibold">{item.total}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative flex-1 overflow-hidden p-4">
          <div className="absolute bottom-6 left-6 z-10 hidden rounded-2xl border border-slate-100/20 bg-slate-950/74 p-3 text-[10px] font-mono uppercase tracking-[0.18em] text-slate-200 shadow-[0_18px_50px_-30px_rgba(15,23,42,0.9)] backdrop-blur md:block">
              <div className="mb-2 text-slate-50">{t("map.layers")}</div>
            <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-primary" /> {t("map.layerPorts")}</div>
            <div className="mt-1 flex items-center gap-2"><span className="h-[2px] w-5 bg-primary" /> {t("map.layerRoute")}</div>
            <div className="mt-1 flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-warning" /> {t("map.layerWeather")}</div>
          </div>

          <div className="h-full overflow-hidden rounded-[1.8rem] border border-white/70 bg-white/70 shadow-[0_22px_54px_-34px_rgba(16,45,87,0.32)]">
            <Map
              ref={mapRef}
              center={WORLD_CENTER}
              zoom={1.8}
              minZoom={1.2}
              maxZoom={15}
              dragRotate={false}
              pitchWithRotate={false}
              attributionControl={false}
              className="h-full w-full"
            >
              <MapControls position="top-right" showZoom showLocate showFullscreen />

              {ships.map((ship) => {
                const route = getShipRouteCoordinates(ship.id);
                if (!route) return null;
                const isSelected = selectedShip?.id === ship.id;
                const selectedPath = isSelected ? getRemainingRouteCoordinates(route, ship.routeProgress) : null;
                const lineColor = ROUTE_COLORS[ship.risk] ?? ROUTE_COLORS.low;

                return (
                  <Fragment key={ship.id}>
                    <MapLine
                      id={`route-${ship.id}`}
                      coordinates={route}
                      color={lineColor}
                      width={isSelected ? 4 : 2}
                      opacity={isSelected ? 0.9 : 0.28}
                      dashArray={ship.status === "transit" ? [3, 3] : undefined}
                    />
                    {selectedPath && selectedPath.length > 1 && (
                      <MapLine
                        id={`route-remaining-${ship.id}`}
                        coordinates={selectedPath}
                        color="#61a8df"
                        width={3}
                        opacity={0.85}
                        dashArray={[2, 3]}
                      />
                    )}
                  </Fragment>
                );
              })}

              {WEATHER_EVENTS.map((event) => (
                <MapMarker key={event.id} longitude={event.longitude} latitude={event.latitude}>
                  <MarkerContent>
                    <div className="relative flex items-center justify-center">
                      <span
                        className={cn(
                          "absolute h-14 w-14 rounded-full opacity-25",
                          event.severity === "critical"
                            ? "bg-destructive animate-ping"
                            : event.severity === "warning"
                              ? "bg-warning animate-pulse"
                              : "bg-info animate-pulse"
                        )}
                      />
                      <span className="relative grid h-9 w-9 place-items-center rounded-full border-2 border-white bg-slate-950 text-lg shadow-lg">
                        {event.symbol}
                      </span>
                    </div>
                  </MarkerContent>
                  <MarkerTooltip>{event.label}</MarkerTooltip>
                  <MarkerPopup className="w-64">
                    <div className="flex flex-col gap-1">
                      <div className="text-[10px] font-mono uppercase tracking-[0.16em] text-muted-foreground">Clima operacional</div>
                      <div className="text-sm font-semibold text-foreground">{event.symbol} {event.label}</div>
                      <div className="text-xs text-muted-foreground">{event.note}</div>
                    </div>
                  </MarkerPopup>
                </MapMarker>
              ))}

              {PORTS.map((port) => (
                <MapMarker key={port.id} longitude={port.longitude} latitude={port.latitude}>
                  <MarkerContent>
                    <div
                      className={cn("relative flex items-center justify-center", isMaranhaoPort(port.id) ? "text-warning" : "text-primary")}
                    >
                      <span
                        className={cn(
                          "absolute h-5 w-5 rounded-full opacity-30",
                          isMaranhaoPort(port.id) ? "bg-warning animate-ping" : "bg-primary animate-pulse"
                        )}
                      />
                      <span
                        className={cn(
                          "relative h-3.5 w-3.5 rounded-full border-2 border-white shadow-md",
                          isMaranhaoPort(port.id) ? "bg-warning" : "bg-primary"
                        )}
                      />
                      <MarkerLabel position="bottom" className="mt-2 rounded-full bg-white/90 px-2 py-0.5 font-mono uppercase tracking-[0.12em] text-[9px] shadow-sm">
                        {port.name}
                      </MarkerLabel>
                    </div>
                  </MarkerContent>
                  <MarkerTooltip>{port.label}</MarkerTooltip>
                  <MarkerPopup className="w-56">
                    <div className="flex flex-col gap-1">
                      <div className="text-xs font-mono uppercase tracking-[0.16em] text-muted-foreground">Porto</div>
                      <div className="text-sm font-semibold text-foreground">{port.name}</div>
                      <div className="text-xs text-muted-foreground">{port.label}</div>
                    </div>
                  </MarkerPopup>
                </MapMarker>
              ))}

              {ships.map((ship) => {
                const risk = RISK_HSL[ship.risk];
                const isSelected = selectedId === ship.id;
                const isHighlighted = highlightShipId === ship.id;
                const shipAlerts = ship.pendencias.length;

                return (
                  <MapMarker
                    key={ship.id}
                    longitude={ship.lng}
                    latitude={ship.lat}
                    onClick={() => focusShip(ship.id)}
                  >
                    <MarkerContent>
                      <div className="relative cursor-pointer">
                        {isHighlighted && (
                          <span className="pulse-ring absolute inset-[-8px] rounded-full text-primary" />
                        )}
                        <div
                          className={cn(
                            "flex h-5 w-5 items-center justify-center rounded-full border-2 border-white shadow-md transition-transform duration-300",
                            ship.status === "transit" && "animate-pulse",
                            isSelected && "scale-125",
                            isHighlighted && "scale-[1.38]"
                          )}
                          style={{ backgroundColor: `hsl(${risk})` }}
                        >
                          <Navigation className="h-2.5 w-2.5 text-white" />
                        </div>
                        {shipAlerts > 0 && (
                          <div className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full border border-white bg-destructive text-[8px] font-bold text-white">
                            !
                          </div>
                        )}
                        {isSelected && (
                          <MarkerLabel
                            position="top"
                            className={cn(
                              "rounded-full bg-white/[0.92] px-2 py-1 font-mono uppercase tracking-[0.14em] text-[9px] shadow-sm",
                              isHighlighted && "border border-primary/40 bg-white"
                            )}
                          >
                            {ship.name}
                          </MarkerLabel>
                        )}
                      </div>
                    </MarkerContent>
                    <MarkerTooltip>{ship.flag} {ship.name}</MarkerTooltip>
                    <MarkerPopup className="w-64" closeButton>
                      <div className="flex flex-col gap-2 pr-5">
                        <div className="text-[10px] font-mono uppercase tracking-[0.16em] text-muted-foreground">
                          Navio · IMO {ship.imo}
                        </div>
                        <div className="text-sm font-semibold text-foreground">{ship.flag} {ship.name}</div>
                        <div className="text-xs text-muted-foreground">{ship.type} · {ship.origin}</div>
                        <div className="flex flex-wrap items-center gap-2 pt-1">
                          <ShipStatusBadge status={ship.status} />
                          <RiskBadge level={ship.risk} />
                        </div>
                      </div>
                    </MarkerPopup>
                  </MapMarker>
                );
              })}
            </Map>
          </div>
        </div>
      </div>

      {selectedShip && (
        <aside key={selectedShip.id} className="w-[400px] shrink-0 overflow-y-auto border-l border-[#d5e2f1] bg-white/95 shadow-[0_22px_58px_-36px_rgba(19,50,95,0.42)] backdrop-blur">
          <div className="border-b border-[#d5e2f1] bg-white/95 p-5 shadow-[0_18px_34px_-32px_rgba(19,50,95,0.52)] backdrop-blur">
            <div className="mb-3 rounded-xl border border-[#9fc7f2] bg-[#eef6ff] px-3 py-2.5">
              <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-[#1351b4]">
                {language === "pt" ? "Navio selecionado" : language === "en" ? "Selected vessel" : "选定船舶"}
              </div>
              <div className="mt-1 text-sm font-semibold text-[#102a4c]">
                {selectedShip.flag} {selectedShip.name}
              </div>
              <div className="mt-1 text-[11px] font-mono text-[#53687f]">
                {selectedOrigin ? selectedOrigin.name : selectedShip.origin} → {selectedDestination?.name ?? (language === "pt" ? "Destino operacional" : language === "en" ? "Operational destination" : "作业目的地")}
              </div>
            </div>
            <div className="mb-3 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="mb-1 text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground">{language === "pt" ? "Detalhes da embarcação" : language === "en" ? "Vessel details" : "船舶详情"} · IMO {selectedShip.imo}</div>
                <div className={cn("truncate text-xl font-bold leading-tight", highlightShipId === selectedShip.id && "text-primary")}>{selectedShip.flag} {selectedShip.name}</div>
                <div className="mt-0.5 text-xs font-mono text-muted-foreground">{selectedShip.type} · {selectedShip.loa}m · {selectedShip.origin}</div>
              </div>
              <button onClick={clearFocusedShip} className="-m-1 p-1 text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <ShipStatusBadge status={selectedShip.status} />
              <RiskBadge level={selectedShip.risk} />
            </div>
            {selectedDestination && (
              <div className="mt-4 rounded-xl border border-[#d5e2f1] bg-[#f6f9fd] p-3">
                <div className="text-[10px] font-mono uppercase tracking-[0.16em] text-muted-foreground">{t("map.destination")}</div>
                <div className="mt-2 text-sm font-semibold text-foreground">{selectedDestination.name}</div>
                <div className="mt-1 text-xs text-muted-foreground">
                  {selectedOrigin ? `${selectedOrigin.name} → ${selectedDestination.name}` : "Rota global até o destino operacional no Maranhão."}
                </div>
              </div>
            )}
            <div className="mt-3 grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-[#d5e2f1] bg-[#f6f9fd] p-3">
                <div className="text-[10px] font-mono uppercase tracking-[0.16em] text-muted-foreground">{t("map.routeProgress")}</div>
                <div className="mt-1 text-lg font-semibold text-foreground">{Math.round((selectedShip.routeProgress ?? 0.5) * 100)}%</div>
              </div>
              <div className="rounded-xl border border-[#d5e2f1] bg-[#f6f9fd] p-3">
                <div className="text-[10px] font-mono uppercase tracking-[0.16em] text-muted-foreground">{t("map.eta")}</div>
                <div className="mt-1 text-lg font-semibold text-foreground">
                  {new Date(selectedShip.eta).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
                </div>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => openAssistant(selectedShip.id)}
                className="primary-action rounded-xl px-3 py-3 text-sm font-semibold"
              >
                {language === "pt" ? "Assistente" : language === "en" ? "Assistant" : "助手"}
              </button>
              <button
                type="button"
                onClick={() => openReport(selectedShip.id)}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#cfe0f3] bg-white px-3 py-3 text-sm font-semibold text-[#1351b4] transition-colors hover:border-[#8bb4e7] hover:bg-[#f4f8fd]"
              >
                <FileText className="h-4 w-4" />
                {language === "pt" ? "Relatório" : language === "en" ? "Report" : "报告"}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-4 border-b border-[#d5e2f1] text-[10px] font-mono uppercase tracking-wider">
            <Link to={getShipBerthsHref(selectedShip.id)} className="border-r border-[#d5e2f1] py-3 text-center text-muted-foreground hover:bg-[#f2f7fd] hover:text-foreground">
              <Anchor className="mx-auto mb-1 h-3.5 w-3.5" /> {language === "pt" ? "Berço" : language === "en" ? "Berth" : "泊位"}
            </Link>
            <Link to={getShipRisksHref(selectedShip.id)} className="border-r border-[#d5e2f1] py-3 text-center text-muted-foreground hover:bg-[#f2f7fd] hover:text-foreground">
              <TriangleAlert className="mx-auto mb-1 h-3.5 w-3.5" /> {language === "pt" ? "Risco" : language === "en" ? "Risk" : "风险"}
            </Link>
            <Link to="/documentos" className="border-r border-[#d5e2f1] py-3 text-center text-muted-foreground hover:bg-[#f2f7fd] hover:text-foreground">
              <FileText className="mx-auto mb-1 h-3.5 w-3.5" /> {language === "pt" ? "Docs" : language === "en" ? "Docs" : "文件"}
            </Link>
            <Link to="/liberacoes" className="py-3 text-center text-muted-foreground hover:bg-[#f2f7fd] hover:text-foreground">
              <ShieldCheck className="mx-auto mb-1 h-3.5 w-3.5" /> {language === "pt" ? "Órgãos" : language === "en" ? "Agencies" : "机构"}
            </Link>
          </div>

          <Section title="Programação" icon={Clock}>
            <div className="grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
              {[
                ["ETA", selectedShip.eta],
                ["ETB", selectedShip.etb],
                ["ETC", selectedShip.etc],
                ["ETD", selectedShip.etd],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between border-b border-border/60 pb-1.5">
                  <span className="text-[10px] font-mono uppercase text-muted-foreground">{label}</span>
                  <span className="font-mono">{new Date(value).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}</span>
                </div>
              ))}
            </div>
            <div className="mt-3 flex items-center justify-between text-[11px]">
              <span className="font-mono uppercase text-muted-foreground">Carga</span>
              <span className="text-right">{selectedShip.cargo}</span>
            </div>
            <div className="mt-1.5 flex items-center justify-between text-[11px]">
              <span className="font-mono uppercase text-muted-foreground">Agente</span>
              <span>{selectedShip.agent}</span>
            </div>
            <div className="mt-3 rounded-xl border border-[#d5e2f1] bg-[#f6f9fd] p-3">
              <div className="text-[10px] font-mono uppercase tracking-[0.16em] text-muted-foreground">{t("map.destinationFinal")}</div>
              <div className="mt-1 text-xs text-foreground">{selectedDestination?.name ?? (language === "pt" ? "Hub Maranhão" : language === "en" ? "Maranhão hub" : "马拉尼昂枢纽")}</div>
            </div>
          </Section>

          <Section title={language === "pt" ? "IA preditiva" : language === "en" ? "Predictive AI" : "预测AI"} icon={Sparkles} tone={selectedShip.risk}>
            {(() => {
              const intel = analyzeShip(selectedShip, language);
              return (
                <div className="space-y-3 text-xs">
                  <div className="rounded-xl border border-[#d5e2f1] bg-[#f6f9fd] p-3">
                    <div className="text-[10px] font-mono uppercase tracking-[0.16em] text-muted-foreground">
                      {language === "pt" ? "Probabilidade de atraso" : language === "en" ? "Delay probability" : "延误概率"}
                    </div>
                    <div className="mt-1 text-lg font-semibold text-foreground">{intel.delayProbability}%</div>
                  </div>
                  <div className="rounded-xl border border-[#d5e2f1] bg-[#f6f9fd] p-3">
                    <div className="text-[10px] font-mono uppercase tracking-[0.16em] text-muted-foreground">
                      {language === "pt" ? "Gargalo" : language === "en" ? "Bottleneck" : "瓶颈"}
                    </div>
                    <div className="mt-1 text-sm text-foreground">{intel.bottleneck}</div>
                  </div>
                  <div className="rounded-xl border border-[#d5e2f1] bg-[#f6f9fd] p-3">
                    <div className="text-[10px] font-mono uppercase tracking-[0.16em] text-muted-foreground">
                      {language === "pt" ? "Próxima ação" : language === "en" ? "Next action" : "下一步"}
                    </div>
                    <div className="mt-1 text-sm text-foreground">{intel.nextAction}</div>
                  </div>
                </div>
              );
            })()}
          </Section>

          <Section
            title={`Fatores de risco (${selectedShip.riskFactors.length})`}
            icon={TriangleAlert}
            tone={selectedShip.riskFactors.length > 0 ? selectedShip.risk : undefined}
          >
            {selectedShip.riskFactors.length > 0 ? (
              <ul className="space-y-2 text-xs">
                {selectedShip.riskFactors.map((riskFactor, index) => (
                  <li key={index} className="flex items-center gap-2 rounded-xl border border-destructive/25 bg-destructive/5 px-3 py-2 shadow-[0_14px_28px_-26px_rgba(220,38,38,0.8)]">
                    <span className="weather-alert-pulse grid h-5 w-5 shrink-0 place-items-center rounded-full bg-destructive/10 text-destructive">
                      <TriangleAlert className="h-3.5 w-3.5" />
                    </span>
                    <span className="font-medium text-foreground">{riskFactor}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="rounded-xl border border-[#d5e2f1] bg-[#f6f9fd] px-3 py-2 text-xs text-muted-foreground">
                {language === "pt" ? "Sem fatores de risco ativos para este navio." : language === "en" ? "No active risk factors for this vessel." : "该船暂无活动风险因素。"}
              </div>
            )}
          </Section>

          {selectedShip.pendencias.length > 0 && (
            <Section title={`Pendências (${selectedShip.pendencias.length})`} icon={TriangleAlert}>
              <div className="space-y-2">
                {selectedShip.pendencias.map((pendency, index) => (
                  <div key={index} className="rounded-xl border border-[#d5e2f1] bg-[#f6f9fd] p-2.5">
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-[10px] font-mono uppercase text-warning">{pendency.area}</span>
                      {pendency.agency && <span className="text-[10px] font-mono text-muted-foreground">{pendency.agency}</span>}
                    </div>
                    <div className="text-xs">{pendency.description}</div>
                  </div>
                ))}
              </div>
            </Section>
          )}

          <Section title="Órgãos reguladores" icon={ShieldCheck}>
            <div className="space-y-1.5">
              {selectedShip.clearances.map((clearance) => (
                <div key={clearance.agency} className="flex items-center justify-between text-xs">
                  <span>{clearance.agency}</span>
                  <ClearanceBadge status={clearance.status} compact />
                </div>
              ))}
            </div>
          </Section>

          <Section title="Alertas climáticos" icon={TriangleAlert} tone="high">
            <div className="space-y-2">
              {selectedWeather.map((event) => (
                <div key={event.id} className="weather-serious-card relative overflow-hidden rounded-xl border border-[#e29b2f]/80 p-3">
                  <div className="pointer-events-none absolute inset-y-0 left-0 w-1.5 rounded-l-xl bg-[linear-gradient(180deg,#d97706,#b45309)]" />
                  <div className="flex items-start gap-3">
                    <div className="weather-alert-icon weather-alert-pulse grid h-10 w-10 shrink-0 place-items-center rounded-full border border-[#edb96a] bg-white text-lg shadow-sm">
                      {event.symbol}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-foreground">{event.label}</div>
                      <div className="mt-1 text-[11px] leading-5 text-muted-foreground">{event.note}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          <Section title="Histórico recente" icon={History}>
            <ol className="space-y-2 text-xs">
              {selectedShip.history.slice().reverse().map((item, index) => (
                <li key={index} className="relative flex gap-2 border-l-2 border-border pl-3">
                  <span className="absolute -left-[5px] top-1 h-2 w-2 rounded-full bg-accent" />
                  <div>
                    <div className="text-[10px] font-mono text-muted-foreground">{new Date(item.ts).toLocaleString("pt-BR")}</div>
                    <div>{item.event}</div>
                  </div>
                </li>
              ))}
            </ol>
          </Section>
        </aside>
      )}
    </div>
  );
}

function getInitialShipPosition(ship: Ship) {
  if (ship.status === "transit") {
    const route = getShipRouteCoordinates(ship.id);
    if (route) {
      const point = getPointAlongRoute(route, INITIAL_ROUTE_PROGRESS[ship.id] ?? 0.28);
      return {
        longitude: point.longitude,
        latitude: point.latitude,
      };
    }
  }

  return LOCAL_POSITION_BY_SHIP[ship.id] ?? { longitude: ship.lng, latitude: ship.lat };
}

function getShipRouteCoordinates(shipId: string) {
  return ROUTE_PATHS_BY_SHIP[shipId] ?? null;
}

function getPointAlongRoute(route: [number, number][], progress: number) {
  const position = getRoutePosition(route, progress);

  return {
    longitude: position.point[0],
    latitude: position.point[1],
  };
}

function getRemainingRouteCoordinates(route: [number, number][], progress: number) {
  const position = getRoutePosition(route, progress);
  const remaining = [position.point, ...route.slice(position.segmentIndex + 1)];

  return dedupeCoordinates(remaining);
}

function getRoutePosition(route: [number, number][], progress: number) {
  if (route.length <= 1) {
    return { point: route[0] ?? [0, 0] as [number, number], segmentIndex: 0 };
  }

  const segmentLengths = route.slice(0, -1).map((point, index) => getSegmentLength(point, route[index + 1]));
  const totalLength = segmentLengths.reduce((sum, length) => sum + length, 0);
  const boundedProgress = Math.max(0, Math.min(progress, 1));
  const targetDistance = totalLength * boundedProgress;

  let traversed = 0;

  for (let index = 0; index < segmentLengths.length; index += 1) {
    const segmentLength = segmentLengths[index];
    const nextTraversed = traversed + segmentLength;

    if (targetDistance <= nextTraversed) {
      const localProgress = segmentLength === 0 ? 0 : (targetDistance - traversed) / segmentLength;
      return {
        point: interpolatePoint(route[index], route[index + 1], localProgress),
        segmentIndex: index,
      };
    }

    traversed = nextTraversed;
  }

  return {
    point: route[route.length - 1],
    segmentIndex: route.length - 2,
  };
}

function interpolatePoint(from: [number, number], to: [number, number], progress: number): [number, number] {
  return [
    from[0] + (to[0] - from[0]) * progress,
    from[1] + (to[1] - from[1]) * progress,
  ];
}

function getSegmentLength(from: [number, number], to: [number, number]) {
  return Math.hypot(to[0] - from[0], to[1] - from[1]);
}

function dedupeCoordinates(points: [number, number][]) {
  return points.filter((point, index) => {
    if (index === 0) return true;
    const previous = points[index - 1];
    return previous[0] !== point[0] || previous[1] !== point[1];
  });
}

function isMaranhaoPort(portId: string) {
  return ["hub", "itaqui", "ponta_madeira", "alumar", "fundeio"].includes(portId);
}

interface MapLineProps {
  id: string;
  coordinates: [number, number][];
  color: string;
  width: number;
  opacity: number;
  dashArray?: [number, number];
}

function MapLine({ id, coordinates, color, width, opacity, dashArray }: MapLineProps) {
  return (
    <MapRoute
      id={id}
      coordinates={coordinates}
      color={color}
      width={width}
      opacity={opacity}
      dashArray={dashArray}
    />
  );
}

interface SectionProps {
  title: string;
  icon: LucideIcon;
  children: ReactNode;
  tone?: RiskLevel;
}

function Section({ title, icon: Icon, children, tone }: SectionProps) {
  return (
    <section className="border-b border-[#d5e2f1] p-5">
      <div className="mb-3 flex items-center gap-2 text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
        <Icon className={cn("h-3.5 w-3.5", tone && "weather-alert-pulse", tone === "critical" && "text-destructive", tone === "high" && "text-risk-high", tone === "medium" && "text-warning")} />
        {title}
      </div>
      {children}
    </section>
  );
}
