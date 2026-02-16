import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import Header from "../components/Layout/Header";
import Modal from "../components/common/Modal";
import api from "../api/adminApi";
import toast from "react-hot-toast";

const LEVELS = ["beginner", "intermediate", "advanced"];
const levelColors = { beginner: "bg-emerald-500/15 text-emerald-400", intermediate: "bg-amber-500/15 text-amber-400", advanced: "bg-red-500/15 text-red-400" };

const WorkoutsPage = () => {
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: "", level: "beginner", duration: "20 min", icon: "", color: "#3b82f6", sort_order: 0, exercises: [] });
  const [exName, setExName] = useState("");
  const [exSets, setExSets] = useState(3);
  const [exReps, setExReps] = useState("");
  const [exRest, setExRest] = useState("30s");

  const fetchWorkouts = async () => {
    setLoading(true);
    try {
      const res = await api.get("/workouts");
      setWorkouts(res.data.data);
    } catch (err) { toast.error("Failed to load workouts"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchWorkouts(); }, []);

  const openModal = (w = null) => {
    setEditing(w);
    setForm(w ? { name: w.name, level: w.level, duration: w.duration, icon: w.icon, color: w.color, sort_order: w.sort_order, exercises: w.exercises.map((e) => ({ name: e.exercise_name, sets: e.sets, reps: e.reps, rest: e.rest })) } : { name: "", level: "beginner", duration: "20 min", icon: "", color: "#3b82f6", sort_order: 0, exercises: [] });
    setModal(true);
  };

  const addExercise = () => {
    if (!exName || !exReps) return;
    setForm({ ...form, exercises: [...form.exercises, { name: exName, sets: exSets, reps: exReps, rest: exRest }] });
    setExName(""); setExReps("");
  };

  const removeExercise = (idx) => {
    setForm({ ...form, exercises: form.exercises.filter((_, i) => i !== idx) });
  };

  const saveWorkout = async () => {
    try {
      const payload = { ...form, exercises: form.exercises.map((e, i) => ({ exercise_name: e.name, sets: e.sets, reps: e.reps, rest: e.rest, sort_order: i + 1 })) };
      if (editing) await api.put(`/workouts/${editing.id}`, payload);
      else await api.post("/workouts", payload);
      toast.success(editing ? "Updated" : "Created");
      setModal(false);
      fetchWorkouts();
    } catch (err) { toast.error(err.response?.data?.message || "Failed"); }
  };

  const deleteWorkout = async (id) => {
    if (!confirm("Delete this workout plan?")) return;
    try {
      await api.delete(`/workouts/${id}`);
      toast.success("Deleted");
      fetchWorkouts();
    } catch (err) { toast.error("Failed to delete"); }
  };

  return (
    <>
      <Header title="Workout Plans" />
      <div className="p-6 space-y-4">
        <div className="flex justify-end">
          <button onClick={() => openModal()} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            <Plus size={16} /> Add Workout Plan
          </button>
        </div>

        {loading ? <p className="text-slate-400">Loading...</p> : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {workouts.map((w) => (
              <div key={w.id} className="bg-slate-900/80 border border-slate-700/50 rounded-xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{w.icon}</span>
                    <div>
                      <h3 className="text-white font-semibold">{w.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${levelColors[w.level]}`}>{w.level}</span>
                        <span className="text-xs text-slate-400">{w.duration}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => openModal(w)} className="p-1.5 text-slate-400 hover:text-blue-400 rounded-lg"><Pencil size={14} /></button>
                    <button onClick={() => deleteWorkout(w.id)} className="p-1.5 text-slate-400 hover:text-red-400 rounded-lg"><Trash2 size={14} /></button>
                  </div>
                </div>
                <div className="space-y-1.5">
                  {w.exercises.map((ex, idx) => (
                    <div key={idx} className="flex justify-between text-sm text-slate-400">
                      <span>{ex.exercise_name}</span>
                      <span className="text-xs">{ex.sets}x{ex.reps}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal isOpen={modal} onClose={() => setModal(false)} title={editing ? "Edit Workout" : "Add Workout"} maxWidth="max-w-xl">
        <div className="space-y-4">
          <div><label className="block text-sm text-slate-300 mb-1">Name</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
          <div className="grid grid-cols-3 gap-3">
            <div><label className="block text-sm text-slate-300 mb-1">Level</label><select value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none">{LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}</select></div>
            <div><label className="block text-sm text-slate-300 mb-1">Duration</label><input value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none" /></div>
            <div><label className="block text-sm text-slate-300 mb-1">Icon (emoji)</label><input value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none" /></div>
          </div>

          <div>
            <label className="block text-sm text-slate-300 mb-2">Exercises</label>
            <div className="space-y-2 mb-3">
              {form.exercises.map((ex, idx) => (
                <div key={idx} className="flex items-center justify-between bg-slate-800 rounded-lg px-3 py-2">
                  <span className="text-sm text-white">{ex.name} <span className="text-slate-400">({ex.sets}x{ex.reps}, rest {ex.rest})</span></span>
                  <button onClick={() => removeExercise(idx)} className="text-red-400 hover:text-red-300"><Trash2 size={14} /></button>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-4 gap-2">
              <input value={exName} onChange={(e) => setExName(e.target.value)} placeholder="Exercise name" className="col-span-2 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none" />
              <input value={exReps} onChange={(e) => setExReps(e.target.value)} placeholder="Reps" className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none" />
              <button onClick={addExercise} className="bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm transition-colors">+ Add</button>
            </div>
          </div>

          <button onClick={saveWorkout} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg text-sm font-medium transition-colors">Save</button>
        </div>
      </Modal>
    </>
  );
};

export default WorkoutsPage;
