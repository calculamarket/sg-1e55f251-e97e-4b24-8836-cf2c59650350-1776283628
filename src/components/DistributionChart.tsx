import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

const data = [
  { name: "Mercado Livre", value: 185400, percentage: 59.9 },
  { name: "Shopee", value: 124300, percentage: 40.1 }
];

const COLORS = ["#FFEB00", "#EE4D2D"];

export function DistributionChart() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={(props: any) => `${props.name}: ${props.payload.percentage}%`}
          outerRadius={100}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index]} />
          ))}
        </Pie>
        <Tooltip 
          contentStyle={{ 
            backgroundColor: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "var(--radius)"
          }}
          formatter={(value: number) => `R$ ${value.toLocaleString("pt-BR")}`}
        />
        <Legend 
          verticalAlign="bottom" 
          height={36}
          formatter={(value, entry: any) => `${value}: ${entry.payload.percentage}%`}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}