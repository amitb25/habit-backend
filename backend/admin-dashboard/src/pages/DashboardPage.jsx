import { useState, useEffect } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import { Users, Dumbbell, Target, Activity, TrendingUp, Shield, ListChecks, Wallet, Sparkles } from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, CartesianGrid,
} from "recharts";
import Header from "../components/Layout/Header";
import StatsCard from "../components/common/StatsCard";
import { useAuth } from "../context/AuthContext";
import Loader from "../components/common/Loader";
import api from "../api/adminApi";

const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#f43f5e", "#a855f7", "#06b6d4"];

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

const quickActions = [
  { icon: Users, label: "Users", to: "/admin/users", gradient: "linear-gradient(135deg, #6366f1, #818cf8)", shadow: "rgba(99,102,241,0.3)" },
  { icon: Dumbbell, label: "Exercises", to: "/admin/exercises", gradient: "linear-gradient(135deg, #10b981, #34d399)", shadow: "rgba(16,185,129,0.3)" },
  { icon: ListChecks, label: "Habits", to: "/admin/habits", gradient: "linear-gradient(135deg, #f59e0b, #fbbf24)", shadow: "rgba(245,158,11,0.3)" },
  { icon: Wallet, label: "Finance", to: "/admin/finance", gradient: "linear-gradient(135deg, #f43f5e, #fb7185)", shadow: "rgba(244,63,94,0.3)" },
  { icon: Target, label: "Goals", to: "/admin/goals", gradient: "linear-gradient(135deg, #8b5cf6, #a78bfa)", shadow: "rgba(139,92,246,0.3)" },
  { icon: Sparkles, label: "Affirm", to: "/admin/affirmations", gradient: "linear-gradient(135deg, #ec4899, #f472b6)", shadow: "rgba(236,72,153,0.3)" },
];

