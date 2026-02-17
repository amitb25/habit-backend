import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { Save } from "lucide-react";
import Header from "../components/Layout/Header";
import Loader from "../components/common/Loader";
import api from "../api/adminApi";
import toast from "react-hot-toast";

const SettingsPage = () => {
  const { onMenuClick } = useOutletContext();
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/settings")
      .then((res) => setSettings(res.data.data || {}))
      .catch(() => toast.error("Failed to load settings"))
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

  if (loading) return (
    <>
      <Header title="Settings" onMenuClick={onMenuClick} />
      <div className="p-6 flex items-center justify-center min-h-[60vh]">
        <Loader size={160} text="Loading Settings..." />
      </div>
    </>
  );

  return (
    <>
      <Header title="Settings" subtitle="Configure app parameters" onMenuClick={onMenuClick} />
      <div className="p-6 space-y-6 animate-slideUp">
        <div
          className="rounded-2xl p-6 space-y-0"
          style={{
            background: "#111128",
            border: "1px solid rgba(255,255,255,0.06)",
            boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
          }}
        >
          {defaultSettings.map((s, idx) => (
            <div
              key={s.key}
              className="flex items-center justify-between py-4"
              style={{ borderBottom: idx < defaultSettings.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}
            >
              <label className="text-sm font-medium text-slate-300">{s.label}</label>
              {s.type === "text" && (
                <input
                  value={settings[s.key] ?? s.default}
                  onChange={(e) => updateSetting(s.key, e.target.value)}
                  className="input-dark rounded-xl px-3 py-2 text-sm w-64"
                />
              )}
              {s.type === "number" && (
                <input
                  type="number"
                  value={settings[s.key] ?? s.default}
                  onChange={(e) => updateSetting(s.key, parseInt(e.target.value))}
                  className="input-dark rounded-xl px-3 py-2 text-sm w-32"
                />
              )}
              {s.type === "toggle" && (
                <button
                  onClick={() => updateSetting(s.key, !(settings[s.key] ?? s.default))}
                  className="w-12 h-6 rounded-full transition-all duration-300 relative"
                  style={{
                    background: (settings[s.key] ?? s.default)
                      ? "linear-gradient(135deg, #6366f1, #8b5cf6)"
                      : "rgba(255,255,255,0.08)",
                    boxShadow: (settings[s.key] ?? s.default) ? "0 0 15px rgba(99,102,241,0.3)" : "none",
                  }}
                >
                  <div
                    className="w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform duration-300"
                    style={{
                      transform: (settings[s.key] ?? s.default) ? "translateX(24px)" : "translateX(2px)",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
                    }}
                  />
                </button>
              )}
            </div>
          ))}
        </div>

        <button onClick={handleSave} className="flex items-center gap-2 btn-primary px-6 py-2.5 text-sm font-bold">
          <Save size={16} /> Save Settings
        </button>
      </div>
    </>
  );
};

export default SettingsPage;
