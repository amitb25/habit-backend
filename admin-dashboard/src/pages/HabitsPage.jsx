import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import Header from "../components/Layout/Header";
import StatsCard from "../components/common/StatsCard";
import DataTable from "../components/common/DataTable";
import Pagination from "../components/common/Pagination";
import { ListChecks, Flame, TrendingUp } from "lucide-react";
import api from "../api/adminApi";

const HabitsPage = () => {
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
    { key: "title", label: "Title", render: (r) => <span className="font-medium">{r.title}</span> },
    { key: "user", label: "User", render: (r) => r.profiles?.name || "-" },
    { key: "category", label: "Category" },
    { key: "current_streak", label: "Streak", render: (r) => `${r.current_streak || 0}d` },
    { key: "total_completions", label: "Completions" },
    { key: "is_completed_today", label: "Today", render: (r) => r.is_completed_today ? <span className="text-emerald-400">Done</span> : <span className="text-slate-500">-</span> },
  ];

  return (
    <>
      <Header title="Habits" />
      <div className="p-6 space-y-6">
        {stats && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <StatsCard title="Total Habits" value={stats.total} icon={ListChecks} color="blue" />
              <StatsCard title="Completed Today" value={stats.completedToday} icon={TrendingUp} color="green" />
              <StatsCard title="Avg Streak" value={`${stats.avgStreak}d`} icon={Flame} color="yellow" />
            </div>
            {stats.categoryBreakdown.length > 0 && (
              <div className="bg-slate-900/80 border border-slate-700/50 rounded-xl p-5">
                <h3 className="text-sm font-medium text-slate-300 mb-4">Habits by Category</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={stats.categoryBreakdown}>
                    <XAxis dataKey="category" tick={{ fill: "#64748b", fontSize: 11 }} />
                    <YAxis tick={{ fill: "#64748b", fontSize: 11 }} />
                    <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: "8px", color: "#fff" }} />
                    <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </>
        )}

        {loading ? <p className="text-slate-400">Loading...</p> : (
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
