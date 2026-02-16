import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import * as api from "../../services/api";
import { useAuth, getErrorMsg } from "./AuthContext";
import {
  requestNotificationPermissions,
  scheduleDailyReminder,
  cancelAllReminders,
} from "../../services/notifications";

const ProfileContext = createContext();

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (!context) throw new Error("useProfile must be used within ProfileProvider");
  return context;
};

export const ProfileProvider = ({ children }) => {
  const { user, setLoading, setError } = useAuth();
  const [profile, setProfile] = useState(null);
  const [levelUpInfo, setLevelUpInfo] = useState(null);

  const loadProfile = useCallback(async (id) => {
    try {
      setLoading(true);
      const res = await api.fetchProfile(id);
      setProfile(res.data.data);
    } catch (err) {
      setError(getErrorMsg(err, "Failed to load profile"));
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError]);

  // Lightweight reload without loading spinner - used by HabitsContext after toggle
  const refreshProfile = useCallback(async () => {
    if (!user?.id) return;
    try {
      const res = await api.fetchProfile(user.id);
      setProfile(res.data.data);
    } catch {
      // Silent fail - the habit action itself already succeeded
    }
  }, [user?.id]);

  const saveManifestation = useCallback(async (id, text) => {
    try {
      const res = await api.updateManifestation(id, text);
      setProfile(res.data.data);
    } catch (err) {
      setError(getErrorMsg(err, "Failed to update manifestation"));
    }
  }, [setError]);

  const uploadAvatar = useCallback(async (id, base64Image) => {
    try {
      const res = await api.uploadAvatar(id, base64Image);
      setProfile(res.data.data);
    } catch (err) {
      setError(getErrorMsg(err, "Failed to upload avatar. Max size is 5 MB."));
      throw err;
    }
  }, [setError]);

  const updateNotificationSettings = useCallback(async (id, enabled, time) => {
    try {
      await api.updateProfile(id, {
        notifications_enabled: enabled,
        reminder_time: time,
      });

      if (enabled && time) {
        const [hour, minute] = time.split(":").map(Number);
        await requestNotificationPermissions();
        await scheduleDailyReminder(hour, minute);
      } else {
        await cancelAllReminders();
      }

      // Reload profile
      const res = await api.fetchProfile(id);
      setProfile(res.data.data);
    } catch (err) {
      setError(getErrorMsg(err, "Failed to update notification settings"));
    }
  }, [setError]);

  const dismissLevelUp = useCallback(() => setLevelUpInfo(null), []);

  // Exposed for HabitsContext to trigger level-up
  const triggerLevelUp = useCallback((level) => {
    setLevelUpInfo({ level });
  }, []);

  // Initialize notifications when profile loads
  useEffect(() => {
    if (profile?.notifications_enabled && profile?.reminder_time) {
      const [hour, minute] = profile.reminder_time.split(":").map(Number);
      requestNotificationPermissions()
        .then((granted) => {
          if (granted) scheduleDailyReminder(hour, minute);
        })
        .catch(() => {});
    }
  }, [profile?.id]);

  // Grant weekly freeze on app startup
  useEffect(() => {
    if (user?.id) {
      api.grantWeeklyFreeze(user.id).catch(() => {});
    }
  }, [user?.id]);

  const value = {
    profile,
    loadProfile,
    refreshProfile,
    saveManifestation,
    uploadAvatar,
    updateNotificationSettings,
    levelUpInfo,
    dismissLevelUp,
    triggerLevelUp,
  };

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
};
