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

  return (
    <Card className="p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground font-medium">{title}</p>
          <p className="text-3xl font-bold mt-2">{value}</p>
          {trend && (
            <div className="flex items-center gap-1 mt-2">
              <span
                className={cn(
                  "text-sm font-semibold",
                  isPositive ? "text-green-600" : isNegative ? "text-red-600" : "text-yellow-600"
                )}
              >
                {trend}
              </span>
              {trendLabel && <span className="text-xs text-muted-foreground">{trendLabel}</span>}
            </div>
          )}
        </div>
        <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
          <Icon className="h-6 w-6 text-primary" />
        </div>
      </div>
    </Card>
  );
}