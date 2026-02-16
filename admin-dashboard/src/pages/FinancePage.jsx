import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Wallet, TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import Header from "../components/Layout/Header";
import StatsCard from "../components/common/StatsCard";
import DataTable from "../components/common/DataTable";
import Pagination from "../components/common/Pagination";
import api from "../api/adminApi";

const FinancePage = () => {
  const [overview, setOverview] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [pagination, setPagination] = useState({});
  const [page, setPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/finance/overview").then((res) => setOverview(res.data.data)).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = { page, limit: 20 };
    if (typeFilter) params.type = typeFilter;
    api.get("/finance/transactions", { params })
      .then((res) => { setTransactions(res.data.data); setPagination(res.data.pagination); })
      .finally(() => setLoading(false));
  }, [page, typeFilter]);

  const columns = [
    { key: "title", label: "Title", render: (r) => <span className="font-medium">{r.title}</span> },
    { key: "user", label: "User", render: (r) => r.profiles?.name || "-" },
    { key: "type", label: "Type", render: (r) => <span className={r.type === "income" ? "text-emerald-400" : "text-red-400"}>{r.type}</span> },
    { key: "amount", label: "Amount", render: (r) => `${r.amount}` },
    { key: "category", label: "Category" },
    { key: "transaction_date", label: "Date" },
  ];

  return (
    <>
      <Header title="Finance" />
      <div className="p-6 space-y-6">
        {overview && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <StatsCard title="Total Income" value={`${Math.round(overview.totalIncome)}`} icon={TrendingUp} color="green" />
              <StatsCard title="Total Expense" value={`${Math.round(overview.totalExpense)}`} icon={TrendingDown} color="red" />
              <StatsCard title="Net Balance" value={`${Math.round(overview.netBalance)}`} icon={DollarSign} color="blue" />
              <StatsCard title="Transactions" value={overview.totalTransactions} icon={Wallet} color="purple" />
            </div>
            {overview.topCategories.length > 0 && (
              <div className="bg-slate-900/80 border border-slate-700/50 rounded-xl p-5">
                <h3 className="text-sm font-medium text-slate-300 mb-4">Top Categories</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={overview.topCategories}>
                    <XAxis dataKey="category" tick={{ fill: "#64748b", fontSize: 10 }} angle={-30} textAnchor="end" height={60} />
                    <YAxis tick={{ fill: "#64748b", fontSize: 11 }} />
                    <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: "8px", color: "#fff" }} />
                    <Bar dataKey="amount" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </>
        )}

        <div className="flex gap-3">
          <select value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }} className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none">
            <option value="">All Types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
        </div>

        {loading ? <p className="text-slate-400">Loading...</p> : (
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
