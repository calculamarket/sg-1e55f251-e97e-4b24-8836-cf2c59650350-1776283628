import { useState, useEffect } from "react";
import { SEO } from "@/components/SEO";
import { DashboardLayout } from "@/components/DashboardLayout";
import { MetricCard } from "@/components/MetricCard";
import { SalesChart } from "@/components/SalesChart";
import { MarketplaceComparisonChart } from "@/components/MarketplaceComparisonChart";
import { DistributionChart } from "@/components/DistributionChart";
import { 
  DollarSign, 
  ShoppingCart, 
  TrendingUp, 
  Package,
  Percent
} from "lucide-react";
import { getDashboardMetrics, type DashboardMetrics } from "@/services/marketplaceService";
import { useToast } from "@/hooks/use-toast";

export default function Dashboard() {
  const { toast } = useToast();
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalSales: 0,
    totalOrders: 0,
    totalProfit: 0,
    averageTicket: 0,
    salesByMarketplace: {},
    ordersCount: {},
    profitMargin: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMetrics();
  }, []);

  const loadMetrics = async () => {
    try {
      setLoading(true);
      const data = await getDashboardMetrics();
      setMetrics(data);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar métricas",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return `R$ ${value.toFixed(2).replace(".", ",")}`;
  };

  return (
    <>
      <SEO title="Dashboard" description="Acompanhamento de vendas" />
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <div className="xp-chip mb-4">Living With Data · 2026</div>
            <h1 className="xp-page-title">
              Dashboard <em className="text-[var(--xp-peach-d)]">pastel</em>
            </h1>
            <div className="xp-divider" />
            <p className="max-w-3xl text-lg leading-8 text-muted-foreground">
              Acompanhe suas vendas em tempo real com uma leitura mais leve, visual e organizada.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <MetricCard
              title="Vendas Totais"
              value={formatCurrency(metrics.totalSales)}
              icon={DollarSign}
              trend={loading ? undefined : "+12.5%"}
              trendLabel="vs mês anterior"
            />
            <MetricCard
              title="Pedidos"
              value={metrics.totalOrders.toString()}
              icon={ShoppingCart}
              trend={loading ? undefined : "+8.3%"}
              trendLabel="vs mês anterior"
            />
            <MetricCard
              title="Lucro Total"
              value={formatCurrency(metrics.totalProfit)}
              icon={TrendingUp}
              trend={loading ? undefined : metrics.profitMargin >= 0 ? `+${metrics.profitMargin.toFixed(1)}%` : `${metrics.profitMargin.toFixed(1)}%`}
              trendLabel="margem"
            />
            <MetricCard
              title="Ticket Médio"
              value={formatCurrency(metrics.averageTicket)}
              icon={Package}
              trend={loading ? undefined : "+5.2%"}
              trendLabel="vs mês anterior"
            />
            <MetricCard
              title="Margem de Lucro"
              value={`${metrics.profitMargin.toFixed(1)}%`}
              icon={Percent}
              trend={loading ? undefined : metrics.profitMargin >= 20 ? "Excelente" : metrics.profitMargin >= 10 ? "Bom" : "Atenção"}
              trendLabel="saúde financeira"
            />
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="xp-soft-panel bg-white p-6">
              <div className="mb-5">
                <div className="xp-chip mb-3">Sales rhythm</div>
                <h2 className="font-heading text-3xl font-black">Vendas por mês</h2>
              </div>
              <SalesChart />
            </div>
            <MarketplaceComparisonChart 
              salesByMarketplace={metrics.salesByMarketplace}
              ordersCount={metrics.ordersCount}
            />
          </div>

          <DistributionChart salesByMarketplace={metrics.salesByMarketplace} />
        </div>
      </DashboardLayout>
    </>
  );
}
