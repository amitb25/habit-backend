import React, { createContext, useContext, useState, useCallback } from "react";
import * as api from "../../services/api";
import { useAuth, getErrorMsg } from "./AuthContext";

const SleepContext = createContext();

export const useSleep = () => {
  const context = useContext(SleepContext);
  if (!context) throw new Error("useSleep must be used within SleepProvider");
  return context;
};

export const SleepProvider = ({ children }) => {
  const { setError } = useAuth();
  const [sleepLogs, setSleepLogs] = useState([]);
  const [sleepSummary, setSleepSummary] = useState({ avgDuration: 0, avgQuality: "good", totalLogs: 0 });
  const [sleepAnalytics, setSleepAnalytics] = useState(null);

  const loadSleep = useCallback(async (profileId) => {
    try {
      const res = await api.fetchSleepLogs(profileId);
      setSleepLogs(res.data.data);
      setSleepSummary(res.data.summary);
    } catch (err) {
      setError(getErrorMsg(err, "Failed to load sleep logs"));
    }
  }, [setError]);

  const addSleepLog = useCallback(async (payload) => {
    try {
      const res = await api.createSleepLog(payload);
      setSleepLogs((prev) => [res.data.data, ...prev]);
    } catch (err) {
      setError(getErrorMsg(err, "Failed to add sleep log"));
    }
  }, [setError]);

  const editSleepLog = useCallback(async (id, updates) => {
    try {
      const res = await api.updateSleepLog(id, updates);
      setSleepLogs((prev) => prev.map((l) => (l.id === id ? res.data.data : l)));
    } catch (err) {
      setError(getErrorMsg(err, "Failed to update sleep log"));
    }
  }, [setError]);

  const removeSleepLog = useCallback(async (id) => {
    try {
      await api.deleteSleepLog(id);
      setSleepLogs((prev) => prev.filter((l) => l.id !== id));
    } catch (err) {
      setError(getErrorMsg(err, "Failed to delete sleep log"));
    }
  }, [setError]);

  const loadAnalytics = useCallback(async (profileId) => {
    try {
      const res = await api.fetchSleepAnalytics(profileId);
      setSleepAnalytics(res.data.data);
    } catch (err) {
      setError(getErrorMsg(err, "Failed to load sleep analytics"));
    }
  }, [setError]);

  const value = {
    sleepLogs,
    sleepSummary,
    sleepAnalytics,
    loadSleep,
    addSleepLog,
    editSleepLog,
    removeSleepLog,
    loadAnalytics,
  };

  return <SleepContext.Provider value={value}>{children}</SleepContext.Provider>;
};
