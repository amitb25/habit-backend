import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Ban, Trash2 } from "lucide-react";
import Header from "../components/Layout/Header";
import DataTable from "../components/common/DataTable";
import Pagination from "../components/common/Pagination";
import api from "../api/adminApi";
import toast from "react-hot-toast";

const UsersPage = () => {
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
        <div className="w-8 h-8 rounded-full bg-blue-600/20 flex items-center justify-center text-blue-400 text-xs font-bold">
          {row.name?.charAt(0)?.toUpperCase()}
        </div>
        <span className="font-medium">{row.name}</span>
      </div>
    )},
    { key: "email", label: "Email" },
    { key: "level", label: "Level", render: (row) => <span className="text-amber-400">Lvl {row.level || 1}</span> },
    { key: "xp", label: "XP", render: (row) => <span className="text-emerald-400">{row.xp || 0}</span> },
    { key: "app_streak", label: "Streak", render: (row) => `${row.app_streak || 0}d` },
    { key: "status", label: "Status", render: (row) => (
      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${row.is_blocked ? "bg-red-500/15 text-red-400" : "bg-emerald-500/15 text-emerald-400"}`}>
        {row.is_blocked ? "Blocked" : "Active"}
      </span>
    )},
    { key: "actions", label: "Actions", render: (row) => (
      <div className="flex items-center gap-2">
        <button onClick={(e) => handleBlock(e, row)} className={`p-1.5 rounded-lg transition-colors ${row.is_blocked ? "text-emerald-400 hover:bg-emerald-400/10" : "text-amber-400 hover:bg-amber-400/10"}`} title={row.is_blocked ? "Unblock" : "Block"}>
          <Ban size={15} />
        </button>
        <button onClick={(e) => handleDelete(e, row)} className="p-1.5 rounded-lg text-red-400 hover:bg-red-400/10 transition-colors" title="Delete">
          <Trash2 size={15} />
        </button>
      </div>
    )},
  ];

  return (
    <>
      <Header title="Users" />
      <div className="p-6 space-y-4">
        <form onSubmit={handleSearch} className="flex gap-3">
          <div className="relative flex-1 max-w-md">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search users..."
              className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors">
            Search
          </button>
        </form>

        {loading ? <p className="text-slate-400">Loading...</p> : (
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
