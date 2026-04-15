import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const data = [
  { categoria: "Vendas", mercadoLivre: 185400, shopee: 124300 },
  { categoria: "Pedidos", mercadoLivre: 1285, shopee: 892 },
  { categoria: "Ticket Médio", mercadoLivre: 144, shopee: 139 }
];

export function MarketplaceComparisonChart() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis 
          dataKey="categoria" 
          className="text-xs"
          tick={{ fill: "hsl(var(--muted-foreground))" }}
        />
        <YAxis 
          className="text-xs"
          tick={{ fill: "hsl(var(--muted-foreground))" }}
          tickFormatter={(value) => {
            if (value >= 1000) return `${(value / 1000).toFixed(0)}k`;
            return value.toString();
          }}
        />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "var(--radius)"
          }}
          formatter={(value: number, name: string) => {
            const label = name === "mercadoLivre" ? "Mercado Livre" : "Shopee";
            return [value.toLocaleString("pt-BR"), label];
          }}
        />
        <Legend 
          wrapperStyle={{ paddingTop: "20px" }}
          formatter={(value) => value === "mercadoLivre" ? "Mercado Livre" : "Shopee"}
        />
        <Bar dataKey="mercadoLivre" fill="#FFEB00" radius={[8, 8, 0, 0]} />
        <Bar dataKey="shopee" fill="#EE4D2D" radius={[8, 8, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}