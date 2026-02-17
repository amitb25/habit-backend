import { AlertTriangle, Trash2, Ban, X } from "lucide-react";

const iconMap = {
  delete: { Icon: Trash2, color: "#f87171", bg: "rgba(239,68,68,0.12)" },
  block: { Icon: Ban, color: "#fbbf24", bg: "rgba(245,158,11,0.12)" },
  warning: { Icon: AlertTriangle, color: "#fbbf24", bg: "rgba(245,158,11,0.12)" },
};

const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Are you sure?",
  message = "This action cannot be undone.",
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "delete",
  loading = false,
}) => {
  if (!isOpen) return null;

  const { Icon, color, bg } = iconMap[variant] || iconMap.warning;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center animate-fadeIn">
      {/* Overlay */}
      <div
        className="absolute inset-0"
        style={{ background: "var(--bg-overlay)", backdropFilter: "blur(8px)" }}
        onClick={onClose}
      />

      {/* Dialog */}
      <div
        className="relative w-full max-w-sm mx-4 rounded-2xl animate-scaleIn"
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border-medium)",
          boxShadow: "var(--shadow-xl)",
        }}
      >
        {/* Top accent */}
        <div
          className="absolute top-0 left-0 right-0 h-[2px] rounded-t-2xl"
          style={{ background: `linear-gradient(90deg, ${color}, ${color}80)` }}
        />

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-600 hover-text-heading transition-colors rounded-lg hover-bg-subtle cursor-pointer"
        >
          <X size={16} />
        </button>

        <div className="p-6 text-center">
          {/* Icon */}
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: bg }}
          >
            <Icon size={24} style={{ color }} />
          </div>

          {/* Title */}
          <h3 className="text-lg font-bold text-heading mb-2">{title}</h3>

          {/* Message */}
          <p className="text-sm text-slate-400 mb-6 leading-relaxed">{message}</p>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover-text-heading transition-all duration-200 cursor-pointer"
              style={{
                background: "var(--cancel-btn-bg)",
                border: "1px solid var(--cancel-btn-border)",
              }}
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold text-white transition-all duration-200 hover:brightness-110 cursor-pointer"
              style={{
                background: variant === "delete"
                  ? "linear-gradient(135deg, #ef4444, #dc2626)"
                  : variant === "block"
                  ? "linear-gradient(135deg, #f59e0b, #d97706)"
                  : "linear-gradient(135deg, #6366f1, #7c3aed)",
                boxShadow: `0 2px 12px ${color}40`,
                opacity: loading ? 0.6 : 1,
              }}
            >
              {loading ? "Processing..." : confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
