import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
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
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await api.get("/daily-tasks", { params: { date, page, limit: 30 } });
      setTasks(res.data.data);
      setPagination(res.data.pagination);
    } catch (err) {
      toast.error("Failed to load daily tasks");
    }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchTasks(); }, [page, date]);

  const columns = [
    { key: "title", label: "Title", render: (r) => <span className="font-semibold text-white">{r.title}</span> },
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
        <div>
          <input
            type="date"
            value={date}
            onChange={(e) => { setDate(e.target.value); setPage(1); }}
            className="input-dark rounded-xl px-4 py-2.5 text-sm"
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
