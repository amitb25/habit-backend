import { TrendingUp, TrendingDown } from "lucide-react";

const StatsCard = ({ title, value, icon: Icon, color = "blue", subtitle, trend }) => {
  const themes = {
    blue: {
      iconBg: "rgba(99,102,241,0.15)",
      iconColor: "#818cf8",
      borderColor: "rgba(99,102,241,0.12)",
      glowColor: "rgba(99,102,241,0.06)",
    },
    green: {
      iconBg: "rgba(16,185,129,0.15)",
      iconColor: "#34d399",
      borderColor: "rgba(16,185,129,0.12)",
      glowColor: "rgba(16,185,129,0.06)",
    },
    yellow: {
      iconBg: "rgba(245,158,11,0.15)",
      iconColor: "#fbbf24",
      borderColor: "rgba(245,158,11,0.12)",
      glowColor: "rgba(245,158,11,0.06)",
    },
    red: {
      iconBg: "rgba(239,68,68,0.15)",
      iconColor: "#f87171",
      borderColor: "rgba(239,68,68,0.12)",
      glowColor: "rgba(239,68,68,0.06)",
    },
    purple: {
      iconBg: "rgba(139,92,246,0.15)",
      iconColor: "#a78bfa",
      borderColor: "rgba(139,92,246,0.12)",
      glowColor: "rgba(139,92,246,0.06)",
    },
  };

  const t = themes[color] || themes.blue;

  return (
    <div
      className="relative overflow-hidden rounded-2xl p-5 group transition-all duration-300 hover:-translate-y-0.5"
      style={{
        background: "#111128",
        border: "1px solid rgba(255,255,255,0.06)",
        boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
      }}
    >
      <div className="flex items-center justify-between mb-4">
        {Icon && (
          <div
            className="w-11 h-11 rounded-full flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
            style={{ background: t.iconBg }}
          >
            <Icon size={20} style={{ color: t.iconColor }} />
          </div>
        )}
        {trend !== undefined && trend !== null && (
          <span
            className="badge"
            style={{
              color: trend >= 0 ? "#34d399" : "#fb7185",
              background: trend >= 0 ? "rgba(16,185,129,0.1)" : "rgba(244,63,94,0.1)",
              border: `1px solid ${trend >= 0 ? "rgba(16,185,129,0.15)" : "rgba(244,63,94,0.15)"}`,
            }}
          >
            {trend >= 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
            {trend >= 0 ? "+" : ""}{trend}%
          </span>
        )}
      </div>
      <p className="text-[10px] uppercase tracking-[0.15em] text-slate-500 font-semibold mb-1.5">{title}</p>
      <p className="text-3xl font-extrabold text-white tracking-tight">{value}</p>
      {subtitle && <p className="text-[11px] text-slate-500 mt-1.5">{subtitle}</p>}
    </div>
  );
};

export default StatsCard;
