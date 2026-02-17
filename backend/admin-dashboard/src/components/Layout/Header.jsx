import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, Search, Bell, Sun, Moon, MessageCircle, LayoutGrid, User, Settings, LogOut } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";

const searchOptions = [
  { label: "Dashboard", path: "/admin", keywords: ["dashboard", "home", "overview", "stats"] },
  { label: "Users", path: "/admin/users", keywords: ["users", "members", "people", "accounts"] },
  { label: "Exercises", path: "/admin/exercises", keywords: ["exercises", "workout", "fitness", "gym"] },
  { label: "Workout Plans", path: "/admin/workouts", keywords: ["workouts", "plans", "training", "routine"] },
  { label: "Habits", path: "/admin/habits", keywords: ["habits", "streak", "daily", "tracking"] },
  { label: "Daily Tasks", path: "/admin/daily-tasks", keywords: ["daily", "tasks", "todo", "checklist"] },
  { label: "Finance", path: "/admin/finance", keywords: ["finance", "money", "budget", "transactions", "income", "expense"] },
  { label: "Goals", path: "/admin/goals", keywords: ["goals", "milestones", "progress", "target"] },
  { label: "Affirmations", path: "/admin/affirmations", keywords: ["affirmations", "quotes", "motivation"] },
  { label: "Settings", path: "/admin/settings", keywords: ["settings", "config", "preferences", "options"] },
];

