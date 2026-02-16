import React, { createContext, useContext, useState, useCallback } from "react";
import * as api from "../../services/api";
import { useAuth, getErrorMsg } from "./AuthContext";

const GoalsContext = createContext();

export const useGoals = () => {
  const context = useContext(GoalsContext);
  if (!context) throw new Error("useGoals must be used within GoalsProvider");
  return context;
};

export const GoalsProvider = ({ children }) => {
  const { setError } = useAuth();
  const [goals, setGoals] = useState([]);
  const [goalSummary, setGoalSummary] = useState({
    total: 0,
    active: 0,
    completed: 0,
    abandoned: 0,
  });
  const [goalMilestones, setGoalMilestones] = useState({});

  const loadGoals = useCallback(async (profileId) => {
    try {
      const res = await api.fetchGoals(profileId);
      setGoals(res.data.data);
      setGoalSummary(res.data.summary);
    } catch (err) {
      setError(getErrorMsg(err, "Failed to load goals"));
    }
  }, [setError]);

  const addGoal = useCallback(async (payload) => {
    try {
      const res = await api.createGoal(payload);
      setGoals((prev) => [res.data.data, ...prev]);
    } catch (err) {
      setError(getErrorMsg(err, "Failed to create goal"));
    }
  }, [setError]);

  const editGoal = useCallback(async (id, updates) => {
    try {
      const res = await api.updateGoal(id, updates);
      setGoals((prev) => prev.map((g) => (g.id === id ? res.data.data : g)));
    } catch (err) {
      setError(getErrorMsg(err, "Failed to update goal"));
    }
  }, [setError]);

  const updateGoalProgress = useCallback(async (id, value) => {
    try {
      const res = await api.updateGoalProgress(id, value);
      setGoals((prev) => prev.map((g) => (g.id === id ? res.data.data : g)));
    } catch (err) {
      setError(getErrorMsg(err, "Failed to update progress"));
    }
  }, [setError]);

  const removeGoal = useCallback(async (id) => {
    try {
      await api.deleteGoal(id);
      setGoals((prev) => prev.filter((g) => g.id !== id));
    } catch (err) {
      setError(getErrorMsg(err, "Failed to delete goal"));
    }
  }, [setError]);

  const loadMilestones = useCallback(async (goalId) => {
    try {
      const res = await api.fetchMilestones(goalId);
      setGoalMilestones((prev) => ({ ...prev, [goalId]: res.data.data }));
    } catch (err) {
      setError(getErrorMsg(err, "Failed to load milestones"));
    }
  }, [setError]);

  const addGoalMilestone = useCallback(async (goalId, profileId, title) => {
    try {
      const res = await api.createMilestone(goalId, profileId, title);
      setGoalMilestones((prev) => ({
        ...prev,
        [goalId]: [...(prev[goalId] || []), res.data.data],
      }));
    } catch (err) {
      setError(getErrorMsg(err, "Failed to add milestone"));
    }
  }, [setError]);

  const toggleGoalMilestone = useCallback(async (milestoneId, goalId) => {
    try {
      const res = await api.toggleMilestone(milestoneId);
      setGoalMilestones((prev) => ({
        ...prev,
        [goalId]: (prev[goalId] || []).map((m) =>
          m.id === milestoneId ? res.data.data : m
        ),
      }));
    } catch (err) {
      setError(getErrorMsg(err, "Failed to toggle milestone"));
    }
  }, [setError]);

  const removeGoalMilestone = useCallback(async (milestoneId, goalId) => {
    try {
      await api.deleteMilestone(milestoneId);
      setGoalMilestones((prev) => ({
        ...prev,
        [goalId]: (prev[goalId] || []).filter((m) => m.id !== milestoneId),
      }));
    } catch (err) {
      setError(getErrorMsg(err, "Failed to delete milestone"));
    }
  }, [setError]);

  const value = {
    goals,
    goalSummary,
    goalMilestones,
    loadGoals,
    addGoal,
    editGoal,
    updateGoalProgress,
    removeGoal,
    loadMilestones,
    addGoalMilestone,
    toggleGoalMilestone,
    removeGoalMilestone,
  };

  return <GoalsContext.Provider value={value}>{children}</GoalsContext.Provider>;
};
