import { X } from "lucide-react";

const Modal = ({ isOpen, onClose, title, children, maxWidth = "max-w-lg" }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center animate-fadeIn">
      {/* Overlay */}
      <div
        className="absolute inset-0"
        style={{ background: "var(--bg-overlay)", backdropFilter: "blur(8px)" }}
        onClick={onClose}
      />

      {/* Modal Content */}
      <div
        className={`relative ${maxWidth} w-full mx-4 max-h-[90vh] overflow-y-auto rounded-2xl animate-scaleIn`}
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border-medium)",
          boxShadow: "var(--shadow-xl)",
        }}
      >
        {/* Top gradient accent */}
        <div
          className="absolute top-0 left-0 right-0 h-[2px] rounded-t-2xl"
          style={{ background: "linear-gradient(90deg, #6366f1, #8b5cf6, #a855f7)" }}
        />

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5">
          <h3 className="text-lg font-bold text-heading tracking-tight">{title}</h3>
          <button
            onClick={onClose}
            className="p-2 text-slate-500 hover-text-heading transition-all duration-200 rounded-xl hover-bg-subtle cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Divider */}
        <div className="mx-6 h-px" style={{ background: "var(--border-subtle)" }} />

        {/* Body */}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
