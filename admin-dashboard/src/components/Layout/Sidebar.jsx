import { NavLink } from "react-router-dom";
import {
  LayoutDashboard, Users, Dumbbell, ClipboardList,
  Target, Wallet, BriefcaseBusiness, Heart, Settings,
  ListChecks, Sparkles, LogOut,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const links = [
  { to: "/admin", icon: LayoutDashboard, label: "Dashboard", end: true },
  { to: "/admin/users", icon: Users, label: "Users" },
  { to: "/admin/exercises", icon: Dumbbell, label: "Exercises" },
  { to: "/admin/workouts", icon: ClipboardList, label: "Workouts" },
  { to: "/admin/habits", icon: ListChecks, label: "Habits" },
  { to: "/admin/daily-tasks", icon: ClipboardList, label: "Daily Tasks" },
  { to: "/admin/finance", icon: Wallet, label: "Finance" },
  { to: "/admin/goals", icon: Target, label: "Goals" },
  { to: "/admin/interviews", icon: BriefcaseBusiness, label: "Interviews" },
  { to: "/admin/affirmations", icon: Sparkles, label: "Affirmations" },
  { to: "/admin/settings", icon: Settings, label: "Settings" },
];

const Sidebar = () => {
  const { logout, admin } = useAuth();

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-700/50 flex flex-col h-screen sticky top-0">
      <div className="p-5 border-b border-slate-700/50">
        <h1 className="text-xl font-bold text-white tracking-tight">HustleKit</h1>
        <p className="text-xs text-slate-400 mt-1">Admin Dashboard</p>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {links.map(({ to, icon: Icon, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-blue-600/20 text-blue-400"
                  : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-700/50">
        <div className="flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-sm font-medium text-white truncate">{admin?.name}</p>
            <p className="text-xs text-slate-400 truncate">{admin?.role}</p>
          </div>
          <button onClick={logout} className="p-2 text-slate-400 hover:text-red-400 transition-colors" title="Logout">
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
