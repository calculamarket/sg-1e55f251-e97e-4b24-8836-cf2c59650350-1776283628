import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart } from "lucide-react";

interface DistributionChartProps {
  salesByMarketplace: Record<string, number>;
}

export function DistributionChart({ salesByMarketplace }: DistributionChartProps) {
  const total = Object.values(salesByMarketplace).reduce((sum, val) => sum + val, 0);
  const marketplaces = Object.entries(salesByMarketplace);

  const colors = [
    "bg-primary",
    "bg-secondary", 
    "bg-accent",
    "bg-muted-foreground"
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <PieChart className="h-5 w-5 text-primary" />
          <CardTitle>Distribuição de Vendas</CardTitle>
        </div>
        <CardDescription>Participação de cada marketplace</CardDescription>
      </CardHeader>
      <CardContent>
        {marketplaces.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            Nenhuma venda registrada ainda
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {marketplaces.map(([marketplace, sales], index) => {
              const percentage = total > 0 ? (sales / total) * 100 : 0;
              
              return (
                <div key={marketplace} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className={`h-3 w-3 rounded-full ${colors[index % colors.length]}`} />
                    <span className="text-sm font-medium">{marketplace}</span>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{percentage.toFixed(1)}%</p>
                    <p className="text-sm text-muted-foreground">
                      R$ {sales.toFixed(2).replace(".", ",")}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}