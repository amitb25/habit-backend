import { useState, useEffect } from "react";
import { Save } from "lucide-react";
import Header from "../components/Layout/Header";
import api from "../api/adminApi";
import toast from "react-hot-toast";

const SettingsPage = () => {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/settings")
      .then((res) => setSettings(res.data.data || {}))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    try {
      await api.put("/settings", settings);
      toast.success("Settings saved");
    } catch (err) {
      toast.error("Failed to save settings");
    }
  };

  const updateSetting = (key, value) => {
    setSettings({ ...settings, [key]: value });
  };

  const defaultSettings = [
    { key: "app_name", label: "App Name", type: "text", default: "HustleKit" },
    { key: "maintenance_mode", label: "Maintenance Mode", type: "toggle", default: false },
    { key: "max_habits_per_user", label: "Max Habits Per User", type: "number", default: 20 },
    { key: "xp_per_habit", label: "XP Per Habit Completion", type: "number", default: 10 },
    { key: "xp_streak_bonus", label: "XP Streak Bonus (3+ days)", type: "number", default: 5 },
    { key: "xp_all_complete_bonus", label: "XP All Habits Complete Bonus", type: "number", default: 25 },
  ];

  if (loading) return <><Header title="Settings" /><div className="p-6 text-slate-400">Loading...</div></>;

  return (
    <>
      <Header title="Settings" />
      <div className="p-6 space-y-6">
        <div className="bg-slate-900/80 border border-slate-700/50 rounded-xl p-6 space-y-5">
          {defaultSettings.map((s) => (
            <div key={s.key} className="flex items-center justify-between">
              <label className="text-sm font-medium text-slate-300">{s.label}</label>
              {s.type === "text" && (
                <input
                  value={settings[s.key] ?? s.default}
                  onChange={(e) => updateSetting(s.key, e.target.value)}
                  className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              )}
              {s.type === "number" && (
                <input
                  type="number"
                  value={settings[s.key] ?? s.default}
                  onChange={(e) => updateSetting(s.key, parseInt(e.target.value))}
                  className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm w-32 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              )}
              {s.type === "toggle" && (
                <button
                  onClick={() => updateSetting(s.key, !(settings[s.key] ?? s.default))}
                  className={`w-12 h-6 rounded-full transition-colors relative ${(settings[s.key] ?? s.default) ? "bg-blue-600" : "bg-slate-700"}`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${(settings[s.key] ?? s.default) ? "translate-x-6" : "translate-x-0.5"}`} />
                </button>
              )}
            </div>
          ))}
        </div>

        <button onClick={handleSave} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors">
          <Save size={16} /> Save Settings
        </button>
      </div>
    </>
  );
};

export default SettingsPage;
