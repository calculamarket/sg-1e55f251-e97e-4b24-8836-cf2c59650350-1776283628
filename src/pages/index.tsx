import { useState, useEffect } from "react";
import { SEO } from "@/components/SEO";
import { DashboardLayout } from "@/components/DashboardLayout";
import { MetricCard } from "@/components/MetricCard";
import { SalesChart } from "@/components/SalesChart";
import { MarketplaceComparisonChart } from "@/components/MarketplaceComparisonChart";
import { DistributionChart } from "@/components/DistributionChart";
import { TrendingUp, ShoppingCart, DollarSign, Percent, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getDashboardMetrics, syncAllMarketplaces } from "@/services/marketplaceService";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export default function Home() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [metrics, setMetrics] = useState({
    totalSales: "R$ 0,00",
    totalOrders: "0",
    avgTicket: "R$ 0,00",
    conversion: "0%",
    change: 0
  });

  const loadMetrics = async () => {
    try {
      setLoading(true);
      const data = await getDashboardMetrics();
      
      setMetrics({
        totalSales: `R$ ${data.total.sales.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
        totalOrders: data.total.orders.toString(),
        avgTicket: `R$ ${data.total.ticket.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
        conversion: `${data.total.conversion.toFixed(2)}%`,
        change: 0
      });
    } catch (error: any) {
      console.error("Erro ao carregar métricas:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    try {
      setSyncing(true);
      await syncAllMarketplaces();
      toast({
        title: "Sincronização iniciada",
        description: "As métricas estão sendo atualizadas",
      });
      setTimeout(loadMetrics, 2000);
    } catch (error: any) {
      toast({
        title: "Erro na sincronização",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    loadMetrics();
  }, []);

  const metricsData = [
    {
      title: "Vendas Totais",
      value: metrics.totalSales,
      change: metrics.change,
      icon: DollarSign,
      trend: "up" as const
    },
    {
      title: "Pedidos",
      value: metrics.totalOrders,
      change: metrics.change,
      icon: ShoppingCart,
      trend: "up" as const
    },
    {
      title: "Ticket Médio",
      value: metrics.avgTicket,
      change: metrics.change,
      icon: TrendingUp,
      trend: "up" as const
    },
    {
      title: "Taxa de Conversão",
      value: metrics.conversion,
      change: metrics.change,
      icon: Percent,
      trend: "up" as const
    }
  ];

  return (
    <>
      <SEO 
        title="Dashboard - Vendas Marketplaces"
        description="Acompanhe suas vendas do Mercado Livre e Shopee em tempo real"
      />
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
              <p className="text-muted-foreground mt-1">Visão geral das suas vendas</p>
            </div>
            <Button onClick={handleSync} disabled={syncing} className="gap-2">
              <RefreshCw className={cn("h-4 w-4", syncing && "animate-spin")} />
              Sincronizar Dados
            </Button>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Carregando métricas...</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {metricsData.map((metric, index) => (
                  <MetricCard key={index} {...metric} />
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-card rounded-lg border border-border p-6">
                  <h2 className="text-xl font-semibold mb-4">Vendas nos últimos 12 meses</h2>
                  <SalesChart />
                </div>

                <div className="bg-card rounded-lg border border-border p-6">
                  <h2 className="text-xl font-semibold mb-4">Distribuição por Marketplace</h2>
                  <DistributionChart />
                </div>
              </div>

              <div className="bg-card rounded-lg border border-border p-6">
                <h2 className="text-xl font-semibold mb-4">Comparativo de Performance</h2>
                <MarketplaceComparisonChart />
              </div>
            </>
          )}
        </div>
      </DashboardLayout>
    </>
  );
}