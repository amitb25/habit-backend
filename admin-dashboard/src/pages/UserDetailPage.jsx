import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Mail, Calendar, Zap, Flame, Target } from "lucide-react";
import Header from "../components/Layout/Header";
import StatsCard from "../components/common/StatsCard";
import DataTable from "../components/common/DataTable";
import api from "../api/adminApi";

const UserDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState("habits");
  const [tabData, setTabData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/users/${id}`)
      .then((res) => setUser(res.data.data))
      .catch(() => navigate("/admin/users"))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!user) return;
    api.get(`/users/${id}/${tab}`)
      .then((res) => setTabData(res.data.data))
      .catch(() => setTabData([]));
  }, [tab, user]);

  if (loading) return <><Header title="User Detail" /><div className="p-6 text-slate-400">Loading...</div></>;
  if (!user) return null;

  const tabs = ["habits", "tasks", "finance", "goals"];
  const tabColumns = {
    habits: [
      { key: "title", label: "Title" },
      { key: "category", label: "Category" },
      { key: "current_streak", label: "Streak", render: (r) => `${r.current_streak || 0}d` },
      { key: "total_completions", label: "Completions" },
    ],
    tasks: [
      { key: "title", label: "Title" },
      { key: "task_date", label: "Date" },
      { key: "priority", label: "Priority", render: (r) => (
        <span className={`px-2 py-0.5 rounded-full text-xs ${r.priority === "high" ? "bg-red-500/15 text-red-400" : r.priority === "medium" ? "bg-amber-500/15 text-amber-400" : "bg-slate-500/15 text-slate-400"}`}>
          {r.priority}
        </span>
      )},
      { key: "is_completed", label: "Done", render: (r) => r.is_completed ? "Yes" : "No" },
    ],
    finance: [
      { key: "title", label: "Title" },
      { key: "type", label: "Type", render: (r) => (
        <span className={r.type === "income" ? "text-emerald-400" : "text-red-400"}>{r.type}</span>
      )},
      { key: "amount", label: "Amount", render: (r) => `$${r.amount}` },
      { key: "category", label: "Category" },
      { key: "transaction_date", label: "Date" },
    ],
    goals: [
      { key: "title", label: "Title" },
      { key: "category", label: "Category" },
      { key: "status", label: "Status" },
      { key: "priority", label: "Priority" },
    ],
  };

  return (
    <>
      <Header title="User Detail" />
      <div className="p-6 space-y-6">
        <button onClick={() => navigate("/admin/users")} className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors">
          <ArrowLeft size={16} /> Back to Users
        </button>

        {/* Profile */}
        <div className="bg-slate-900/80 border border-slate-700/50 rounded-xl p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-full bg-blue-600/20 flex items-center justify-center text-blue-400 text-xl font-bold">
              {user.name?.charAt(0)?.toUpperCase()}
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">{user.name}</h3>
              <p className="text-sm text-slate-400 flex items-center gap-1"><Mail size={14} /> {user.email}</p>
            </div>
            <span className={`ml-auto px-3 py-1 rounded-full text-xs font-medium ${user.is_blocked ? "bg-red-500/15 text-red-400" : "bg-emerald-500/15 text-emerald-400"}`}>
              {user.is_blocked ? "Blocked" : "Active"}
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <StatsCard title="Level" value={user.level || 1} icon={Zap} color="yellow" />
          <StatsCard title="XP" value={user.xp || 0} icon={Zap} color="blue" />
          <StatsCard title="Streak" value={`${user.app_streak || 0}d`} icon={Flame} color="red" />
          <StatsCard title="Habits" value={user.counts?.habits || 0} icon={Target} color="green" />
          <StatsCard title="Goals" value={user.counts?.goals || 0} icon={Target} color="purple" />
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-slate-700/50 pb-0">
          {tabs.map((t) => (
            <button key={t} onClick={() => setTab(t)} className={`px-4 py-2.5 text-sm font-medium capitalize transition-colors border-b-2 ${tab === t ? "text-blue-400 border-blue-400" : "text-slate-400 border-transparent hover:text-slate-200"}`}>
              {t}
            </button>
          ))}
        </div>

        <DataTable columns={tabColumns[tab] || []} data={tabData} emptyMessage={`No ${tab} found`} />
      </div>
    </>
  );
};

export default UserDetailPage;
