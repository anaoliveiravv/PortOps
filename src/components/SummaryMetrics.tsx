import { type ButtonHTMLAttributes, type HTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type SummaryMetricsPanelProps = {
  children: ReactNode;
  className?: string;
  gridClassName?: string;
  header?: ReactNode;
};

type SummaryMetricCardProps = HTMLAttributes<HTMLDivElement> &
  ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  as?: "div" | "button";
};

export function SummaryMetricsPanel({
  children,
  className,
  gridClassName = "grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(10.5rem,1fr))]",
  header,
}: SummaryMetricsPanelProps) {
  return (
    <section className={cn("summary-metrics-panel", className)}>
      {header && <div className="relative z-[1] mb-3">{header}</div>}
      <div className={cn("summary-metrics-grid", gridClassName)}>{children}</div>
    </section>
  );
}

export function SummaryMetricCard({ children, className, as = "div", ...props }: SummaryMetricCardProps) {
  const Comp = as;

  return (
    <Comp className={cn("summary-metric-card", className)} {...props}>
      {children}
    </Comp>
  );
}
