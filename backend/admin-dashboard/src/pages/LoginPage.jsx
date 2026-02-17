import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Zap, Loader2, Lock, Mail } from "lucide-react";
import toast from "react-hot-toast";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success("Welcome back!");
      navigate("/admin");
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-page-animated flex items-center justify-center p-4">
      <div className="w-full max-w-[400px] animate-slideUp">
        {/* Brand */}
        <div className="text-center mb-10">
          <img
            src={import.meta.env.BASE_URL + "logo.png"}
            alt="LifeStack"
            className="w-20 h-20 mx-auto mb-5 animate-float object-contain"
          />
          <h1 className="text-3xl font-extrabold tracking-tight text-gradient">LifeStack</h1>
          <p className="text-xs text-slate-500 mt-2 uppercase tracking-[0.25em] font-medium">Admin Panel</p>
        </div>

        {/* Form Card */}
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl p-7 space-y-6"
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border-medium)",
            boxShadow: "var(--shadow-xl)",
          }}
        >
          {/* Top accent */}
          <div
            className="absolute top-0 left-6 right-6 h-[2px] -mt-7 rounded-full"
            style={{ background: "linear-gradient(90deg, transparent, #6366f1, #8b5cf6, transparent)" }}
          />

          <div>
            <label className="block text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold mb-2.5">Email Address</label>
            <div className="relative">
              <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full input-dark rounded-xl pl-10 pr-4 py-3 text-sm"
                placeholder="admin@hustlekit.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold mb-2.5">Password</label>
            <div className="relative">
              <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full input-dark rounded-xl pl-10 pr-4 py-3 text-sm"
                placeholder="Enter password"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary py-3.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        <p className="text-center text-[10px] uppercase tracking-[0.25em] text-slate-600 mt-8 font-medium">
          Powered by LifeStack
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
