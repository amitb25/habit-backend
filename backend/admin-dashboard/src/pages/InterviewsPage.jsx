import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import Header from "../components/Layout/Header";
import StatsCard from "../components/common/StatsCard";
import DataTable from "../components/common/DataTable";
import Pagination from "../components/common/Pagination";
import { BriefcaseBusiness } from "lucide-react";
import Loader from "../components/common/Loader";
import api from "../api/adminApi";

const statusConfig = {
  applied: { color: "#60a5fa", bg: "rgba(59,130,246,0.12)", border: "rgba(59,130,246,0.15)" },
  phone_screen: { color: "#22d3ee", bg: "rgba(6,182,212,0.12)", border: "rgba(6,182,212,0.15)" },
  technical: { color: "#fbbf24", bg: "rgba(245,158,11,0.12)", border: "rgba(245,158,11,0.15)" },
  hr_round: { color: "#a78bfa", bg: "rgba(139,92,246,0.12)", border: "rgba(139,92,246,0.15)" },
  offer: { color: "#34d399", bg: "rgba(16,185,129,0.12)", border: "rgba(16,185,129,0.15)" },
  rejected: { color: "#f87171", bg: "rgba(239,68,68,0.12)", border: "rgba(239,68,68,0.15)" },
  ghosted: { color: "#94a3b8", bg: "rgba(100,116,139,0.12)", border: "rgba(100,116,139,0.15)" },
};

const InterviewsPage = () => {
  const { onMenuClick } = useOutletContext();
  const [interviews, setInterviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [pagination, setPagination] = useState({});
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => { api.get("/interviews/stats").then((res) => setStats(res.data.data)).catch(() => {}); }, []);

  useEffect(() => {
    setLoading(true);
    const params = { page, limit: 20 };
    if (statusFilter) params.status = statusFilter;
    api.get("/interviews", { params }).then((res) => { setInterviews(res.data.data); setPagination(res.data.pagination); }).finally(() => setLoading(false));
  }, [page, statusFilter]);

  const columns = [
    { key: "company", label: "Company", render: (r) => <span className="font-semibold text-white">{r.company}</span> },
    { key: "user", label: "User", render: (r) => r.profiles?.name || "-" },
    { key: "role", label: "Role" },
    { key: "status", label: "Status", render: (r) => {
      const sc = statusConfig[r.status] || {};
      return (
        <span className="badge" style={{ color: sc.color, background: sc.bg, border: `1px solid ${sc.border}` }}>
          {r.status?.replace("_", " ")}
        </span>
      );
    }},
    { key: "salary", label: "Salary", render: (r) => r.salary || "-" },
    { key: "applied_date", label: "Applied" },
  ];

  return (
    <>
      <Header title="Interviews" subtitle="Track job applications" onMenuClick={onMenuClick} />
      <div className="p-6 space-y-6 animate-slideUp">
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatsCard title="Total" value={stats.total} icon={BriefcaseBusiness} color="blue" />
            {stats.byStatus.slice(0, 3).map((s) => (
              <StatsCard key={s.status} title={s.status.replace("_", " ")} value={s.count} color={s.status === "offer" ? "green" : s.status === "rejected" ? "red" : "yellow"} />
            ))}
          </div>
        )}

        <div>
          <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="input-dark rounded-xl px-4 py-2.5 text-sm">
            <option value="">All Status</option>
            {Object.keys(statusConfig).map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
          </select>
        </div>

        {loading ? (
          <Loader size={150} text="Loading Interviews..." />
        ) : (
          <>
            <DataTable columns={columns} data={interviews} />
            <Pagination page={pagination.page} pages={pagination.pages} total={pagination.total} onPageChange={setPage} />
          </>
        )}
      </div>
    </>
  );
};

export default InterviewsPage;
