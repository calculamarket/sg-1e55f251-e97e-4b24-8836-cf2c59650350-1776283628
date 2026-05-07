import { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  trend?: string;
  trendLabel?: string;
}

export function MetricCard({ title, value, icon: Icon, trend, trendLabel }: MetricCardProps) {
  const isPositive = trend?.startsWith("+") || trend === "Excelente" || trend === "Bom";
  const isNegative = trend?.startsWith("-") || trend === "Atenção";
  const palette = [
    "xp-pastel-peach",
    "xp-pastel-mint",
    "xp-pastel-sky",
    "xp-pastel-lilac",
    "xp-pastel-rose",
  ];
  const colorClass = palette[title.length % palette.length];

  return (
    <Card className={cn("overflow-hidden border-0 p-6", colorClass)}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-foreground/60">{title}</p>
          <p className="mt-3 font-heading text-4xl font-black leading-none">{value}</p>
          {trend && (
            <div className="mt-4 flex items-center gap-1">
              <span
                className={cn(
                  "rounded-full bg-white/70 px-2.5 py-1 text-xs font-extrabold",
                  isPositive ? "text-green-600" : isNegative ? "text-red-600" : "text-yellow-600"
                )}
              >
                {trend}
              </span>
              {trendLabel && <span className="text-xs text-muted-foreground">{trendLabel}</span>}
            </div>
          )}
        </div>
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/75">
          <Icon className="h-6 w-6 text-foreground" />
        </div>
      </div>
    </Card>
  );
}
