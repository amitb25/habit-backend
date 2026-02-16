import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Video, Search } from "lucide-react";
import Header from "../components/Layout/Header";
import DataTable from "../components/common/DataTable";
import Modal from "../components/common/Modal";
import Pagination from "../components/common/Pagination";
import api from "../api/adminApi";
import toast from "react-hot-toast";

const LEVELS = ["beginner", "intermediate", "advanced"];
const levelColors = { beginner: "text-emerald-400 bg-emerald-500/15", intermediate: "text-amber-400 bg-amber-500/15", advanced: "text-red-400 bg-red-500/15" };

const ExercisesPage = () => {
  const [tab, setTab] = useState("exercises");
  const [categories, setCategories] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [pagination, setPagination] = useState({});
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("");
  const [filterLevel, setFilterLevel] = useState("");
  const [loading, setLoading] = useState(true);

  // Modals
  const [catModal, setCatModal] = useState(false);
  const [exModal, setExModal] = useState(false);
  const [editingCat, setEditingCat] = useState(null);
  const [editingEx, setEditingEx] = useState(null);

  // Forms
  const [catForm, setCatForm] = useState({ name: "", icon: "", color: "#3b82f6", sort_order: 0 });
  const [exForm, setExForm] = useState({ category_id: "", name: "", level: "beginner", sets: 3, reps: "", rest: "30s", tip: "", video_url: "", sort_order: 0 });

  const fetchCategories = async () => {
    const res = await api.get("/exercises/categories");
    setCategories(res.data.data);
  };

  const fetchExercises = async () => {
    setLoading(true);
    const params = { page, limit: 30 };
    if (search) params.search = search;
    if (filterCat) params.category_id = filterCat;
    if (filterLevel) params.level = filterLevel;
    const res = await api.get("/exercises", { params });
    setExercises(res.data.data);
    setPagination(res.data.pagination);
    setLoading(false);
  };

  useEffect(() => { fetchCategories(); }, []);
  useEffect(() => { fetchExercises(); }, [page, filterCat, filterLevel]);

  // Category CRUD
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

  const deleteCat = async (id) => {
    if (!confirm("Delete this category and all its exercises?")) return;
    try {
      await api.delete(`/exercises/categories/${id}`);
      toast.success("Deleted");
      fetchCategories();
      fetchExercises();
    } catch (err) { toast.error("Failed to delete"); }
  };

  // Exercise CRUD
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

  const deleteEx = async (e, id) => {
    e.stopPropagation();
    if (!confirm("Delete this exercise?")) return;
    try {
      await api.delete(`/exercises/${id}`);
      toast.success("Deleted");
      fetchExercises();
    } catch (err) { toast.error("Failed to delete"); }
  };

  // Video upload via Cloudinary widget
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
    { key: "name", label: "Name", render: (r) => <span className="font-medium">{r.name}</span> },
    { key: "category", label: "Category", render: (r) => (
      <span className="text-sm">{r.exercise_categories?.icon} {r.exercise_categories?.name}</span>
    )},
    { key: "level", label: "Level", render: (r) => (
      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${levelColors[r.level]}`}>{r.level}</span>
    )},
    { key: "sets", label: "Sets" },
    { key: "reps", label: "Reps" },
    { key: "rest", label: "Rest" },
    { key: "video", label: "Video", render: (r) => r.video_url ? <Video size={16} className="text-blue-400" /> : <span className="text-slate-600">-</span> },
    { key: "actions", label: "Actions", render: (r) => (
      <div className="flex gap-1">
        <button onClick={(e) => { e.stopPropagation(); openExModal(r); }} className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-blue-400/10 rounded-lg"><Pencil size={14} /></button>
        <button onClick={(e) => deleteEx(e, r.id)} className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg"><Trash2 size={14} /></button>
      </div>
    )},
  ];

  return (
    <>
      <Header title="Exercises" />
      <div className="p-6 space-y-4">
        {/* Tabs */}
        <div className="flex gap-2 border-b border-slate-700/50 pb-0">
          {["exercises", "categories"].map((t) => (
            <button key={t} onClick={() => setTab(t)} className={`px-4 py-2.5 text-sm font-medium capitalize border-b-2 transition-colors ${tab === t ? "text-blue-400 border-blue-400" : "text-slate-400 border-transparent hover:text-slate-200"}`}>
              {t}
            </button>
          ))}
        </div>

        {tab === "categories" && (
          <>
            <div className="flex justify-end">
              <button onClick={() => openCatModal()} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                <Plus size={16} /> Add Category
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((cat) => (
                <div key={cat.id} className="bg-slate-900/80 border border-slate-700/50 rounded-xl p-5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{cat.icon}</span>
                    <div>
                      <p className="text-white font-medium">{cat.name}</p>
                      <p className="text-xs text-slate-400">Order: {cat.sort_order}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => openCatModal(cat)} className="p-1.5 text-slate-400 hover:text-blue-400 rounded-lg"><Pencil size={14} /></button>
                    <button onClick={() => deleteCat(cat.id)} className="p-1.5 text-slate-400 hover:text-red-400 rounded-lg"><Trash2 size={14} /></button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {tab === "exercises" && (
          <>
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[200px] max-w-xs">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === "Enter" && fetchExercises()} placeholder="Search..." className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <select value={filterCat} onChange={(e) => { setFilterCat(e.target.value); setPage(1); }} className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none">
                <option value="">All Categories</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <select value={filterLevel} onChange={(e) => { setFilterLevel(e.target.value); setPage(1); }} className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none">
                <option value="">All Levels</option>
                {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
              <button onClick={() => openExModal()} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors ml-auto">
                <Plus size={16} /> Add Exercise
              </button>
            </div>

            {loading ? <p className="text-slate-400">Loading...</p> : (
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
          <div><label className="block text-sm text-slate-300 mb-1">Name</label><input value={catForm.name} onChange={(e) => setCatForm({ ...catForm, name: e.target.value })} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-sm text-slate-300 mb-1">Icon (emoji)</label><input value={catForm.icon} onChange={(e) => setCatForm({ ...catForm, icon: e.target.value })} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
            <div><label className="block text-sm text-slate-300 mb-1">Color</label><input type="color" value={catForm.color} onChange={(e) => setCatForm({ ...catForm, color: e.target.value })} className="w-full h-10 bg-slate-800 border border-slate-700 rounded-lg cursor-pointer" /></div>
          </div>
          <div><label className="block text-sm text-slate-300 mb-1">Sort Order</label><input type="number" value={catForm.sort_order} onChange={(e) => setCatForm({ ...catForm, sort_order: parseInt(e.target.value) })} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
          <button onClick={saveCat} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg text-sm font-medium transition-colors">Save</button>
        </div>
      </Modal>

      {/* Exercise Modal */}
      <Modal isOpen={exModal} onClose={() => setExModal(false)} title={editingEx ? "Edit Exercise" : "Add Exercise"} maxWidth="max-w-xl">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-sm text-slate-300 mb-1">Category</label><select value={exForm.category_id} onChange={(e) => setExForm({ ...exForm, category_id: e.target.value })} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none">{categories.map((c) => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}</select></div>
            <div><label className="block text-sm text-slate-300 mb-1">Level</label><select value={exForm.level} onChange={(e) => setExForm({ ...exForm, level: e.target.value })} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none">{LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}</select></div>
          </div>
          <div><label className="block text-sm text-slate-300 mb-1">Name</label><input value={exForm.name} onChange={(e) => setExForm({ ...exForm, name: e.target.value })} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
          <div className="grid grid-cols-3 gap-3">
            <div><label className="block text-sm text-slate-300 mb-1">Sets</label><input type="number" value={exForm.sets} onChange={(e) => setExForm({ ...exForm, sets: parseInt(e.target.value) })} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none" /></div>
            <div><label className="block text-sm text-slate-300 mb-1">Reps</label><input value={exForm.reps} onChange={(e) => setExForm({ ...exForm, reps: e.target.value })} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none" /></div>
            <div><label className="block text-sm text-slate-300 mb-1">Rest</label><input value={exForm.rest} onChange={(e) => setExForm({ ...exForm, rest: e.target.value })} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none" /></div>
          </div>
          <div><label className="block text-sm text-slate-300 mb-1">Tip</label><textarea value={exForm.tip} onChange={(e) => setExForm({ ...exForm, tip: e.target.value })} rows={2} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" /></div>
          <div>
            <label className="block text-sm text-slate-300 mb-1">Video URL</label>
            <div className="flex gap-2">
              <input value={exForm.video_url} onChange={(e) => setExForm({ ...exForm, video_url: e.target.value })} placeholder="Cloudinary URL" className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <button type="button" onClick={handleVideoUpload} className="bg-slate-700 hover:bg-slate-600 text-white px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-1"><Video size={14} /> Upload</button>
            </div>
          </div>
          <div><label className="block text-sm text-slate-300 mb-1">Sort Order</label><input type="number" value={exForm.sort_order} onChange={(e) => setExForm({ ...exForm, sort_order: parseInt(e.target.value) })} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none" /></div>
          <button onClick={saveEx} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg text-sm font-medium transition-colors">Save</button>
        </div>
      </Modal>
    </>
  );
};

export default ExercisesPage;
