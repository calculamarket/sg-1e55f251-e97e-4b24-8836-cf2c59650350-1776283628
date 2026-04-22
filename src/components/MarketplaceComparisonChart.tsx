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
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <BarChart className="h-5 w-5 text-primary" />
          <CardTitle>Comparação por Marketplace</CardTitle>
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
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary rounded-full transition-all"
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