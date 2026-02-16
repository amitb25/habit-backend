import { useState, useEffect } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { Search, Ban, Trash2 } from "lucide-react";
import Header from "../components/Layout/Header";
import DataTable from "../components/common/DataTable";
import Pagination from "../components/common/Pagination";
import Loader from "../components/common/Loader";
import api from "../api/adminApi";
import toast from "react-hot-toast";

const UsersPage = () => {
  const { onMenuClick } = useOutletContext();
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get("/users", { params: { search, page, limit: 20 } });
      setUsers(res.data.data);
      setPagination(res.data.pagination);
    } catch (err) {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, [page]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  const handleBlock = async (e, user) => {
    e.stopPropagation();
    try {
      const res = await api.put(`/users/${user.id}/block`);
      toast.success(res.data.message);
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, is_blocked: !u.is_blocked } : u));
    } catch (err) {
      toast.error("Failed to update user");
    }
  };

  const handleDelete = async (e, user) => {
    e.stopPropagation();
    if (!confirm(`Delete ${user.name}? This cannot be undone.`)) return;
    try {
      await api.delete(`/users/${user.id}`);
      toast.success("User deleted");
      setUsers(prev => prev.filter(u => u.id !== user.id));
    } catch (err) {
      toast.error("Failed to delete user");
    }
  };

  const columns = [
    { key: "name", label: "Name", render: (row) => (
      <div className="flex items-center gap-3">
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
          style={{
            background: "linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.15))",
            color: "#818cf8",
            boxShadow: "0 0 0 2px rgba(99,102,241,0.12)",
          }}
        >
          {row.name?.charAt(0)?.toUpperCase()}
        </div>
        <span className="font-semibold text-white">{row.name}</span>
      </div>
    )},
    { key: "email", label: "Email" },
    { key: "level", label: "Level", render: (row) => <span className="text-amber-400 font-bold">Lvl {row.level || 1}</span> },
    { key: "xp", label: "XP", render: (row) => <span className="text-emerald-400 font-bold">{row.xp || 0}</span> },
    { key: "app_streak", label: "Streak", render: (row) => <span className="text-slate-400">{row.app_streak || 0}d</span> },
    { key: "status", label: "Status", render: (row) => (
      <span className={row.is_blocked ? "badge badge-danger" : "badge badge-success"}>
        {row.is_blocked ? "Blocked" : "Active"}
      </span>
    )},
    { key: "actions", label: "Actions", render: (row) => (
      <div className="flex items-center gap-1">
        <button
          onClick={(e) => handleBlock(e, row)}
          className={`p-2 rounded-xl transition-all duration-200 ${
            row.is_blocked
              ? "text-emerald-400 hover:bg-emerald-400/10"
              : "text-amber-400 hover:bg-amber-400/10"
          }`}
          title={row.is_blocked ? "Unblock" : "Block"}
        >
          <Ban size={15} />
        </button>
        <button
          onClick={(e) => handleDelete(e, row)}
          className="p-2 rounded-xl text-rose-400 hover:bg-rose-400/10 transition-all duration-200"
          title="Delete"
        >
          <Trash2 size={15} />
        </button>
      </div>
    )},
  ];

  return (
    <>
      <Header title="Users" subtitle="Manage all registered users" onMenuClick={onMenuClick} />
      <div className="p-6 space-y-5 animate-slideUp">
        <form onSubmit={handleSearch} className="flex gap-3">
          <div
            className="flex items-center flex-1 max-w-xl rounded-full px-5 py-3"
            style={{ background: "#111128", border: "1px solid rgba(255,255,255,0.06)" }}
          >
            <Search size={16} className="text-slate-600 shrink-0" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search users by name or email..."
              className="flex-1 bg-transparent border-none outline-none text-sm text-slate-300 placeholder-slate-600 ml-3"
            />
            <button type="submit" className="shrink-0 text-[11px] font-medium text-slate-500 px-2.5 py-1 rounded-lg hover:text-white transition-colors" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}>
              Search
            </button>
          </div>
        </form>

        {loading ? (
          <Loader size={150} text="Loading Users..." />
        ) : (
          <>
            <DataTable
              columns={columns}
              data={users}
              onRowClick={(row) => navigate(`/admin/users/${row.id}`)}
            />
            <Pagination page={pagination.page} pages={pagination.pages} total={pagination.total} onPageChange={setPage} />
          </>
        )}
      </div>
    </>
  );
};

export default UsersPage;
