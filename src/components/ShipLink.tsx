import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

export function getShipMapHref(shipId: string) {
  return `/mapa?ship=${encodeURIComponent(shipId)}`;
}

export function ShipLink({
  shipId,
  children,
  className,
}: {
  shipId: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Link
      to={getShipMapHref(shipId)}
      className={cn(
        "transition-colors hover:text-primary hover:underline underline-offset-4",
        className,
      )}
    >
      {children}
    </Link>
  );
}
