import { NavLink } from "react-router-dom";
import {
  LayoutDashboard, Users, Dumbbell, ClipboardList,
  Target, Wallet, BriefcaseBusiness, Settings,
  ListChecks, Sparkles, LogOut, X, Zap, ChevronsLeft,
  ChevronDown,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const navGroups = [
  {
    label: "MAIN MENU",
    links: [
      { to: "/admin", icon: LayoutDashboard, label: "Dashboard", end: true },
      { to: "/admin/users", icon: Users, label: "Users" },
    ],
  },
  {
    label: "CONTENT",
    links: [
      { to: "/admin/exercises", icon: Dumbbell, label: "Exercises" },
      { to: "/admin/workouts", icon: ClipboardList, label: "Workouts" },
    ],
  },
  {
    label: "DATA",
    links: [
      { to: "/admin/habits", icon: ListChecks, label: "Habits" },
      { to: "/admin/daily-tasks", icon: ClipboardList, label: "Daily Tasks" },
      { to: "/admin/finance", icon: Wallet, label: "Finance" },
      { to: "/admin/goals", icon: Target, label: "Goals" },
      // { to: "/admin/interviews", icon: BriefcaseBusiness, label: "Interviews" },
      { to: "/admin/affirmations", icon: Sparkles, label: "Affirmations" },
    ],
  },
];

const Sidebar = ({ isOpen, onClose }) => {
  const { logout, admin } = useAuth();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden animate-fadeIn"
          style={{ background: "rgba(0,0,0,0.7)" }}
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-[260px] flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
        style={{
          background: "#0d0d22",
          borderRight: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        {/* Brand Header */}
        <div className="px-5 py-5 flex items-center justify-between">
          <div className="flex items-center">
            <img
              src={import.meta.env.BASE_URL + "logo.png"}
              alt="LifeStack"
              className="w-44 h-14 shrink-0 object-contain"
            />
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-600 hover:text-white hover:bg-white/5 transition-colors"
          >
            <ChevronsLeft size={16} className="hidden lg:block" />
            <X size={18} className="lg:hidden" />
          </button>
        </div>

        {/* Divider */}
        <div className="mx-4 h-px" style={{ background: "rgba(255,255,255,0.06)" }} />

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-5">
          {navGroups.map((group) => (
            <div key={group.label}>
              <div className="flex items-center justify-between px-3 mb-3">
                <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-600">
                  {group.label}
                </p>
                <ChevronsLeft size={12} className="text-slate-700" />
              </div>
              <div className="space-y-1">
                {group.links.map(({ to, icon: Icon, label, end }) => (
                  <NavLink
                    key={to}
                    to={to}
                    end={end}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 ${
                        isActive
                          ? "text-white"
                          : "text-slate-500 hover:text-slate-300 hover:bg-white/[0.04]"
                      }`
                    }
                    style={({ isActive }) =>
                      isActive
                        ? {
                            background: "linear-gradient(135deg, #6366f1, #7c3aed)",
                            boxShadow: "0 4px 20px rgba(99,102,241,0.3)",
                          }
                        : {}
                    }
                  >
                    <Icon size={17} className="shrink-0" />
                    {label}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}

          {/* Settings - separate */}
          <div>
            <NavLink
              to="/admin/settings"
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 ${
                  isActive
                    ? "text-white"
                    : "text-slate-500 hover:text-slate-300 hover:bg-white/[0.04]"
                }`
              }
              style={({ isActive }) =>
                isActive
                  ? {
                      background: "linear-gradient(135deg, #6366f1, #7c3aed)",
                      boxShadow: "0 4px 20px rgba(99,102,241,0.3)",
                    }
                  : {}
              }
            >
              <Settings size={17} className="shrink-0" />
              Settings
            </NavLink>
          </div>
        </nav>

        {/* Admin Profile Card */}
        <div className="p-4" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="flex items-center gap-3">
            <div className="relative shrink-0">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold"
                style={{
                  background: "linear-gradient(135deg, #6366f1, #a855f7)",
                  boxShadow: "0 2px 10px rgba(99,102,241,0.25)",
                }}
              >
                {admin?.name?.charAt(0)?.toUpperCase() || "A"}
              </div>
              <div
                className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400"
                style={{ border: "2.5px solid #0d0d22" }}
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-white truncate">{admin?.name || "Admin"}</p>
              <p className="text-[10px] text-slate-600 truncate">{admin?.role || "Administrator"}</p>
            </div>
            <button
              onClick={logout}
              className="p-2 text-slate-600 hover:text-rose-400 transition-all duration-200 rounded-lg hover:bg-rose-500/10"
              title="Logout"
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
