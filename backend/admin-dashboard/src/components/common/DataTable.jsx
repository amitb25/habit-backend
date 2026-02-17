import { Inbox } from "lucide-react";

const DataTable = ({ columns, data, onRowClick, emptyMessage = "No data found" }) => {
  if (!data || data.length === 0) {
    return (
      <div
        className="rounded-2xl p-16 text-center animate-fadeIn"
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border-subtle)",
          boxShadow: "var(--shadow-sm)",
        }}
      >
        <div
          className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
          style={{ background: "rgba(99,102,241,0.08)" }}
        >
          <Inbox size={28} className="text-slate-600" />
        </div>
        <p className="text-slate-400 text-sm font-medium">{emptyMessage}</p>
        <p className="text-slate-600 text-xs mt-1">Data will appear here once available</p>
      </div>
    );
  }

  return (
    <div
      className="rounded-2xl overflow-hidden animate-fadeIn"
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border-subtle)",
        boxShadow: "var(--shadow-sm)",
      }}
    >
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr style={{ background: "var(--table-header-bg)", borderBottom: "1px solid var(--border-subtle)" }}>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="text-left text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500 px-5 py-4"
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, idx) => (
              <tr
                key={row.id || idx}
                onClick={() => onRowClick?.(row)}
                className={`transition-all duration-200 ${
                  onRowClick ? "cursor-pointer" : ""
                }`}
                style={{
                  borderBottom: idx < data.length - 1 ? "1px solid var(--table-row-border)" : "none",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = onRowClick ? "var(--table-row-hover)" : "var(--table-row-hover-alt)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                }}
              >
                {columns.map((col) => (
                  <td key={col.key} className="px-5 py-4 text-sm text-body whitespace-nowrap">
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataTable;
