import {
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend
} from "recharts";

const COLORS = {
  Easy: "#10b981",
  Moderate: "#3b82f6",
  Hard: "#f59e0b",
  "Very Hard": "#ef4444",
};

const CUSTOM_LABEL = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  if (percent < 0.05) return null;
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.55;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight="bold">
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export default function DifficultyChart({ data }) {
  const filtered = data.filter((d) => d.value > 0);

  if (!filtered.length) {
    return (
      <div className="h-[200px] flex items-center justify-center text-slate-400 text-sm">
        Add subjects to see difficulty distribution
      </div>
    );
  }

  return (
    <div>
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={filtered}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={CUSTOM_LABEL}
            outerRadius={80}
            dataKey="value"
          >
            {filtered.map((entry) => (
              <Cell key={entry.name} fill={COLORS[entry.name] || "#6366f1"} />
            ))}
          </Pie>
          <Tooltip formatter={(v, n) => [`${v} subject(s)`, n]} />
        </PieChart>
      </ResponsiveContainer>
      <div className="flex flex-wrap justify-center gap-x-4 gap-y-1.5 mt-1">
        {filtered.map((d) => (
          <div key={d.name} className="flex items-center gap-1.5 text-xs text-slate-600">
            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: COLORS[d.name] }} />
            {d.name} ({d.value})
          </div>
        ))}
      </div>
    </div>
  );
}
