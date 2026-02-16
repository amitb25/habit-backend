import React, { createContext, useContext, useState, useCallback } from "react";
import * as api from "../../services/api";
import { useAuth, getErrorMsg } from "./AuthContext";

const AffirmationsContext = createContext();

export const useAffirmations = () => {
  const context = useContext(AffirmationsContext);
  if (!context) throw new Error("useAffirmations must be used within AffirmationsProvider");
  return context;
};

export const AffirmationsProvider = ({ children }) => {
  const { setError } = useAuth();
  const [customAffirmations, setCustomAffirmations] = useState([]);

  const loadCustomAffirmations = useCallback(async (profileId) => {
    try {
      const res = await api.fetchCustomAffirmations(profileId);
      setCustomAffirmations(res.data.data);
    } catch (err) {
      setError(getErrorMsg(err, "Failed to load affirmations"));
    }
  }, [setError]);

  const addCustomAffirmation = useCallback(async (payload) => {
    try {
      const res = await api.createCustomAffirmation(payload);
      setCustomAffirmations((prev) => [res.data.data, ...prev]);
    } catch (err) {
      setError(getErrorMsg(err, "Failed to add affirmation"));
    }
  }, [setError]);

  const toggleAffirmationFav = useCallback(async (id) => {
    try {
      const res = await api.toggleAffirmationFavorite(id);
      setCustomAffirmations((prev) =>
        prev.map((a) => (a.id === id ? res.data.data : a))
      );
    } catch (err) {
      setError(getErrorMsg(err, "Failed to toggle favorite"));
    }
  }, [setError]);

  const removeCustomAffirmation = useCallback(async (id) => {
    try {
      await api.deleteCustomAffirmation(id);
      setCustomAffirmations((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      setError(getErrorMsg(err, "Failed to delete affirmation"));
    }
  }, [setError]);

  const value = {
    customAffirmations,
    loadCustomAffirmations,
    addCustomAffirmation,
    toggleAffirmationFav,
    removeCustomAffirmation,
  };

  return <AffirmationsContext.Provider value={value}>{children}</AffirmationsContext.Provider>;
};
