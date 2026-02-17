import React, { createContext, useContext, useState, useCallback } from "react";
import * as api from "../../services/api";
import { useAuth, getErrorMsg } from "./AuthContext";

const WaterContext = createContext();

export const useWater = () => {
  const context = useContext(WaterContext);
  if (!context) throw new Error("useWater must be used within WaterProvider");
  return context;
};

export const WaterProvider = ({ children }) => {
  const { setError } = useAuth();
  const [todayWater, setTodayWater] = useState({ glasses: 0, goal: 8 });
  const [waterAnalytics, setWaterAnalytics] = useState(null);

  const loadWater = useCallback(async (profileId, date) => {
    try {
      const res = await api.fetchWaterIntake(profileId, date);
      setTodayWater({
        id: res.data.data.id,
        glasses: res.data.data.glasses || 0,
        goal: res.data.data.goal || 8,
        log_date: res.data.data.log_date,
      });
    } catch (err) {
      setError(getErrorMsg(err, "Failed to load water intake"));
    }
  }, [setError]);

  const addGlass = useCallback(async (profileId) => {
    try {
      const res = await api.addWaterGlass({ profile_id: profileId });
      setTodayWater({
        id: res.data.data.id,
        glasses: res.data.data.glasses,
        goal: res.data.data.goal,
        log_date: res.data.data.log_date,
      });
    } catch (err) {
      setError(getErrorMsg(err, "Failed to add glass"));
    }
  }, [setError]);

  const removeGlass = useCallback(async (profileId) => {
    try {
      const res = await api.removeWaterGlass({ profile_id: profileId });
      setTodayWater({
        id: res.data.data.id,
        glasses: res.data.data.glasses,
        goal: res.data.data.goal,
        log_date: res.data.data.log_date,
      });
    } catch (err) {
      setError(getErrorMsg(err, "Failed to remove glass"));
    }
  }, [setError]);

  const updateGoal = useCallback(async (profileId, goal) => {
    try {
      const res = await api.updateWaterGoal({ profile_id: profileId, goal });
      setTodayWater((prev) => ({ ...prev, goal: res.data.data.goal }));
    } catch (err) {
      setError(getErrorMsg(err, "Failed to update goal"));
    }
  }, [setError]);

  const loadAnalytics = useCallback(async (profileId) => {
    try {
      const res = await api.fetchWaterAnalytics(profileId);
      setWaterAnalytics(res.data.data);
    } catch (err) {
      setError(getErrorMsg(err, "Failed to load water analytics"));
    }
  }, [setError]);

  const value = {
    todayWater,
    waterAnalytics,
    loadWater,
    addGlass,
    removeGlass,
    updateGoal,
    loadAnalytics,
  };

  return <WaterContext.Provider value={value}>{children}</WaterContext.Provider>;
};
