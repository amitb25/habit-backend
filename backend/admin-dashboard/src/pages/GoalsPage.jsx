import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { Target, Search } from "lucide-react";
import Header from "../components/Layout/Header";
import StatsCard from "../components/common/StatsCard";
import DataTable from "../components/common/DataTable";
import Pagination from "../components/common/Pagination";
import Loader from "../components/common/Loader";
import api from "../api/adminApi";
import toast from "react-hot-toast";

const COLORS = ["#6366f1", "#10b981", "#f43f5e", "#f59e0b", "#a855f7", "#ec4899", "#06b6d4"];

const tooltipStyle = {
  backgroundColor: "#141432",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: "12px",
  color: "#fff",
  boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
  fontSize: "12px",
  padding: "10px 14px",
};

const GoalsPage = () => {
  const { onMenuClick } = useOutletContext();
  const [goals, setGoals] = useState([]);
  const [stats, setStats] = useState(null);
  const [pagination, setPagination] = useState({});
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => { api.get("/goals/stats").then((res) => setStats(res.data.data)).catch(() => {
    toast.error("Failed to load goals stats");
  }); }, []);

  useEffect(() => {
    setLoading(true);
    const params = { page, limit: 20 };
    if (search) params.search = search;
    if (statusFilter) params.status = statusFilter;
    api.get("/goals", { params }).then((res) => { setGoals(res.data.data); setPagination(res.data.pagination); }).catch(() => {
      toast.error("Failed to load goals");
    }).finally(() => setLoading(false));
  }, [page, search, statusFilter]);

  const columns = [
    { key: "title", label: "Title", render: (r) => <span className="font-semibold text-white">{r.title}</span> },
    { key: "user", label: "User", render: (r) => r.profiles?.name || "-" },
    { key: "category", label: "Category" },
    { key: "status", label: "Status", render: (r) => (
      <span className={`badge ${r.status === "completed" ? "badge-success" : r.status === "abandoned" ? "badge-danger" : "badge-info"}`}>
        {r.status}
      </span>
    )},
    { key: "priority", label: "Priority" },
    { key: "deadline", label: "Deadline", render: (r) => r.deadline || "-" },
  ];

  return (
    <>
      <Header title="Goals" subtitle="Track user goals" onMenuClick={onMenuClick} />
      <div className="p-6 space-y-6 animate-slideUp">
        {stats && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="grid grid-cols-1 gap-4">
              <StatsCard title="Total Goals" value={stats.total} icon={Target} color="blue" />
              {stats.byStatus.map((s) => (
                <StatsCard key={s.status} title={s.status} value={s.count} color={s.status === "active" ? "blue" : s.status === "completed" ? "green" : "red"} />
              ))}
            </div>
            {stats.byCategory.length > 0 && (
              <div
                className="rounded-2xl p-6"
                style={{
                  background: "#111128",
                  border: "1px solid rgba(255,255,255,0.06)",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
                }}
              >
                <div className="mb-5">
                  <h3 className="text-base font-bold text-white">Goals by Category</h3>
                  <p className="text-xs text-slate-500 mt-1">Distribution across categories</p>
                </div>
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie data={stats.byCategory} dataKey="count" nameKey="category" cx="50%" cy="50%" outerRadius={90} innerRadius={40} label={({ category, count }) => `${category}: ${count}`} strokeWidth={0}>
                      {stats.byCategory.map((_, idx) => <Cell key={idx} fill={COLORS[idx % COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        )}

        <div
          className="flex items-center flex-1 max-w-xl rounded-full px-5 py-3"
          style={{ background: "#111128", border: "1px solid rgba(255,255,255,0.06)" }}
        >
          <Search size={16} className="text-slate-600 shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search goals by title..."
            className="flex-1 bg-transparent border-none outline-none text-sm text-slate-300 placeholder-slate-600 ml-3"
          />
        </div>

        {/* Filter pills */}
        <div className="flex flex-wrap gap-2">
          {["", "active", "completed", "abandoned"].map((s) => (
            <button
              key={s}
              onClick={() => { setStatusFilter(s); setPage(1); }}
              className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all duration-200 ${
                statusFilter === s ? "text-white" : "text-slate-500 hover:text-slate-300"
              }`}
              style={statusFilter === s
                ? { background: "linear-gradient(135deg, #6366f1, #7c3aed)", boxShadow: "0 2px 10px rgba(99,102,241,0.25)" }
                : { background: "#111128", border: "1px solid rgba(255,255,255,0.06)" }
              }
            >
              {s || "All"}
            </button>
          ))}
        </div>

        {loading ? (
          <Loader size={150} text="Loading Goals..." />
        ) : (
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
