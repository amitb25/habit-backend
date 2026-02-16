import { useState, useEffect } from "react";
import Header from "../components/Layout/Header";
import StatsCard from "../components/common/StatsCard";
import DataTable from "../components/common/DataTable";
import Pagination from "../components/common/Pagination";
import { BriefcaseBusiness } from "lucide-react";
import api from "../api/adminApi";

const statusColors = {
  applied: "bg-blue-500/15 text-blue-400",
  phone_screen: "bg-cyan-500/15 text-cyan-400",
  technical: "bg-amber-500/15 text-amber-400",
  hr_round: "bg-purple-500/15 text-purple-400",
  offer: "bg-emerald-500/15 text-emerald-400",
  rejected: "bg-red-500/15 text-red-400",
  ghosted: "bg-slate-500/15 text-slate-400",
};

const InterviewsPage = () => {
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
    { key: "company", label: "Company", render: (r) => <span className="font-medium">{r.company}</span> },
    { key: "user", label: "User", render: (r) => r.profiles?.name || "-" },
    { key: "role", label: "Role" },
    { key: "status", label: "Status", render: (r) => <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[r.status] || ""}`}>{r.status?.replace("_", " ")}</span> },
    { key: "salary", label: "Salary", render: (r) => r.salary || "-" },
    { key: "applied_date", label: "Applied" },
  ];

  return (
    <>
      <Header title="Interviews" />
      <div className="p-6 space-y-6">
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatsCard title="Total" value={stats.total} icon={BriefcaseBusiness} color="blue" />
            {stats.byStatus.slice(0, 3).map((s) => (
              <StatsCard key={s.status} title={s.status.replace("_", " ")} value={s.count} color={s.status === "offer" ? "green" : s.status === "rejected" ? "red" : "yellow"} />
            ))}
          </div>
        )}

        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none">
          <option value="">All Status</option>
          {Object.keys(statusColors).map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
        </select>

        {loading ? <p className="text-slate-400">Loading...</p> : (
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
