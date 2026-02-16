import React, { createContext, useContext, useState, useCallback } from "react";
import * as api from "../../services/api";
import { useAuth, getErrorMsg } from "./AuthContext";

const DebtsContext = createContext();

export const useDebts = () => {
  const context = useContext(DebtsContext);
  if (!context) throw new Error("useDebts must be used within DebtsProvider");
  return context;
};

export const DebtsProvider = ({ children }) => {
  const { setLoading, setError } = useAuth();
  const [debts, setDebts] = useState([]);
  const [debtSummary, setDebtSummary] = useState({
    total_debt: 0,
    total_paid: 0,
    total_remaining: 0,
  });

  const loadDebts = useCallback(async (profileId) => {
    try {
      setLoading(true);
      const res = await api.fetchDebts(profileId);
      setDebts(res.data.data);
      setDebtSummary(res.data.summary);
    } catch (err) {
      setError(getErrorMsg(err, "Failed to load debts"));
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError]);

  const addDebt = useCallback(async (payload) => {
    try {
      const res = await api.createDebt(payload);
      setDebts((prev) => [...prev, res.data.data]);
    } catch (err) {
      setError(getErrorMsg(err, "Failed to create debt"));
    }
  }, [setError]);

  const payDebt = useCallback(
    async (id, payload, profileId) => {
      try {
        await api.recordPayment(id, payload);
        // Reload debts to get fresh summary
        await loadDebts(profileId);
      } catch (err) {
        setError(getErrorMsg(err, "Failed to record payment"));
      }
    },
    [loadDebts, setError]
  );

  const removeDebt = useCallback(async (id) => {
    try {
      await api.deleteDebt(id);
      setDebts((prev) => prev.filter((d) => d.id !== id));
    } catch (err) {
      setError(getErrorMsg(err, "Failed to delete debt"));
    }
  }, [setError]);

  const value = { debts, debtSummary, loadDebts, addDebt, payDebt, removeDebt };

  return <DebtsContext.Provider value={value}>{children}</DebtsContext.Provider>;
};
