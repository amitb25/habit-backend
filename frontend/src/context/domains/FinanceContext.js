import React, { createContext, useContext, useState, useCallback } from "react";
import * as api from "../../services/api";
import { useAuth, getErrorMsg } from "./AuthContext";

const FinanceContext = createContext();

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) throw new Error("useFinance must be used within FinanceProvider");
  return context;
};

export const FinanceProvider = ({ children }) => {
  const { setError } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [financeSummary, setFinanceSummary] = useState({
    total_income: 0,
    total_expense: 0,
    balance: 0,
  });
  const [monthlyBudget, setMonthlyBudgetState] = useState(null);

  const loadTransactions = useCallback(async (profileId, month) => {
    try {
      const res = await api.fetchTransactions(profileId, month);
      setTransactions(res.data.data);
      setFinanceSummary(res.data.summary);

      // Also load budget for this month
      try {
        const summaryRes = await api.fetchMonthlySummary(profileId, month);
        setMonthlyBudgetState(summaryRes.data.data.budget);
      } catch {
        setMonthlyBudgetState(null);
      }
    } catch (err) {
      setError(getErrorMsg(err, "Failed to load transactions"));
    }
  }, [setError]);

  const addTransaction = useCallback(async (payload) => {
    try {
      const res = await api.createTransaction(payload);
      setTransactions((prev) => [res.data.data, ...prev]);
    } catch (err) {
      setError(getErrorMsg(err, "Failed to add transaction"));
    }
  }, [setError]);

  const removeTransaction = useCallback(async (id) => {
    try {
      await api.deleteTransaction(id);
      setTransactions((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      setError(getErrorMsg(err, "Failed to delete transaction"));
    }
  }, [setError]);

  const setMonthlyBudget = useCallback(async (profileId, month, amount) => {
    try {
      await api.setMonthlyBudget(profileId, month, amount);
      setMonthlyBudgetState(amount);
    } catch (err) {
      setError(getErrorMsg(err, "Failed to set budget"));
    }
  }, [setError]);

  const value = {
    transactions,
    financeSummary,
    monthlyBudget,
    loadTransactions,
    addTransaction,
    removeTransaction,
    setMonthlyBudget,
  };

  return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>;
};
