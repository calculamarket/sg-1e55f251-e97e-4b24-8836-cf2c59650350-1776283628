import { SEO } from "@/components/SEO";
import { DashboardLayout } from "@/components/DashboardLayout";
import { MetricCard } from "@/components/MetricCard";
import { TrendingUp, ShoppingCart, DollarSign, Percent } from "lucide-react";

export default function Home() {
  const metrics = [
    {
      title: "Vendas Totais",
      value: "R$ 48.750,00",
      change: 12.5,
      icon: DollarSign,
      trend: "up" as const
    },
    {
      title: "Pedidos",
      value: "342",
      change: 8.2,
      icon: ShoppingCart,
      trend: "up" as const
    },
    {
      title: "Ticket Médio",
      value: "R$ 142,54",
      change: -3.1,
      icon: TrendingUp,
      trend: "down" as const
    },
    {
      title: "Taxa de Conversão",
      value: "3.24%",
      change: 5.7,
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

          <div className="bg-card rounded-lg border border-border p-6">
            <h2 className="text-xl font-semibold mb-4">Vendas nos últimos 30 dias</h2>
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              Gráfico será implementado na próxima iteração
            </div>
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