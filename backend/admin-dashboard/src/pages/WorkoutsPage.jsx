import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { Plus, Pencil, Trash2 } from "lucide-react";
import Header from "../components/Layout/Header";
import Modal from "../components/common/Modal";
import Loader from "../components/common/Loader";
import api from "../api/adminApi";
import toast from "react-hot-toast";

const LEVELS = ["beginner", "intermediate", "advanced"];
const levelColors = {
  beginner: { color: "#34d399", bg: "rgba(16,185,129,0.12)", border: "rgba(16,185,129,0.15)" },
  intermediate: { color: "#fbbf24", bg: "rgba(245,158,11,0.12)", border: "rgba(245,158,11,0.15)" },
  advanced: { color: "#f87171", bg: "rgba(239,68,68,0.12)", border: "rgba(239,68,68,0.15)" },
};

const WorkoutsPage = () => {
  const { onMenuClick } = useOutletContext();
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
      <Header title="Workout Plans" subtitle="Manage workout templates" onMenuClick={onMenuClick} />
      <div className="p-6 space-y-5 animate-slideUp">
        <div className="flex justify-end">
          <button onClick={() => openModal()} className="flex items-center gap-2 btn-primary px-4 py-2.5 text-sm font-medium">
            <Plus size={16} /> Add Workout Plan
          </button>
        </div>

        {loading ? (
          <Loader size={150} text="Loading Workouts..." />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {workouts.map((w) => {
              const lc = levelColors[w.level] || {};
              return (
                <div
                  key={w.id}
                  className="rounded-2xl p-5 accent-top transition-all duration-200 hover:-translate-y-0.5"
                  style={{
                    background: "#111128",
                    border: "1px solid rgba(255,255,255,0.06)",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
                  }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{w.icon}</span>
                      <div>
                        <h3 className="text-white font-bold">{w.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="badge" style={{ color: lc.color, background: lc.bg, border: `1px solid ${lc.border}` }}>{w.level}</span>
                          <span className="text-[10px] uppercase tracking-[0.15em] text-slate-600 font-medium">{w.duration}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => openModal(w)} className="p-2 text-slate-500 hover:text-blue-400 hover:bg-blue-400/10 rounded-xl transition-all duration-200"><Pencil size={14} /></button>
                      <button onClick={() => deleteWorkout(w.id)} className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-400/10 rounded-xl transition-all duration-200"><Trash2 size={14} /></button>
                    </div>
                  </div>
                  <div className="space-y-0">
                    {w.exercises.map((ex, idx) => (
                      <div
                        key={idx}
                        className="flex justify-between text-sm text-slate-400 py-2"
                        style={{ borderBottom: idx < w.exercises.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}
                      >
                        <span>{ex.exercise_name}</span>
                        <span className="text-xs text-slate-600 font-medium">{ex.sets}x{ex.reps}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Modal isOpen={modal} onClose={() => setModal(false)} title={editing ? "Edit Workout" : "Add Workout"} maxWidth="max-w-xl">
        <div className="space-y-4">
          <div><label className="block text-[10px] uppercase tracking-[0.15em] text-slate-500 font-bold mb-2">Name</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full input-dark rounded-xl px-3 py-2.5 text-sm" /></div>
          <div className="grid grid-cols-3 gap-3">
            <div><label className="block text-[10px] uppercase tracking-[0.15em] text-slate-500 font-bold mb-2">Level</label><select value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })} className="w-full input-dark rounded-xl px-3 py-2.5 text-sm">{LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}</select></div>
            <div><label className="block text-[10px] uppercase tracking-[0.15em] text-slate-500 font-bold mb-2">Duration</label><input value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} className="w-full input-dark rounded-xl px-3 py-2.5 text-sm" /></div>
            <div><label className="block text-[10px] uppercase tracking-[0.15em] text-slate-500 font-bold mb-2">Icon (emoji)</label><input value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} className="w-full input-dark rounded-xl px-3 py-2.5 text-sm" /></div>
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-[0.15em] text-slate-500 font-bold mb-2">Exercises</label>
            <div className="space-y-2 mb-3">
              {form.exercises.map((ex, idx) => (
                <div key={idx} className="flex items-center justify-between rounded-xl px-3 py-2.5" style={{ background: "#0d0d22", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <span className="text-sm text-white">{ex.name} <span className="text-slate-600">({ex.sets}x{ex.reps}, rest {ex.rest})</span></span>
                  <button onClick={() => removeExercise(idx)} className="text-rose-400 hover:text-rose-300 transition-colors"><Trash2 size={14} /></button>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-4 gap-2">
              <input value={exName} onChange={(e) => setExName(e.target.value)} placeholder="Exercise name" className="col-span-2 input-dark rounded-xl px-3 py-2.5 text-sm" />
              <input value={exReps} onChange={(e) => setExReps(e.target.value)} placeholder="Reps" className="input-dark rounded-xl px-3 py-2.5 text-sm" />
              <button onClick={addExercise} className="btn-secondary rounded-xl text-sm font-medium">+ Add</button>
            </div>
          </div>

          <button onClick={saveWorkout} className="w-full btn-primary py-2.5 text-sm font-bold">Save Workout</button>
        </div>
      </Modal>
    </>
  );
};

export default WorkoutsPage;
