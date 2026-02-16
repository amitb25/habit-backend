const StatsCard = ({ title, value, icon: Icon, color = "blue", subtitle }) => {
  const colors = {
    blue: "bg-blue-600/15 text-blue-400",
    green: "bg-emerald-600/15 text-emerald-400",
    yellow: "bg-amber-600/15 text-amber-400",
    red: "bg-red-600/15 text-red-400",
    purple: "bg-purple-600/15 text-purple-400",
  };

  return (
    <div className="bg-slate-900/80 border border-slate-700/50 rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-slate-400">{title}</p>
        {Icon && (
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${colors[color]}`}>
            <Icon size={18} />
          </div>
        )}
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
      {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
    </div>
  );
};

export default StatsCard;
