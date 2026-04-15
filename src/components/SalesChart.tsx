import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const data = [
  { mes: "Jan", mercadoLivre: 12500, shopee: 8300 },
  { mes: "Fev", mercadoLivre: 15200, shopee: 9800 },
  { mes: "Mar", mercadoLivre: 14800, shopee: 11200 },
  { mes: "Abr", mercadoLivre: 18900, shopee: 13500 },
  { mes: "Mai", mercadoLivre: 22100, shopee: 15800 },
  { mes: "Jun", mercadoLivre: 26400, shopee: 19200 },
  { mes: "Jul", mercadoLivre: 24800, shopee: 17600 },
  { mes: "Ago", mercadoLivre: 28500, shopee: 21300 },
  { mes: "Set", mercadoLivre: 31200, shopee: 24800 },
  { mes: "Out", mercadoLivre: 29800, shopee: 22400 },
  { mes: "Nov", mercadoLivre: 33600, shopee: 26900 },
  { mes: "Dez", mercadoLivre: 38200, shopee: 31500 }
];

export function SalesChart() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis 
          dataKey="mes" 
          className="text-xs"
          tick={{ fill: "hsl(var(--muted-foreground))" }}
        />
        <YAxis 
          className="text-xs"
          tick={{ fill: "hsl(var(--muted-foreground))" }}
          tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
        />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "var(--radius)"
          }}
          formatter={(value: number) => [`R$ ${value.toLocaleString("pt-BR")}`, ""]}
        />
        <Legend 
          wrapperStyle={{ paddingTop: "20px" }}
          formatter={(value) => value === "mercadoLivre" ? "Mercado Livre" : "Shopee"}
        />
        <Line 
          type="monotone" 
          dataKey="mercadoLivre" 
          stroke="#FFEB00"
          strokeWidth={3}
          dot={{ fill: "#FFEB00", r: 4 }}
          activeDot={{ r: 6 }}
        />
        <Line 
          type="monotone" 
          dataKey="shopee" 
          stroke="#EE4D2D"
          strokeWidth={3}
          dot={{ fill: "#EE4D2D", r: 4 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}