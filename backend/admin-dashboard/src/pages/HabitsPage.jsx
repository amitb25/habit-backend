import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import Header from "../components/Layout/Header";
import StatsCard from "../components/common/StatsCard";
import DataTable from "../components/common/DataTable";
import Pagination from "../components/common/Pagination";
import { ListChecks, Flame, TrendingUp } from "lucide-react";
import Loader from "../components/common/Loader";
import api from "../api/adminApi";

const tooltipStyle = {
  backgroundColor: "#141432",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: "12px",
  color: "#fff",
  boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
  fontSize: "12px",
  padding: "10px 14px",
};

const axisTickStyle = { fill: "#475569", fontSize: 11 };

const HabitsPage = () => {
  const { onMenuClick } = useOutletContext();
  const [habits, setHabits] = useState([]);
  const [stats, setStats] = useState(null);
  const [pagination, setPagination] = useState({});
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get("/habits", { params: { page, limit: 20 } }),
      api.get("/habits/stats"),
    ]).then(([habitsRes, statsRes]) => {
      setHabits(habitsRes.data.data);
      setPagination(habitsRes.data.pagination);
      setStats(statsRes.data.data);
    }).finally(() => setLoading(false));
  }, [page]);

  const columns = [
    { key: "title", label: "Title", render: (r) => <span className="font-semibold text-white">{r.title}</span> },
    { key: "user", label: "User", render: (r) => r.profiles?.name || "-" },
    { key: "category", label: "Category" },
    { key: "current_streak", label: "Streak", render: (r) => <span className="text-amber-400 font-semibold">{r.current_streak || 0}d</span> },
    { key: "total_completions", label: "Completions" },
    { key: "is_completed_today", label: "Today", render: (r) => r.is_completed_today ? <span className="text-emerald-400 font-semibold">Done</span> : <span className="text-slate-600">-</span> },
  ];

  return (
    <>
      <Header title="Habits" subtitle="Track all user habits" onMenuClick={onMenuClick} />
      <div className="p-6 space-y-6 animate-slideUp">
        {stats && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <StatsCard title="Total Habits" value={stats.total} icon={ListChecks} color="blue" />
              <StatsCard title="Completed Today" value={stats.completedToday} icon={TrendingUp} color="green" />
              <StatsCard title="Avg Streak" value={`${stats.avgStreak}d`} icon={Flame} color="yellow" />
            </div>
            {stats.categoryBreakdown.length > 0 && (
              <div
                className="rounded-2xl p-6"
                style={{
                  background: "#111128",
                  border: "1px solid rgba(255,255,255,0.06)",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
                }}
              >
                <div className="mb-5">
                  <h3 className="text-base font-bold text-white">Habits by Category</h3>
                  <p className="text-xs text-slate-500 mt-1">Distribution of habits across categories</p>
                </div>
                <ResponsiveContainer width="100%" height={260}>
                  <AreaChart data={stats.categoryBreakdown}>
                    <defs>
                      <linearGradient id="areaGradHabits" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#a855f7" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#a855f7" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                    <XAxis dataKey="category" tick={axisTickStyle} axisLine={false} tickLine={false} />
                    <YAxis tick={axisTickStyle} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={tooltipStyle} cursor={{ stroke: "rgba(139,92,246,0.2)", strokeWidth: 1 }} />
                    <Area
                      type="monotone"
                      dataKey="count"
                      stroke="#a855f7"
                      strokeWidth={2}
                      fill="url(#areaGradHabits)"
                      dot={{ r: 4, fill: "#111128", stroke: "#a855f7", strokeWidth: 2 }}
                      activeDot={{ r: 6, fill: "#a855f7", stroke: "#111128", strokeWidth: 2 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </>
        )}

        {loading ? (
          <Loader size={150} text="Loading Habits..." />
        ) : (
          <>
            <DataTable columns={columns} data={habits} />
            <Pagination page={pagination.page} pages={pagination.pages} total={pagination.total} onPageChange={setPage} />
          </>
        )}
      </div>
    </>
  );
};

export default HabitsPage;
