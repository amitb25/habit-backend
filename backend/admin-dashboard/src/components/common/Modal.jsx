import { X } from "lucide-react";

const Modal = ({ isOpen, onClose, title, children, maxWidth = "max-w-lg" }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center animate-fadeIn">
      {/* Overlay */}
      <div
        className="absolute inset-0"
        style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)" }}
        onClick={onClose}
      />

      {/* Modal Content */}
      <div
        className={`relative ${maxWidth} w-full mx-4 max-h-[90vh] overflow-y-auto rounded-2xl animate-scaleIn`}
        style={{
          background: "#111128",
          border: "1px solid rgba(255,255,255,0.1)",
          boxShadow: "0 25px 60px rgba(0,0,0,0.5), 0 0 40px rgba(99,102,241,0.05)",
        }}
      >
        {/* Top gradient accent */}
        <div
          className="absolute top-0 left-0 right-0 h-[2px] rounded-t-2xl"
          style={{ background: "linear-gradient(90deg, #6366f1, #8b5cf6, #a855f7)" }}
        />

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5">
          <h3 className="text-lg font-bold text-white tracking-tight">{title}</h3>
          <button
            onClick={onClose}
            className="p-2 text-slate-500 hover:text-white transition-all duration-200 rounded-xl hover:bg-white/5"
          >
            <X size={18} />
          </button>
        </div>

        {/* Divider */}
        <div className="mx-6 h-px" style={{ background: "rgba(255,255,255,0.06)" }} />

        {/* Body */}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
