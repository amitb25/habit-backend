import React, { createContext, useContext, useState, useCallback } from "react";
import * as api from "../../services/api";
import { useAuth, getErrorMsg } from "./AuthContext";
import { useProfile } from "./ProfileContext";

const HabitsContext = createContext();

export const useHabits = () => {
  const context = useContext(HabitsContext);
  if (!context) throw new Error("useHabits must be used within HabitsProvider");
  return context;
};

export const HabitsProvider = ({ children }) => {
  const { setLoading, setError } = useAuth();
  const { refreshProfile, triggerLevelUp } = useProfile();
  const [habits, setHabits] = useState([]);

  const loadHabits = useCallback(async (profileId) => {
    try {
      setLoading(true);
      const res = await api.fetchHabits(profileId);
      setHabits(res.data.data);
    } catch (err) {
      setError(getErrorMsg(err, "Failed to load habits"));
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError]);

  const addHabit = useCallback(async (payload) => {
    try {
      const res = await api.createHabit(payload);
      setHabits((prev) => [...prev, res.data.data]);
    } catch (err) {
      setError(getErrorMsg(err, "Failed to create habit"));
    }
  }, [setError]);

  const toggleHabitStatus = useCallback(async (id) => {
    try {
      const res = await api.toggleHabit(id);
      const { data: habitData, action, leveled_up, level, freeze_used, xp_change } = res.data;

      setHabits((prev) => prev.map((h) => (h.id === id ? habitData : h)));

      // Cross-domain: detect level-up
      if (leveled_up && level) {
        triggerLevelUp(level);
      }

      // Cross-domain: reload profile for updated XP, streak, freezes
      await refreshProfile();

      return { action, freeze_used, xp_change };
    } catch (err) {
      setError(getErrorMsg(err, "Failed to toggle habit"));
      return null;
    }
  }, [setError, refreshProfile, triggerLevelUp]);

  const removeHabit = useCallback(async (id) => {
    try {
      await api.deleteHabit(id);
      setHabits((prev) => prev.filter((h) => h.id !== id));
    } catch (err) {
      setError(getErrorMsg(err, "Failed to delete habit"));
    }
  }, [setError]);

  const value = { habits, loadHabits, addHabit, toggleHabitStatus, removeHabit };

  return <HabitsContext.Provider value={value}>{children}</HabitsContext.Provider>;
};
