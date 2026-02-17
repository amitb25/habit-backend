import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { Wallet, TrendingUp, TrendingDown, DollarSign, Search } from "lucide-react";
import Header from "../components/Layout/Header";
import StatsCard from "../components/common/StatsCard";
import DataTable from "../components/common/DataTable";
import Pagination from "../components/common/Pagination";
import Loader from "../components/common/Loader";
import api from "../api/adminApi";
import toast from "react-hot-toast";
import { tooltipStyle, axisTickStyle } from "../utils/chartStyles";

const FinancePage = () => {
  const { onMenuClick } = useOutletContext();
  const [overview, setOverview] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [pagination, setPagination] = useState({});
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/finance/overview").then((res) => setOverview(res.data.data)).catch(() => {
      toast.error("Failed to load finance overview");
    });
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = { page, limit: 20 };
    if (search) params.search = search;
    if (typeFilter) params.type = typeFilter;
    api.get("/finance/transactions", { params })
      .then((res) => { setTransactions(res.data.data); setPagination(res.data.pagination); })
      .catch(() => {
        toast.error("Failed to load transactions");
      })
      .finally(() => setLoading(false));
  }, [page, search, typeFilter]);

  const columns = [
    { key: "title", label: "Title", render: (r) => <span className="font-semibold text-heading">{r.title}</span> },
    { key: "user", label: "User", render: (r) => r.profiles?.name || "-" },
    { key: "type", label: "Type", render: (r) => (
      <span className={r.type === "income" ? "badge badge-success" : "badge badge-danger"}>
        {r.type}
      </span>
    )},
    { key: "amount", label: "Amount", render: (r) => (
      <span className={`font-bold ${r.type === "income" ? "text-emerald-400" : "text-rose-400"}`}>
        {r.type === "income" ? "+" : "-"}{r.amount}
      </span>
    )},
    { key: "category", label: "Category" },
    { key: "transaction_date", label: "Date" },
  ];

  return (
    <>
      <Header title="Finance" subtitle="Track income & expenses" onMenuClick={onMenuClick} />
      <div className="p-6 space-y-6 animate-slideUp">
        {overview && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatsCard title="Total Income" value={`${Math.round(overview.totalIncome)}`} icon={TrendingUp} color="green" />
              <StatsCard title="Total Expense" value={`${Math.round(overview.totalExpense)}`} icon={TrendingDown} color="red" />
              <StatsCard title="Net Balance" value={`${Math.round(overview.netBalance)}`} icon={DollarSign} color="blue" />
              <StatsCard title="Transactions" value={overview.totalTransactions} icon={Wallet} color="purple" />
            </div>
            {overview.topCategories.length > 0 && (
              <div
                className="rounded-2xl p-6"
                style={{
                  background: "var(--bg-card)",
                  border: "1px solid var(--border-subtle)",
                  boxShadow: "var(--shadow-md)",
                }}
              >
                <div className="mb-5">
                  <h3 className="text-base font-bold text-heading">Top Categories</h3>
                  <p className="text-xs text-slate-500 mt-1">Spending breakdown by category</p>
                </div>
                <ResponsiveContainer width="100%" height={260}>
                  <AreaChart data={overview.topCategories}>
                    <defs>
                      <linearGradient id="areaGradFinance" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#fbbf24" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#fbbf24" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
                    <XAxis dataKey="category" tick={{ ...axisTickStyle, fontSize: 10 }} angle={-20} textAnchor="end" height={50} axisLine={false} tickLine={false} />
                    <YAxis tick={axisTickStyle} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={tooltipStyle} cursor={{ stroke: "rgba(245,158,11,0.2)", strokeWidth: 1 }} />
                    <Area
                      type="monotone"
                      dataKey="amount"
                      stroke="#fbbf24"
                      strokeWidth={2}
                      fill="url(#areaGradFinance)"
                      dot={{ r: 4, fill: "var(--chart-dot-fill)", stroke: "#fbbf24", strokeWidth: 2 }}
                      activeDot={{ r: 6, fill: "#fbbf24", stroke: "var(--chart-dot-fill)", strokeWidth: 2 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </>
        )}

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
              placeholder="Search by title or category..."
              className="flex-1 bg-transparent border-none outline-none text-sm text-body placeholder-slate-600 ml-3"
            />
          </div>
          <select value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }} className="input-dark rounded-xl px-4 py-2.5 text-sm cursor-pointer">
            <option value="">All Types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
        </div>

        {loading ? (
          <Loader size={150} text="Loading Transactions..." />
        ) : (
          <>
            <DataTable columns={columns} data={transactions} />
            <Pagination page={pagination.page} pages={pagination.pages} total={pagination.total} onPageChange={setPage} />
          </>
        )}
      </div>
    </>
  );
};

export default FinancePage;
