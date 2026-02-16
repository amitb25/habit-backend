import { ChevronLeft, ChevronRight } from "lucide-react";

const Pagination = ({ page, pages, total, onPageChange }) => {
  if (pages <= 1) return null;

  return (
    <div className="flex items-center justify-between mt-5">
      <p className="text-xs text-slate-500 font-medium">
        <span className="text-slate-400 font-semibold">{total}</span> results
      </p>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="p-2 rounded-xl text-slate-500 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200"
          style={{ background: "#111128", border: "1px solid rgba(255,255,255,0.06)" }}
        >
          <ChevronLeft size={16} />
        </button>
        <span
          className="text-sm text-slate-300 font-medium px-4 py-2 rounded-xl"
          style={{ background: "#111128", border: "1px solid rgba(255,255,255,0.06)" }}
        >
          {page} <span className="text-slate-600 mx-1">/</span> {pages}
        </span>
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= pages}
          className="p-2 rounded-xl text-slate-500 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200"
          style={{ background: "#111128", border: "1px solid rgba(255,255,255,0.06)" }}
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