const DashboardPage = () => {
  const { onMenuClick } = useOutletContext();
  const navigate = useNavigate();
  const { admin } = useAuth();
  const [stats, setStats] = useState(null);
  const [userGrowth, setUserGrowth] = useState([]);
  const [levelDist, setLevelDist] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get("/dashboard/stats"),
      api.get("/dashboard/user-growth"),
      api.get("/dashboard/level-distribution"),
    ])
      .then(([statsRes, growthRes, levelRes]) => {
        setStats(statsRes.data.data);
        setUserGrowth(growthRes.data.data);
        setLevelDist(levelRes.data.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <>
        <Header title="Dashboard" onMenuClick={onMenuClick} />
        <div className="p-6 flex items-center justify-center min-h-[60vh]">
          <Loader size={180} text="Loading Dashboard..." />
        </div>
      </>
    );
  }

  return (
    <>
      <Header title="Dashboard" subtitle={`Welcome back, ${admin?.name || "Admin"}`} onMenuClick={onMenuClick} />
      <div className="p-6 space-y-6 animate-slideUp">

        {/* Hero Banner */}
        <div
          className="relative overflow-hidden rounded-2xl p-8"
          style={{
            background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 40%, #a855f7 70%, #c084fc 100%)",
            boxShadow: "0 8px 40px rgba(99,102,241,0.25)",
          }}
        >
          <div className="absolute -right-10 -top-10 w-72 h-72 rounded-full opacity-20" style={{ background: "radial-gradient(circle, rgba(255,255,255,0.3), transparent)" }} />
          <div className="absolute right-24 bottom-0 w-44 h-44 rounded-full opacity-10" style={{ background: "radial-gradient(circle, rgba(255,255,255,0.4), transparent)" }} />

          <div className="relative z-10 max-w-lg">
            <span
              className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] font-bold text-white/90 rounded-full px-3.5 py-1.5 mb-4"
              style={{ background: "rgba(255,255,255,0.15)" }}
            >
              <Sparkles size={11} /> Admin Dashboard
            </span>
            <h3 className="text-2xl font-extrabold text-white mb-2 tracking-tight">
              LifeStack Analytics
            </h3>
            <p className="text-sm text-white/60 mb-5 leading-relaxed max-w-md">
              Monitor users, track habits, exercises, and finances. Real-time insights for your platform.
            </p>
            <button
              onClick={() => navigate("/admin/users")}
              className="px-6 py-2.5 rounded-xl text-sm font-bold text-indigo-700 bg-white hover:bg-white/90 transition-all duration-200"
              style={{ boxShadow: "0 4px 15px rgba(0,0,0,0.15)" }}
            >
              View All Users
            </button>
          </div>
        </div>

        {/* Stats Row 1 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard title="Total Users" value={stats?.totalUsers || 0} icon={Users} color="blue" />
          <StatsCard title="Active Today" value={stats?.activeToday || 0} icon={Activity} color="green" />
          <StatsCard title="New This Week" value={stats?.newUsersWeek || 0} icon={TrendingUp} color="yellow" />
          <StatsCard title="Total Habits" value={stats?.totalHabits || 0} icon={Target} color="purple" />
        </div>

        {/* Stats Row 2 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard title="Habits Done Today" value={stats?.habitsCompletedToday || 0} icon={Activity} color="green" />
          <StatsCard title="Total Exercises" value={stats?.totalExercises || 0} icon={Dumbbell} color="blue" />
          <StatsCard title="Total Goals" value={stats?.totalGoals || 0} icon={Target} color="yellow" />
          <StatsCard title="Blocked Users" value={stats?.blockedUsers || 0} icon={Shield} color="red" />
        </div>

        {/* Charts + Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* User Growth - Area Chart (KORA style) */}
          <div
            className="lg:col-span-2 rounded-2xl p-6"
            style={{
              background: "#111128",
              border: "1px solid rgba(255,255,255,0.06)",
              boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
            }}
          >
            <div className="mb-5">
              <h3 className="text-base font-bold text-white">User Growth</h3>
              <p className="text-xs text-slate-500 mt-1">Last 30 days registration trend</p>
            </div>
            {userGrowth.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={userGrowth}>
                  <defs>
                    <linearGradient id="areaGradGrowth" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#818cf8" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#818cf8" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                  <XAxis dataKey="date" tick={axisTickStyle} tickFormatter={(d) => d.slice(5)} axisLine={false} tickLine={false} />
                  <YAxis tick={axisTickStyle} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={tooltipStyle} cursor={{ stroke: "rgba(99,102,241,0.2)", strokeWidth: 1 }} />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke="#818cf8"
                    strokeWidth={2}
                    fill="url(#areaGradGrowth)"
                    dot={{ r: 4, fill: "#111128", stroke: "#818cf8", strokeWidth: 2 }}
                    activeDot={{ r: 6, fill: "#818cf8", stroke: "#111128", strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="py-20 text-center">
                <p className="text-slate-600 text-sm">No growth data available yet</p>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div
            className="rounded-2xl p-6"
            style={{
              background: "#111128",
              border: "1px solid rgba(255,255,255,0.06)",
              boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
            }}
          >
            <h3 className="text-base font-bold text-white mb-5">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              {quickActions.map(({ icon: Icon, label, to, gradient, shadow }) => (
                <button
                  key={to}
                  onClick={() => navigate(to)}
                  className="flex flex-col items-center gap-3 p-4 rounded-xl transition-all duration-300 hover:-translate-y-1"
                  style={{
                    background: "#0d0d22",
                    border: "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center"
                    style={{ background: gradient, boxShadow: `0 4px 15px ${shadow}` }}
                  >
                    <Icon size={18} className="text-white" />
                  </div>
                  <span className="text-xs font-medium text-slate-400">{label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Level Distribution */}
        <div
          className="rounded-2xl p-6"
          style={{
            background: "#111128",
            border: "1px solid rgba(255,255,255,0.06)",
            boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
          }}
        >
          <div className="mb-5">
            <h3 className="text-base font-bold text-white">User Level Distribution</h3>
            <p className="text-xs text-slate-500 mt-1">Breakdown of user levels across the platform</p>
          </div>
          {levelDist.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={levelDist}
                  dataKey="count"
                  nameKey="range"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  innerRadius={50}
                  label={({ range, count }) => `${range}: ${count}`}
                  strokeWidth={0}
                >
                  {levelDist.map((_, idx) => (
                    <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="py-20 text-center">
              <p className="text-slate-600 text-sm">No level data available yet</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default DashboardPage;
