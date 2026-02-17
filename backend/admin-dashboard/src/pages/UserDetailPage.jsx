import { useState, useEffect } from "react";
import { useParams, useNavigate, useOutletContext } from "react-router-dom";
import { ArrowLeft, Mail, Zap, Flame, Target } from "lucide-react";
import Header from "../components/Layout/Header";
import StatsCard from "../components/common/StatsCard";
import DataTable from "../components/common/DataTable";
import Loader from "../components/common/Loader";
import api from "../api/adminApi";

const UserDetailPage = () => {
  const { onMenuClick } = useOutletContext();
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

  if (loading) return (
    <>
      <Header title="User Detail" onMenuClick={onMenuClick} />
      <div className="p-6 flex items-center justify-center min-h-[60vh]">
        <Loader size={160} text="Loading User..." />
      </div>
    </>
  );
  if (!user) return null;

  const tabs = ["habits", "tasks", "finance", "goals"];
  const tabColumns = {
    habits: [
      { key: "title", label: "Title", render: (r) => <span className="font-semibold text-heading">{r.title}</span> },
      { key: "category", label: "Category" },
      { key: "current_streak", label: "Streak", render: (r) => <span className="text-amber-400 font-semibold">{r.current_streak || 0}d</span> },
      { key: "total_completions", label: "Completions" },
    ],
    tasks: [
      { key: "title", label: "Title", render: (r) => <span className="font-semibold text-heading">{r.title}</span> },
      { key: "task_date", label: "Date" },
      { key: "priority", label: "Priority", render: (r) => (
        <span className={`badge ${r.priority === "high" ? "badge-danger" : r.priority === "medium" ? "badge-warning" : "badge-info"}`}>
          {r.priority}
        </span>
      )},
      { key: "is_completed", label: "Done", render: (r) => r.is_completed ? <span className="text-emerald-400 font-semibold">Yes</span> : <span className="text-slate-600">No</span> },
    ],
    finance: [
      { key: "title", label: "Title", render: (r) => <span className="font-semibold text-heading">{r.title}</span> },
      { key: "type", label: "Type", render: (r) => (
        <span className={r.type === "income" ? "text-emerald-400 font-semibold" : "text-rose-400 font-semibold"}>{r.type}</span>
      )},
      { key: "amount", label: "Amount", render: (r) => `$${r.amount}` },
      { key: "category", label: "Category" },
      { key: "transaction_date", label: "Date" },
    ],
    goals: [
      { key: "title", label: "Title", render: (r) => <span className="font-semibold text-heading">{r.title}</span> },
      { key: "category", label: "Category" },
      { key: "status", label: "Status" },
      { key: "priority", label: "Priority" },
    ],
  };

  return (
    <>
      <Header title="User Detail" onMenuClick={onMenuClick} />
      <div className="p-6 space-y-6 animate-slideUp">
        <button onClick={() => navigate("/admin/users")} className="flex items-center gap-2 text-sm text-slate-500 hover-text-heading transition-colors font-medium cursor-pointer">
          <ArrowLeft size={16} /> Back to Users
        </button>

        {/* Profile Card */}
        <div
          className="rounded-2xl p-6 accent-top"
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border-subtle)",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <div className="flex items-center gap-5">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold text-white shrink-0"
              style={{
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                boxShadow: "0 0 0 3px rgba(99,102,241,0.15), 0 4px 20px rgba(99,102,241,0.2)",
              }}
            >
              {user.name?.charAt(0)?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-xl font-bold text-heading">{user.name}</h3>
              <p className="text-sm text-slate-500 flex items-center gap-1.5 mt-1"><Mail size={14} /> {user.email}</p>
            </div>
            <span className={user.is_blocked ? "badge badge-danger" : "badge badge-success"}>
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
        <div className="flex gap-1 p-1 rounded-xl" style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-subtle)" }}>
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-2.5 text-sm font-medium capitalize transition-all duration-200 rounded-lg flex-1 cursor-pointer ${
                tab === t ? "text-white" : "text-slate-500 hover-text-body"
              }`}
              style={tab === t ? {
                background: "linear-gradient(135deg, #6366f1, #7c3aed)",
                boxShadow: "0 2px 10px rgba(99,102,241,0.25)",
              } : {}}
            >
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
