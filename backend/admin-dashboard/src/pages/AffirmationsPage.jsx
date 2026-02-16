import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { Trash2 } from "lucide-react";
import Header from "../components/Layout/Header";
import DataTable from "../components/common/DataTable";
import Pagination from "../components/common/Pagination";
import Loader from "../components/common/Loader";
import api from "../api/adminApi";
import toast from "react-hot-toast";

const categoryColors = {
  confidence: { color: "#60a5fa", bg: "rgba(59,130,246,0.12)", border: "rgba(59,130,246,0.15)" },
  career: { color: "#a78bfa", bg: "rgba(139,92,246,0.12)", border: "rgba(139,92,246,0.15)" },
  wealth: { color: "#fbbf24", bg: "rgba(245,158,11,0.12)", border: "rgba(245,158,11,0.15)" },
  health: { color: "#34d399", bg: "rgba(16,185,129,0.12)", border: "rgba(16,185,129,0.15)" },
  gratitude: { color: "#f472b6", bg: "rgba(236,72,153,0.12)", border: "rgba(236,72,153,0.15)" },
  discipline: { color: "#f87171", bg: "rgba(239,68,68,0.12)", border: "rgba(239,68,68,0.15)" },
  desi: { color: "#fb923c", bg: "rgba(249,115,22,0.12)", border: "rgba(249,115,22,0.15)" },
  personal: { color: "#22d3ee", bg: "rgba(6,182,212,0.12)", border: "rgba(6,182,212,0.15)" },
};

const AffirmationsPage = () => {
  const { onMenuClick } = useOutletContext();
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
    { key: "text", label: "Affirmation", render: (r) => <span className="font-semibold text-white max-w-md truncate block">{r.text}</span> },
    { key: "user", label: "User", render: (r) => r.profiles?.name || "-" },
    { key: "category", label: "Category", render: (r) => {
      const cc = categoryColors[r.category] || { color: "#a78bfa", bg: "rgba(139,92,246,0.12)", border: "rgba(139,92,246,0.15)" };
      return (
        <span className="badge" style={{ color: cc.color, background: cc.bg, border: `1px solid ${cc.border}` }}>
          {r.category}
        </span>
      );
    }},
    { key: "is_favorite", label: "Fav", render: (r) => r.is_favorite ? <span className="text-amber-400 font-semibold">Yes</span> : <span className="text-slate-600">-</span> },
    { key: "actions", label: "", render: (r) => (
      <button onClick={(e) => handleDelete(e, r.id)} className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-400/10 rounded-xl transition-all duration-200"><Trash2 size={14} /></button>
    )},
  ];

  return (
    <>
      <Header title="Affirmations" subtitle="User affirmations by category" onMenuClick={onMenuClick} />
      <div className="p-6 space-y-5 animate-slideUp">
        {/* Category filter pills */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => { setCategoryFilter(""); setPage(1); }}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
              !categoryFilter ? "text-white" : "text-slate-500 hover:text-slate-300"
            }`}
            style={!categoryFilter
              ? { background: "linear-gradient(135deg, #6366f1, #7c3aed)", boxShadow: "0 2px 10px rgba(99,102,241,0.25)" }
              : { background: "#111128", border: "1px solid rgba(255,255,255,0.06)" }
            }
          >
            All
          </button>
          {categories.map((c) => {
            const cc = categoryColors[c] || {};
            return (
              <button
                key={c}
                onClick={() => { setCategoryFilter(c); setPage(1); }}
                className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all duration-200 ${
                  categoryFilter === c ? "" : "text-slate-500 hover:text-slate-300"
                }`}
                style={categoryFilter === c
                  ? { background: cc.bg, border: `1px solid ${cc.border}`, color: cc.color }
                  : { background: "#111128", border: "1px solid rgba(255,255,255,0.06)" }
                }
              >
                {c}
              </button>
            );
          })}
        </div>

        {loading ? (
          <Loader size={150} text="Loading Affirmations..." />
        ) : (
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
