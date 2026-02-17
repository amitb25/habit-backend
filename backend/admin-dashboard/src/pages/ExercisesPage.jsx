import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { Plus, Pencil, Trash2, Video, Search, X, Play } from "lucide-react";
import Header from "../components/Layout/Header";
import DataTable from "../components/common/DataTable";
import Modal from "../components/common/Modal";
import Pagination from "../components/common/Pagination";
import Loader from "../components/common/Loader";
import ConfirmDialog from "../components/common/ConfirmDialog";
import api from "../api/adminApi";
import toast from "react-hot-toast";

const LEVELS = ["beginner", "intermediate", "advanced"];
const levelColors = {
  beginner: { color: "#34d399", bg: "rgba(16,185,129,0.12)", border: "rgba(16,185,129,0.15)" },
  intermediate: { color: "#fbbf24", bg: "rgba(245,158,11,0.12)", border: "rgba(245,158,11,0.15)" },
  advanced: { color: "#f87171", bg: "rgba(239,68,68,0.12)", border: "rgba(239,68,68,0.15)" },
};

const ExercisesPage = () => {
  const { onMenuClick } = useOutletContext();
  const [tab, setTab] = useState("categories");
  const [categories, setCategories] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [pagination, setPagination] = useState({});
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("");
  const [filterLevel, setFilterLevel] = useState("");
  const [loading, setLoading] = useState(true);

  const [catModal, setCatModal] = useState(false);
  const [exModal, setExModal] = useState(false);
  const [editingCat, setEditingCat] = useState(null);
  const [editingEx, setEditingEx] = useState(null);

  const [videoPreview, setVideoPreview] = useState(null);
  const [catForm, setCatForm] = useState({ name: "", icon: "", color: "#3b82f6", sort_order: 0 });
  const [exForm, setExForm] = useState({ category_id: "", name: "", level: "beginner", sets: 3, reps: "", rest: "30s", tip: "", video_url: "", sort_order: 0 });

  // Confirm dialog
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchCategories = async () => {
    try {
      const res = await api.get("/exercises/categories");
      setCategories(res.data.data);
    } catch (err) { toast.error("Failed to load categories"); }
  };

  const fetchExercises = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 30 };
      if (search) params.search = search;
      if (filterCat) params.category_id = filterCat;
      if (filterLevel) params.level = filterLevel;
      const res = await api.get("/exercises", { params });
      setExercises(res.data.data);
      setPagination(res.data.pagination);
    } catch (err) { toast.error("Failed to load exercises"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchCategories(); }, []);
  useEffect(() => { fetchExercises(); }, [page, search, filterCat, filterLevel]);

  const openCatModal = (cat = null) => {
    setEditingCat(cat);
    setCatForm(cat ? { name: cat.name, icon: cat.icon, color: cat.color, sort_order: cat.sort_order } : { name: "", icon: "", color: "#3b82f6", sort_order: 0 });
    setCatModal(true);
  };

  const saveCat = async () => {
    try {
      if (editingCat) await api.put(`/exercises/categories/${editingCat.id}`, catForm);
      else await api.post("/exercises/categories", catForm);
      toast.success(editingCat ? "Category updated" : "Category created");
      setCatModal(false);
      fetchCategories();
    } catch (err) { toast.error(err.response?.data?.message || "Failed"); }
  };

  const askDeleteCat = (cat) => {
    setDeleteTarget({ type: "cat", id: cat.id, name: cat.name });
    setConfirmOpen(true);
  };

  const openExModal = (ex = null) => {
    setEditingEx(ex);
    setExForm(ex ? { category_id: ex.category_id, name: ex.name, level: ex.level, sets: ex.sets, reps: ex.reps, rest: ex.rest, tip: ex.tip || "", video_url: ex.video_url || "", sort_order: ex.sort_order } : { category_id: categories[0]?.id || "", name: "", level: "beginner", sets: 3, reps: "", rest: "30s", tip: "", video_url: "", sort_order: 0 });
    setExModal(true);
  };

  const saveEx = async () => {
    try {
      if (editingEx) await api.put(`/exercises/${editingEx.id}`, exForm);
      else await api.post("/exercises", exForm);
      toast.success(editingEx ? "Exercise updated" : "Exercise created");
      setExModal(false);
      fetchExercises();
    } catch (err) { toast.error(err.response?.data?.message || "Failed"); }
  };

  const askDeleteEx = (e, ex) => {
    e.stopPropagation();
    setDeleteTarget({ type: "ex", id: ex.id, name: ex.name });
    setConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      if (deleteTarget.type === "cat") {
        await api.delete(`/exercises/categories/${deleteTarget.id}`);
        toast.success(`Category "${deleteTarget.name}" deleted successfully`);
        fetchCategories();
        fetchExercises();
      } else {
        await api.delete(`/exercises/${deleteTarget.id}`);
        toast.success(`Exercise "${deleteTarget.name}" deleted successfully`);
        fetchExercises();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete");
    }
    setConfirmOpen(false);
    setDeleteTarget(null);
  };

  const handleVideoUpload = () => {
    const widget = window.cloudinary?.createUploadWidget(
      { cloudName: "dju2e6ctq", uploadPreset: "habit_tracker", folder: "exercises", resourceType: "video", maxFiles: 1 },
      (error, result) => {
        if (result?.event === "success") {
          setExForm((f) => ({ ...f, video_url: result.info.secure_url }));
          toast.success("Video uploaded!");
        }
      }
    );
    widget?.open();
  };

  const exColumns = [
    { key: "name", label: "Name", render: (r) => <span className="font-semibold text-heading">{r.name}</span> },
    { key: "category", label: "Category", render: (r) => (
      <span className="text-sm text-body">{r.exercise_categories?.icon} {r.exercise_categories?.name}</span>
    )},
    { key: "level", label: "Level", render: (r) => {
      const lc = levelColors[r.level] || {};
      return (
        <span className="badge" style={{ color: lc.color, background: lc.bg, border: `1px solid ${lc.border}` }}>
          {r.level}
        </span>
      );
    }},
    { key: "sets", label: "Sets" },
    { key: "reps", label: "Reps" },
    { key: "rest", label: "Rest" },
    { key: "video", label: "Video", render: (r) => r.video_url ? (
      <button onClick={(e) => { e.stopPropagation(); setVideoPreview({ url: r.video_url, name: r.name }); }} className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-400/10 rounded-xl transition-all duration-200 cursor-pointer" title="Play video">
        <Play size={16} />
      </button>
    ) : <span className="text-slate-600">-</span> },
    { key: "actions", label: "Actions", render: (r) => (
      <div className="flex gap-1">
        <button onClick={(e) => { e.stopPropagation(); openExModal(r); }} className="p-2 text-slate-500 hover:text-blue-400 hover:bg-blue-400/10 rounded-xl transition-all duration-200 cursor-pointer"><Pencil size={14} /></button>
        <button onClick={(e) => askDeleteEx(e, r)} className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-400/10 rounded-xl transition-all duration-200 cursor-pointer"><Trash2 size={14} /></button>
      </div>
    )},
  ];

  return (
    <>
      <Header title="Exercises" subtitle="Manage exercises & categories" onMenuClick={onMenuClick} />
      <div className="p-6 space-y-5 animate-slideUp">
        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-xl w-fit" style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-subtle)" }}>
          {["categories", "exercises"].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-2 text-sm font-medium capitalize transition-all duration-200 rounded-lg cursor-pointer ${
                tab === t ? "text-white" : "text-slate-500 hover-text-body"
              }`}
              style={tab === t ? { background: "linear-gradient(135deg, #6366f1, #7c3aed)", boxShadow: "0 2px 10px rgba(99,102,241,0.25)" } : {}}
            >
              {t}
            </button>
          ))}
        </div>

        {tab === "categories" && (
          <>
            <div className="flex justify-end">
              <button onClick={() => openCatModal()} className="flex items-center gap-2 btn-primary px-4 py-2.5 text-sm font-medium">
                <Plus size={16} /> Add Category
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  className="rounded-2xl p-5 flex items-center justify-between transition-all duration-200 hover:-translate-y-0.5"
                  style={{
                    background: "var(--bg-card)",
                    border: "1px solid var(--border-subtle)",
                    borderLeft: `3px solid ${cat.color}`,
                    boxShadow: "var(--shadow-sm)",
                  }}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{cat.icon}</span>
                    <div>
                      <p className="text-heading font-semibold">{cat.name}</p>
                      <p className="text-[10px] uppercase tracking-[0.15em] text-slate-600">Order: {cat.sort_order}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => openCatModal(cat)} className="p-2 text-slate-500 hover:text-blue-400 hover:bg-blue-400/10 rounded-xl transition-all duration-200 cursor-pointer"><Pencil size={14} /></button>
                    <button onClick={() => askDeleteCat(cat)} className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-400/10 rounded-xl transition-all duration-200 cursor-pointer"><Trash2 size={14} /></button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {tab === "exercises" && (
          <>
            <div className="flex flex-wrap items-center gap-3">
              <div
                className="flex items-center flex-1 min-w-[200px] max-w-md rounded-full px-5 py-3"
                style={{ background: "var(--bg-card)", border: "1px solid var(--border-subtle)" }}
              >
                <Search size={16} className="text-slate-600 shrink-0" />
                <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search exercises..." className="flex-1 bg-transparent border-none outline-none text-sm text-body placeholder-slate-600 ml-3" />
              </div>
              <select value={filterCat} onChange={(e) => { setFilterCat(e.target.value); setPage(1); }} className="input-dark rounded-xl px-3 py-2.5 text-sm cursor-pointer">
                <option value="">All Categories</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <select value={filterLevel} onChange={(e) => { setFilterLevel(e.target.value); setPage(1); }} className="input-dark rounded-xl px-3 py-2.5 text-sm cursor-pointer">
                <option value="">All Levels</option>
                {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
              <button onClick={() => openExModal()} className="flex items-center gap-2 btn-primary px-4 py-2.5 text-sm font-medium ml-auto">
                <Plus size={16} /> Add Exercise
              </button>
            </div>

            {loading ? (
              <Loader size={150} text="Loading Exercises..." />
            ) : (
              <>
                <DataTable columns={exColumns} data={exercises} />
                <Pagination page={pagination.page} pages={pagination.pages} total={pagination.total} onPageChange={setPage} />
              </>
            )}
          </>
        )}
      </div>

      {/* Category Modal */}
      <Modal isOpen={catModal} onClose={() => setCatModal(false)} title={editingCat ? "Edit Category" : "Add Category"}>
        <div className="space-y-4">
          <div><label className="block text-[10px] uppercase tracking-[0.15em] text-slate-500 font-bold mb-2">Name</label><input value={catForm.name} onChange={(e) => setCatForm({ ...catForm, name: e.target.value })} className="w-full input-dark rounded-xl px-3 py-2.5 text-sm" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-[10px] uppercase tracking-[0.15em] text-slate-500 font-bold mb-2">Icon (emoji)</label><input value={catForm.icon} onChange={(e) => setCatForm({ ...catForm, icon: e.target.value })} className="w-full input-dark rounded-xl px-3 py-2.5 text-sm" /></div>
            <div><label className="block text-[10px] uppercase tracking-[0.15em] text-slate-500 font-bold mb-2">Color</label><input type="color" value={catForm.color} onChange={(e) => setCatForm({ ...catForm, color: e.target.value })} className="w-full h-11 input-dark rounded-xl cursor-pointer" /></div>
          </div>
          <div><label className="block text-[10px] uppercase tracking-[0.15em] text-slate-500 font-bold mb-2">Sort Order</label><input type="number" value={catForm.sort_order} onChange={(e) => setCatForm({ ...catForm, sort_order: parseInt(e.target.value) })} className="w-full input-dark rounded-xl px-3 py-2.5 text-sm" /></div>
          <button onClick={saveCat} className="w-full btn-primary py-2.5 text-sm font-bold">Save Category</button>
        </div>
      </Modal>

      {/* Exercise Modal */}
      <Modal isOpen={exModal} onClose={() => setExModal(false)} title={editingEx ? "Edit Exercise" : "Add Exercise"} maxWidth="max-w-xl">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-[10px] uppercase tracking-[0.15em] text-slate-500 font-bold mb-2">Category</label><select value={exForm.category_id} onChange={(e) => setExForm({ ...exForm, category_id: e.target.value })} className="w-full input-dark rounded-xl px-3 py-2.5 text-sm cursor-pointer">{categories.map((c) => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}</select></div>
            <div><label className="block text-[10px] uppercase tracking-[0.15em] text-slate-500 font-bold mb-2">Level</label><select value={exForm.level} onChange={(e) => setExForm({ ...exForm, level: e.target.value })} className="w-full input-dark rounded-xl px-3 py-2.5 text-sm cursor-pointer">{LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}</select></div>
          </div>
          <div><label className="block text-[10px] uppercase tracking-[0.15em] text-slate-500 font-bold mb-2">Name</label><input value={exForm.name} onChange={(e) => setExForm({ ...exForm, name: e.target.value })} className="w-full input-dark rounded-xl px-3 py-2.5 text-sm" /></div>
          <div className="grid grid-cols-3 gap-3">
            <div><label className="block text-[10px] uppercase tracking-[0.15em] text-slate-500 font-bold mb-2">Sets</label><input type="number" value={exForm.sets} onChange={(e) => setExForm({ ...exForm, sets: parseInt(e.target.value) })} className="w-full input-dark rounded-xl px-3 py-2.5 text-sm" /></div>
            <div><label className="block text-[10px] uppercase tracking-[0.15em] text-slate-500 font-bold mb-2">Reps</label><input value={exForm.reps} onChange={(e) => setExForm({ ...exForm, reps: e.target.value })} className="w-full input-dark rounded-xl px-3 py-2.5 text-sm" /></div>
            <div><label className="block text-[10px] uppercase tracking-[0.15em] text-slate-500 font-bold mb-2">Rest</label><input value={exForm.rest} onChange={(e) => setExForm({ ...exForm, rest: e.target.value })} className="w-full input-dark rounded-xl px-3 py-2.5 text-sm" /></div>
          </div>
          <div><label className="block text-[10px] uppercase tracking-[0.15em] text-slate-500 font-bold mb-2">Tip</label><textarea value={exForm.tip} onChange={(e) => setExForm({ ...exForm, tip: e.target.value })} rows={2} className="w-full input-dark rounded-xl px-3 py-2.5 text-sm resize-none" /></div>
          <div>
            <label className="block text-[10px] uppercase tracking-[0.15em] text-slate-500 font-bold mb-2">Video URL</label>
            <div className="flex gap-2">
              <input value={exForm.video_url} onChange={(e) => setExForm({ ...exForm, video_url: e.target.value })} placeholder="Cloudinary URL" className="flex-1 input-dark rounded-xl px-3 py-2.5 text-sm" />
              <button type="button" onClick={handleVideoUpload} className="btn-secondary px-3 py-2.5 text-sm flex items-center gap-1.5"><Video size={14} /> Upload</button>
            </div>
          </div>
          <div><label className="block text-[10px] uppercase tracking-[0.15em] text-slate-500 font-bold mb-2">Sort Order</label><input type="number" value={exForm.sort_order} onChange={(e) => setExForm({ ...exForm, sort_order: parseInt(e.target.value) })} className="w-full input-dark rounded-xl px-3 py-2.5 text-sm" /></div>
          <button onClick={saveEx} className="w-full btn-primary py-2.5 text-sm font-bold">Save Exercise</button>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={confirmOpen}
        onClose={() => { setConfirmOpen(false); setDeleteTarget(null); }}
        onConfirm={handleConfirmDelete}
        variant="delete"
        title={
          deleteTarget?.type === "cat"
            ? `Delete category "${deleteTarget?.name}"?`
            : `Delete exercise "${deleteTarget?.name}"?`
        }
        message={
          deleteTarget?.type === "cat"
            ? "This will delete the category and all exercises in it. This cannot be undone."
            : "This exercise will be permanently deleted."
        }
        confirmText={deleteTarget?.type === "cat" ? "Delete Category" : "Delete Exercise"}
      />

      {/* Video Preview Modal */}
      {videoPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: "var(--bg-overlay)" }}>
          <div className="relative w-full max-w-3xl mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-heading font-bold text-lg">{videoPreview.name}</h3>
              <button
                onClick={() => setVideoPreview(null)}
                className="p-2 text-slate-400 hover-text-heading hover-bg-subtle rounded-xl transition-all duration-200 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>
            <div className="rounded-2xl overflow-hidden" style={{ background: "#000", border: "1px solid var(--border-medium)" }}>
              <video
                src={videoPreview.url}
                controls
                autoPlay
                loop
                className="w-full"
                style={{ maxHeight: "70vh" }}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ExercisesPage;
