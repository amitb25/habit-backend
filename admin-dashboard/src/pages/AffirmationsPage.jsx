import { useState, useEffect } from "react";
import { Trash2 } from "lucide-react";
import Header from "../components/Layout/Header";
import DataTable from "../components/common/DataTable";
import Pagination from "../components/common/Pagination";
import api from "../api/adminApi";
import toast from "react-hot-toast";

const AffirmationsPage = () => {
  const [affirmations, setAffirmations] = useState([]);
  const [pagination, setPagination] = useState({});
  const [page, setPage] = useState(1);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [loading, setLoading] = useState(true);

  const categories = ["confidence", "career", "wealth", "health", "gratitude", "discipline", "desi", "personal"];

  const fetchData = async () => {
    setLoading(true);
    const params = { page, limit: 20 };
    if (categoryFilter) params.category = categoryFilter;
    try {
      const res = await api.get("/affirmations", { params });
      setAffirmations(res.data.data);
      setPagination(res.data.pagination);
    } catch (err) {}
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [page, categoryFilter]);

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!confirm("Delete this affirmation?")) return;
    try {
      await api.delete(`/affirmations/${id}`);
      toast.success("Deleted");
      fetchData();
    } catch (err) { toast.error("Failed to delete"); }
  };

  const columns = [
    { key: "text", label: "Affirmation", render: (r) => <span className="font-medium max-w-md truncate block">{r.text}</span> },
    { key: "user", label: "User", render: (r) => r.profiles?.name || "-" },
    { key: "category", label: "Category", render: (r) => <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-purple-500/15 text-purple-400">{r.category}</span> },
    { key: "is_favorite", label: "Fav", render: (r) => r.is_favorite ? "Yes" : "-" },
    { key: "actions", label: "", render: (r) => (
      <button onClick={(e) => handleDelete(e, r.id)} className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg"><Trash2 size={14} /></button>
    )},
  ];

  return (
    <>
      <Header title="Affirmations" />
      <div className="p-6 space-y-4">
        <select value={categoryFilter} onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }} className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none">
          <option value="">All Categories</option>
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>

        {loading ? <p className="text-slate-400">Loading...</p> : (
          <>
            <DataTable columns={columns} data={affirmations} />
            <Pagination page={pagination.page} pages={pagination.pages} total={pagination.total} onPageChange={setPage} />
          </>
        )}
      </div>
    </>
  );
};

export default AffirmationsPage;
