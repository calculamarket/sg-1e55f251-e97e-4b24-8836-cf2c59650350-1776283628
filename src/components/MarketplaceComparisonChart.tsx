import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart } from "lucide-react";

interface MarketplaceComparisonChartProps {
  salesByMarketplace: Record<string, number>;
  ordersCount: Record<string, number>;
}

export function MarketplaceComparisonChart({ salesByMarketplace, ordersCount }: MarketplaceComparisonChartProps) {
  const marketplaces = Object.keys(salesByMarketplace);
  const maxSales = Math.max(...Object.values(salesByMarketplace), 1);

  return (
    <Card className="border-0 bg-white">
      <CardHeader>
        <div className="flex items-center gap-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--xp-sky)]">
            <BarChart className="h-5 w-5 text-[var(--xp-sky-d)]" />
          </span>
          <CardTitle className="font-heading text-3xl font-black">Comparação por Marketplace</CardTitle>
        </div>
        <CardDescription>Vendas por plataforma</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {marketplaces.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Nenhuma venda registrada ainda
            </p>
          ) : (
            marketplaces.map((marketplace) => {
              const sales = salesByMarketplace[marketplace];
              const orders = ordersCount[marketplace];
              const percentage = (sales / maxSales) * 100;

              return (
                <div key={marketplace} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{marketplace}</span>
                    <div className="text-right">
                      <p className="font-semibold">R$ {sales.toFixed(2).replace(".", ",")}</p>
                      <p className="text-xs text-muted-foreground">{orders} pedidos</p>
                    </div>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-muted">
                    <div 
                      className="h-full rounded-full bg-[var(--xp-peach-d)] transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}
