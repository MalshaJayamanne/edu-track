import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell
} from "recharts";

export default function SemesterChart({ data = [] }) {
  if (!data.length) {
    return (
      <div className="flex items-center justify-center h-48 text-slate-400 text-sm italic">
        No semester data yet — add subjects to populate this chart.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} barSize={40}>
        <XAxis
          dataKey="semester"
          stroke="#94a3b8"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="#94a3b8"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          allowDecimals={false}
        />
        <Tooltip
          cursor={{ fill: "#f1f5f9" }}
          contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0" }}
        />
        <Bar dataKey="subjects" radius={[8, 8, 0, 0]}>
          {data.map((_, i) => (
            <Cell key={i} fill={i % 2 === 0 ? "#3b82f6" : "#6366f1"} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