const Header = ({ title, subtitle, onMenuClick }) => {
  const { admin, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const dropdownRef = useRef(null);
  const searchRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Cmd+K shortcut
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        searchRef.current?.querySelector("input")?.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const filteredResults = searchQuery.trim()
    ? searchOptions.filter((opt) => {
        const q = searchQuery.toLowerCase();
        return opt.label.toLowerCase().includes(q) || opt.keywords.some((k) => k.includes(q));
      })
    : [];

  const handleSearchSelect = (path) => {
    navigate(path);
    setSearchQuery("");
    setShowResults(false);
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === "Enter" && filteredResults.length > 0) {
      handleSearchSelect(filteredResults[0].path);
    }
    if (e.key === "Escape") {
      setShowResults(false);
      e.target.blur();
    }
  };

  return (
    <header
      className="sticky top-0 z-10"
      style={{
        background: "var(--bg-header)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid var(--border-subtle)",
      }}
    >
      {/* Top bar with search + icons */}
      <div className="px-6 py-3 flex items-center gap-6">
        {/* Mobile hamburger */}
        {onMenuClick && (
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-xl text-slate-500 hover-text-heading transition-all duration-200 shrink-0 cursor-pointer"
            style={{ background: "var(--bg-card)", border: "1px solid var(--border-subtle)" }}
          >
            <Menu size={18} />
          </button>
        )}

        {/* Search Bar - wide pill shape like KORA */}
        <div className="hidden md:block flex-1 max-w-2xl relative" ref={searchRef}>
          <div
            className="relative flex items-center w-full rounded-full px-5 py-3"
            style={{
              background: "var(--bg-card)",
              border: `1px solid ${showResults && filteredResults.length > 0 ? "rgba(99,102,241,0.3)" : "var(--border-subtle)"}`,
              transition: "border-color 0.2s ease",
            }}
          >
            <Search size={16} className="text-slate-600 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setShowResults(true); }}
              onFocus={() => setShowResults(true)}
              onKeyDown={handleSearchKeyDown}
              placeholder="Type to search..."
              className="flex-1 bg-transparent border-none outline-none text-sm text-body placeholder-slate-600 ml-3"
            />
            <span
              className="shrink-0 text-[11px] font-medium text-slate-500 px-2 py-1 rounded-lg"
              style={{
                background: "var(--border-subtle)",
                border: "1px solid var(--border-medium)",
              }}
            >
              ⌘K
            </span>
          </div>

          {/* Search Results Dropdown */}
          {showResults && searchQuery.trim() && (
            <div
              className="absolute top-full left-0 right-0 mt-2 rounded-2xl py-2 animate-slideUp overflow-hidden"
              style={{
                background: "var(--bg-card-elevated)",
                border: "1px solid var(--border-medium)",
                boxShadow: "var(--shadow-lg)",
              }}
            >
              {filteredResults.length > 0 ? (
                filteredResults.map((opt) => (
                  <button
                    key={opt.path}
                    onClick={() => handleSearchSelect(opt.path)}
                    className="w-full flex items-center gap-3 px-5 py-3 text-sm text-slate-400 hover-text-heading hover-bg-subtle transition-all duration-200 cursor-pointer"
                  >
                    <Search size={14} className="text-slate-600" />
                    <span className="font-medium">{opt.label}</span>
                    <span className="ml-auto text-[10px] text-slate-600 uppercase tracking-wider">Page</span>
                  </button>
                ))
              ) : (
                <div className="px-5 py-4 text-sm text-slate-600 text-center">
                  No results for "{searchQuery}"
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right side icons */}
        <div className="flex items-center gap-3 shrink-0 ml-auto">
          <button
            onClick={toggleTheme}
            className="p-2 text-amber-400 hover:text-amber-300 transition-colors cursor-pointer"
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button className="p-2 text-slate-500 hover-text-heading transition-colors cursor-pointer" title="Messages">
            <MessageCircle size={18} />
          </button>
          <button className="p-2 text-slate-500 hover-text-heading transition-colors cursor-pointer" title="Apps">
            <LayoutGrid size={18} />
          </button>
          <button className="relative p-2 text-slate-500 hover-text-heading transition-colors cursor-pointer" title="Notifications">
            <Bell size={18} />
            <span
              className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500"
              style={{ boxShadow: "0 0 6px rgba(244,63,94,0.5)" }}
            />
          </button>

          {/* Avatar with dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold cursor-pointer ml-1 transition-all duration-200 hover:ring-2 hover:ring-indigo-500/40"
              style={{
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                boxShadow: "0 2px 10px rgba(99,102,241,0.2)",
              }}
            >
              {admin?.name?.charAt(0)?.toUpperCase() || "A"}
            </button>

            {/* Dropdown Menu */}
            {showDropdown && (
              <div
                className="absolute right-0 top-12 w-56 rounded-2xl py-2 animate-slideUp"
                style={{
                  background: "var(--bg-card-elevated)",
                  border: "1px solid var(--border-medium)",
                  boxShadow: "var(--shadow-lg)",
                }}
              >
                {/* User info */}
                <div className="px-4 py-3" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                  <p className="text-sm font-semibold text-heading truncate">{admin?.name || "Admin"}</p>
                  <p className="text-xs text-slate-500 truncate mt-0.5">{admin?.email || "admin@lifestack.com"}</p>
                </div>

                {/* Menu items */}
                <div className="py-1">
                  <button
                    onClick={() => { setShowDropdown(false); navigate("/admin/settings"); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-400 hover-text-heading hover-bg-subtle transition-all duration-200 cursor-pointer"
                  >
                    <User size={15} />
                    Profile
                  </button>
                  <button
                    onClick={() => { setShowDropdown(false); navigate("/admin/settings"); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-400 hover-text-heading hover-bg-subtle transition-all duration-200 cursor-pointer"
                  >
                    <Settings size={15} />
                    Settings
                  </button>
                </div>

                <div style={{ borderTop: "1px solid var(--border-subtle)" }}>
                  <button
                    onClick={() => { setShowDropdown(false); logout(); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-rose-400 hover:text-rose-300 hover:bg-rose-500/[0.06] transition-all duration-200 cursor-pointer"
                  >
                    <LogOut size={15} />
                    Log out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Page title row */}
      {title && (
        <div className="px-6 pb-4 pt-1">
          <h2 className="text-xl font-bold tracking-tight text-heading truncate">{title}</h2>
          {subtitle && <p className="text-xs text-slate-500 mt-0.5 truncate">{subtitle}</p>}
        </div>
      )}
    </header>
  );
};

export default Header;
