import { useState, useEffect } from "react";
import Header from "../components/Layout/Header";
import DataTable from "../components/common/DataTable";
import Pagination from "../components/common/Pagination";
import api from "../api/adminApi";

const DailyTasksPage = () => {
  const [tasks, setTasks] = useState([]);
  const [pagination, setPagination] = useState({});
  const [page, setPage] = useState(1);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await api.get("/daily-tasks", { params: { date, page, limit: 30 } });
      setTasks(res.data.data);
      setPagination(res.data.pagination);
    } catch (err) {}
    finally { setLoading(false); }
  };

  useEffect(() => { fetchTasks(); }, [page, date]);

  const columns = [
    { key: "title", label: "Title", render: (r) => <span className="font-medium">{r.title}</span> },
    { key: "user", label: "User", render: (r) => r.profiles?.name || "-" },
    { key: "task_date", label: "Date" },
    { key: "priority", label: "Priority", render: (r) => (
      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${r.priority === "high" ? "bg-red-500/15 text-red-400" : r.priority === "medium" ? "bg-amber-500/15 text-amber-400" : "bg-slate-500/15 text-slate-400"}`}>
        {r.priority}
      </span>
    )},
    { key: "is_completed", label: "Status", render: (r) => r.is_completed ? <span className="text-emerald-400">Done</span> : <span className="text-slate-500">Pending</span> },
  ];

  return (
    <>
      <Header title="Daily Tasks" />
      <div className="p-6 space-y-4">
        <div className="flex gap-3">
          <input type="date" value={date} onChange={(e) => { setDate(e.target.value); setPage(1); }} className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>

        {loading ? <p className="text-slate-400">Loading...</p> : (
          <>
            <DataTable columns={columns} data={tasks} emptyMessage="No tasks for this date" />
            <Pagination page={pagination.page} pages={pagination.pages} total={pagination.total} onPageChange={setPage} />
          </>
        )}
      </div>
    </>
  );
};

export default DailyTasksPage;
