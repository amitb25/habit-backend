const DataTable = ({ columns, data, onRowClick, emptyMessage = "No data found" }) => {
  if (!data || data.length === 0) {
    return (
      <div className="bg-slate-900/80 border border-slate-700/50 rounded-xl p-12 text-center">
        <p className="text-slate-400">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/80 border border-slate-700/50 rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-700/50">
              {columns.map((col) => (
                <th key={col.key} className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-5 py-3">
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {data.map((row, idx) => (
              <tr
                key={row.id || idx}
                onClick={() => onRowClick?.(row)}
                className={`transition-colors ${onRowClick ? "cursor-pointer hover:bg-slate-800/50" : ""}`}
              >
                {columns.map((col) => (
                  <td key={col.key} className="px-5 py-3.5 text-sm text-slate-300 whitespace-nowrap">
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
