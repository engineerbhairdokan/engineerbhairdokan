"use client";

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export default function SalesChart({ data }: { data: { sale_date: string; orders_count: number; revenue: number }[] }) {
  if (data.length === 0) {
    return <p className="text-sm text-ink/40 py-10 text-center">No sales in this range yet.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(27,36,51,0.08)" />
        <XAxis dataKey="sale_date" tick={{ fontSize: 11 }} tickFormatter={(d) => new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })} />
        <YAxis tick={{ fontSize: 11 }} />
        <Tooltip
          formatter={(value: number, name: string) => [name === "revenue" ? `৳${value.toLocaleString()}` : value, name === "revenue" ? "Revenue" : "Orders"]}
          labelFormatter={(d) => new Date(d).toLocaleDateString("en-GB")}
        />
        <Line type="monotone" dataKey="revenue" stroke="#F3A93B" strokeWidth={2.5} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}
