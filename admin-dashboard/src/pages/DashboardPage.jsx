import { useState, useEffect } from "react";
import { Users, Dumbbell, Target, Activity, TrendingUp, Shield } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import Header from "../components/Layout/Header";
import StatsCard from "../components/common/StatsCard";
import api from "../api/adminApi";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

const DashboardPage = () => {
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
        <Header title="Dashboard" />
        <div className="p-6 text-slate-400">Loading...</div>
      </>
    );
  }

  return (
    <>
      <Header title="Dashboard" />
      <div className="p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard title="Total Users" value={stats?.totalUsers || 0} icon={Users} color="blue" />
          <StatsCard title="Active Today" value={stats?.activeToday || 0} icon={Activity} color="green" />
          <StatsCard title="New This Week" value={stats?.newUsersWeek || 0} icon={TrendingUp} color="yellow" />
          <StatsCard title="Total Habits" value={stats?.totalHabits || 0} icon={Target} color="purple" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard title="Habits Done Today" value={stats?.habitsCompletedToday || 0} icon={Activity} color="green" />
          <StatsCard title="Total Exercises" value={stats?.totalExercises || 0} icon={Dumbbell} color="blue" />
          <StatsCard title="Total Goals" value={stats?.totalGoals || 0} icon={Target} color="yellow" />
          <StatsCard title="Blocked Users" value={stats?.blockedUsers || 0} icon={Shield} color="red" />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* User Growth */}
          <div className="bg-slate-900/80 border border-slate-700/50 rounded-xl p-5">
            <h3 className="text-sm font-medium text-slate-300 mb-4">User Growth (Last 30 Days)</h3>
            {userGrowth.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={userGrowth}>
                  <XAxis dataKey="date" tick={{ fill: "#64748b", fontSize: 11 }} tickFormatter={(d) => d.slice(5)} />
                  <YAxis tick={{ fill: "#64748b", fontSize: 11 }} />
                  <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: "8px", color: "#fff" }} />
                  <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-slate-500 text-sm">No data yet</p>
            )}
          </div>

          {/* Level Distribution */}
          <div className="bg-slate-900/80 border border-slate-700/50 rounded-xl p-5">
            <h3 className="text-sm font-medium text-slate-300 mb-4">User Level Distribution</h3>
            {levelDist.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={levelDist} dataKey="count" nameKey="range" cx="50%" cy="50%" outerRadius={90} label={({ range, count }) => `${range}: ${count}`}>
                    {levelDist.map((_, idx) => (
                      <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: "8px", color: "#fff" }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-slate-500 text-sm">No data yet</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default DashboardPage;
