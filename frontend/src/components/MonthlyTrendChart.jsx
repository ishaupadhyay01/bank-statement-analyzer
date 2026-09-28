import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

export default function MonthlyTrendChart({ data }) {
  if (!data || data.length === 0) {
    return <p className="text-sm text-muted py-8 text-center">No monthly data yet.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E2DED2" />
        <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#5B6660" }} />
        <YAxis tick={{ fontSize: 12, fill: "#5B6660" }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
        <Tooltip formatter={(value) => `₹${value.toLocaleString("en-IN")}`} />
        <Legend />
        <Line type="monotone" dataKey="income" stroke="#1F6D4C" strokeWidth={2} name="Income" />
        <Line type="monotone" dataKey="expense" stroke="#B15E1F" strokeWidth={2} name="Expense" />
      </LineChart>
    </ResponsiveContainer>
  );
}