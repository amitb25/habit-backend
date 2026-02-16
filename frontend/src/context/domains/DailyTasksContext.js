import React, { createContext, useContext, useState, useCallback } from "react";
import * as api from "../../services/api";
import { useAuth, getErrorMsg } from "./AuthContext";

const DailyTasksContext = createContext();

export const useDailyTasks = () => {
  const context = useContext(DailyTasksContext);
  if (!context) throw new Error("useDailyTasks must be used within DailyTasksProvider");
  return context;
};

export const DailyTasksProvider = ({ children }) => {
  const { setError } = useAuth();
  const [dailyTasks, setDailyTasks] = useState([]);
  const [dailyTaskSummary, setDailyTaskSummary] = useState({
    total: 0,
    completed: 0,
    pending: 0,
  });

  const loadDailyTasks = useCallback(async (profileId, date) => {
    try {
      const res = await api.fetchDailyTasks(profileId, date);
      setDailyTasks(res.data.data);
      setDailyTaskSummary(res.data.summary);
    } catch (err) {
      setError(getErrorMsg(err, "Failed to load daily tasks"));
    }
  }, [setError]);

  const addDailyTask = useCallback(async (payload) => {
    try {
      const res = await api.createDailyTask(payload);
      setDailyTasks((prev) => [...prev, res.data.data]);
      setDailyTaskSummary((prev) => ({
        total: prev.total + 1,
        completed: prev.completed,
        pending: prev.pending + 1,
      }));
    } catch (err) {
      setError(getErrorMsg(err, "Failed to create task"));
    }
  }, [setError]);

  const toggleDailyTaskStatus = useCallback(async (id) => {
    try {
      const res = await api.toggleDailyTask(id);
      setDailyTasks((prev) =>
        prev.map((t) => (t.id === id ? res.data.data : t))
      );
      const wasCompleted = !res.data.data.is_completed;
      setDailyTaskSummary((prev) => ({
        total: prev.total,
        completed: prev.completed + (wasCompleted ? -1 : 1),
        pending: prev.pending + (wasCompleted ? 1 : -1),
      }));
    } catch (err) {
      setError(getErrorMsg(err, "Failed to toggle task"));
    }
  }, [setError]);

  const editDailyTask = useCallback(async (id, updates) => {
    try {
      const res = await api.updateDailyTask(id, updates);
      setDailyTasks((prev) =>
        prev.map((t) => (t.id === id ? res.data.data : t))
      );
    } catch (err) {
      setError(getErrorMsg(err, "Failed to update task"));
    }
  }, [setError]);

  const removeDailyTask = useCallback(async (id) => {
    try {
      await api.deleteDailyTask(id);
      setDailyTasks((prev) => {
        const task = prev.find((t) => t.id === id);
        setDailyTaskSummary((s) => ({
          total: s.total - 1,
          completed: s.completed - (task?.is_completed ? 1 : 0),
          pending: s.pending - (task?.is_completed ? 0 : 1),
        }));
        return prev.filter((t) => t.id !== id);
      });
    } catch (err) {
      setError(getErrorMsg(err, "Failed to delete task"));
    }
  }, [setError]);

  const value = {
    dailyTasks,
    dailyTaskSummary,
    loadDailyTasks,
    addDailyTask,
    toggleDailyTaskStatus,
    editDailyTask,
    removeDailyTask,
  };

  return <DailyTasksContext.Provider value={value}>{children}</DailyTasksContext.Provider>;
};
