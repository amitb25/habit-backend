import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, Search, Bell, Sun, MessageCircle, LayoutGrid, User, Settings, LogOut } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const Header = ({ title, subtitle, onMenuClick }) => {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <header
      className="sticky top-0 z-10"
      style={{
        background: "rgba(10,10,26,0.9)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(255,255,255,0.04)",
      }}
    >
      {/* Top bar with search + icons */}
      <div className="px-6 py-3 flex items-center gap-6">
        {/* Mobile hamburger */}
        {onMenuClick && (
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-xl text-slate-500 hover:text-white transition-all duration-200 shrink-0"
            style={{ background: "#111128", border: "1px solid rgba(255,255,255,0.06)" }}
          >
            <Menu size={18} />
          </button>
        )}

        {/* Search Bar - wide pill shape like KORA */}
        <div className="hidden md:block flex-1 max-w-2xl">
          <div
            className="relative flex items-center w-full rounded-full px-5 py-3"
            style={{
              background: "#111128",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <Search size={16} className="text-slate-600 shrink-0" />
            <input
              type="text"
              placeholder="Type to search..."
              className="flex-1 bg-transparent border-none outline-none text-sm text-slate-300 placeholder-slate-600 ml-3"
            />
            <span
              className="shrink-0 text-[11px] font-medium text-slate-500 px-2 py-1 rounded-lg"
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              ⌘K
            </span>
          </div>
        </div>

        {/* Right side icons */}
        <div className="flex items-center gap-3 shrink-0 ml-auto">
          <button className="p-2 text-amber-400 hover:text-amber-300 transition-colors" title="Theme">
            <Sun size={18} />
          </button>
          <button className="p-2 text-slate-500 hover:text-white transition-colors" title="Messages">
            <MessageCircle size={18} />
          </button>
          <button className="p-2 text-slate-500 hover:text-white transition-colors" title="Apps">
            <LayoutGrid size={18} />
          </button>
          <button className="relative p-2 text-slate-500 hover:text-white transition-colors" title="Notifications">
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
                  background: "#141432",
                  border: "1px solid rgba(255,255,255,0.08)",
                  boxShadow: "0 12px 48px rgba(0,0,0,0.6)",
                }}
              >
                {/* User info */}
                <div className="px-4 py-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                  <p className="text-sm font-semibold text-white truncate">{admin?.name || "Admin"}</p>
                  <p className="text-xs text-slate-500 truncate mt-0.5">{admin?.email || "admin@lifestack.com"}</p>
                </div>

                {/* Menu items */}
                <div className="py-1">
                  <button
                    onClick={() => { setShowDropdown(false); navigate("/admin/settings"); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-400 hover:text-white hover:bg-white/[0.04] transition-all duration-200"
                  >
                    <User size={15} />
                    Profile
                  </button>
                  <button
                    onClick={() => { setShowDropdown(false); navigate("/admin/settings"); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-400 hover:text-white hover:bg-white/[0.04] transition-all duration-200"
                  >
                    <Settings size={15} />
                    Settings
                  </button>
                </div>

                <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                  <button
                    onClick={() => { setShowDropdown(false); logout(); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-rose-400 hover:text-rose-300 hover:bg-rose-500/[0.06] transition-all duration-200"
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
          <h2 className="text-xl font-bold tracking-tight text-white truncate">{title}</h2>
          {subtitle && <p className="text-xs text-slate-500 mt-0.5 truncate">{subtitle}</p>}
        </div>
      )}
    </header>
  );
};

export default Header;
