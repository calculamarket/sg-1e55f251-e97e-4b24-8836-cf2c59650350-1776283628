import { SEO } from "@/components/SEO";
import { DashboardLayout } from "@/components/DashboardLayout";
import { MetricCard } from "@/components/MetricCard";
import { SalesChart } from "@/components/SalesChart";
import { MarketplaceComparisonChart } from "@/components/MarketplaceComparisonChart";
import { DistributionChart } from "@/components/DistributionChart";
import { TrendingUp, ShoppingCart, DollarSign, Percent } from "lucide-react";

export default function Home() {
  const metrics = [
    {
      title: "Vendas Totais",
      value: "R$ 309.700,00",
      change: 18.3,
      icon: DollarSign,
      trend: "up" as const
    },
    {
      title: "Pedidos",
      value: "2.177",
      change: 12.8,
      icon: ShoppingCart,
      trend: "up" as const
    },
    {
      title: "Ticket Médio",
      value: "R$ 142,24",
      change: 4.9,
      icon: TrendingUp,
      trend: "up" as const
    },
    {
      title: "Taxa de Conversão",
      value: "3.68%",
      change: 8.2,
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
          <div>
            <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground mt-1">Visão geral das suas vendas</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {metrics.map((metric, index) => (
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

          <div className="bg-card rounded-lg border border-border p-6">
            <h2 className="text-xl font-semibold mb-4">Pedidos Recentes</h2>
            <div className="text-muted-foreground text-center py-8">
              Tabela de pedidos será implementada na próxima iteração
            </div>
          </div>
        </div>
      </DashboardLayout>
    </>
  );
}