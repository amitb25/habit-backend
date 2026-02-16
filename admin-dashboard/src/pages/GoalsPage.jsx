import { useState, useEffect } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { Target } from "lucide-react";
import Header from "../components/Layout/Header";
import StatsCard from "../components/common/StatsCard";
import DataTable from "../components/common/DataTable";
import Pagination from "../components/common/Pagination";
import api from "../api/adminApi";

const COLORS = ["#3b82f6", "#10b981", "#ef4444", "#f59e0b", "#8b5cf6", "#ec4899", "#06b6d4"];
const statusColors = { active: "bg-blue-500/15 text-blue-400", completed: "bg-emerald-500/15 text-emerald-400", abandoned: "bg-red-500/15 text-red-400" };

const GoalsPage = () => {
  const [goals, setGoals] = useState([]);
  const [stats, setStats] = useState(null);
  const [pagination, setPagination] = useState({});
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => { api.get("/goals/stats").then((res) => setStats(res.data.data)).catch(() => {}); }, []);

  useEffect(() => {
    setLoading(true);
    const params = { page, limit: 20 };
    if (statusFilter) params.status = statusFilter;
    api.get("/goals", { params }).then((res) => { setGoals(res.data.data); setPagination(res.data.pagination); }).finally(() => setLoading(false));
  }, [page, statusFilter]);

  const columns = [
    { key: "title", label: "Title", render: (r) => <span className="font-medium">{r.title}</span> },
    { key: "user", label: "User", render: (r) => r.profiles?.name || "-" },
    { key: "category", label: "Category" },
    { key: "status", label: "Status", render: (r) => <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[r.status] || ""}`}>{r.status}</span> },
    { key: "priority", label: "Priority" },
    { key: "deadline", label: "Deadline", render: (r) => r.deadline || "-" },
  ];

  return (
    <>
      <Header title="Goals" />
      <div className="p-6 space-y-6">
        {stats && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="grid grid-cols-1 gap-4">
              <StatsCard title="Total Goals" value={stats.total} icon={Target} color="blue" />
              {stats.byStatus.map((s) => (
                <StatsCard key={s.status} title={s.status} value={s.count} color={s.status === "active" ? "blue" : s.status === "completed" ? "green" : "red"} />
              ))}
            </div>
            {stats.byCategory.length > 0 && (
              <div className="bg-slate-900/80 border border-slate-700/50 rounded-xl p-5">
                <h3 className="text-sm font-medium text-slate-300 mb-4">Goals by Category</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={stats.byCategory} dataKey="count" nameKey="category" cx="50%" cy="50%" outerRadius={90} label={({ category, count }) => `${category}: ${count}`}>
                      {stats.byCategory.map((_, idx) => <Cell key={idx} fill={COLORS[idx % COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: "8px", color: "#fff" }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        )}

        <div className="flex gap-3">
          <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none">
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="abandoned">Abandoned</option>
          </select>
        </div>

        {loading ? <p className="text-slate-400">Loading...</p> : (
          <>
            <DataTable columns={columns} data={goals} />
            <Pagination page={pagination.page} pages={pagination.pages} total={pagination.total} onPageChange={setPage} />
          </>
        )}
      </div>
    </>
  );
};

export default GoalsPage;
