import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { Search } from "lucide-react";
import Header from "../components/Layout/Header";
import DataTable from "../components/common/DataTable";
import Pagination from "../components/common/Pagination";
import Loader from "../components/common/Loader";
import api from "../api/adminApi";
import toast from "react-hot-toast";

const DailyTasksPage = () => {
  const { onMenuClick } = useOutletContext();
  const [tasks, setTasks] = useState([]);
  const [pagination, setPagination] = useState({});
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const params = { date, page, limit: 30 };
      if (search) params.search = search;
      const res = await api.get("/daily-tasks", { params });
      setTasks(res.data.data);
      setPagination(res.data.pagination);
    } catch (err) {
      toast.error("Failed to load daily tasks");
    }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchTasks(); }, [page, date, search]);

  const columns = [
    { key: "title", label: "Title", render: (r) => <span className="font-semibold text-heading">{r.title}</span> },
    { key: "user", label: "User", render: (r) => r.profiles?.name || "-" },
    { key: "task_date", label: "Date" },
    { key: "priority", label: "Priority", render: (r) => (
      <span className={`badge ${r.priority === "high" ? "badge-danger" : r.priority === "medium" ? "badge-warning" : "badge-info"}`}>
        {r.priority}
      </span>
    )},
    { key: "is_completed", label: "Status", render: (r) => r.is_completed
      ? <span className="badge badge-success">Done</span>
      : <span className="badge" style={{ color: "#94a3b8", background: "rgba(100,116,139,0.1)", border: "1px solid rgba(100,116,139,0.15)" }}>Pending</span>
    },
  ];

  return (
    <>
      <Header title="Daily Tasks" subtitle="View tasks by date" onMenuClick={onMenuClick} />
      <div className="p-6 space-y-5 animate-slideUp">
        <div className="flex flex-wrap items-center gap-3">
          <div
            className="flex items-center flex-1 min-w-[200px] max-w-md rounded-full px-5 py-3"
            style={{ background: "var(--bg-card)", border: "1px solid var(--border-subtle)" }}
          >
            <Search size={16} className="text-slate-600 shrink-0" />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search tasks..."
              className="flex-1 bg-transparent border-none outline-none text-sm text-body placeholder-slate-600 ml-3"
            />
          </div>
          <input
            type="date"
            value={date}
            onChange={(e) => { setDate(e.target.value); setPage(1); }}
            className="input-dark rounded-xl px-4 py-2.5 text-sm cursor-pointer"
          />
        </div>

        {loading ? (
          <Loader size={150} text="Loading Tasks..." />
        ) : (
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
