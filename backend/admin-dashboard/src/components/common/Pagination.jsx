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
          className="p-2 rounded-xl text-slate-500 hover-text-heading disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-all duration-200"
          style={{ background: "var(--bg-card)", border: "1px solid var(--border-subtle)" }}
        >
          <ChevronLeft size={16} />
        </button>
        <span
          className="text-sm text-body font-medium px-4 py-2 rounded-xl"
          style={{ background: "var(--bg-card)", border: "1px solid var(--border-subtle)" }}
        >
          {page} <span className="text-slate-600 mx-1">/</span> {pages}
        </span>
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= pages}
          className="p-2 rounded-xl text-slate-500 hover-text-heading disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-all duration-200"
          style={{ background: "var(--bg-card)", border: "1px solid var(--border-subtle)" }}
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
