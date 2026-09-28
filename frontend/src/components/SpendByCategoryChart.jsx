import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { getCategoryHex } from "../utils/categoryColors";

export default function SpendByCategoryChart({ data }) {
  if (!data || data.length === 0) {
    return <p className="text-sm text-muted py-8 text-center">No spending data yet.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie data={data} dataKey="total" nameKey="category" innerRadius={60} outerRadius={100} paddingAngle={2}>
          {data.map((entry) => (
            <Cell key={entry.category} fill={getCategoryHex(entry.category)} />
          ))}
        </Pie>
        <Tooltip formatter={(value) => `₹${value.toLocaleString("en-IN")}`} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}