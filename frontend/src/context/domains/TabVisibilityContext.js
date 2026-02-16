import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const TAB_VISIBILITY_KEY = "@hustlekit_tab_visibility";
const DEFAULT_TAB_VISIBILITY = { finance: true, goals: true, workout: true, debts: true };

const TabVisibilityContext = createContext();

export const useTabVisibility = () => {
  const context = useContext(TabVisibilityContext);
  if (!context) throw new Error("useTabVisibility must be used within TabVisibilityProvider");
  return context;
};

export const TabVisibilityProvider = ({ children }) => {
  const [tabVisibility, setTabVisibility] = useState(DEFAULT_TAB_VISIBILITY);

  useEffect(() => {
    AsyncStorage.getItem(TAB_VISIBILITY_KEY)
      .then((stored) => {
        if (stored) setTabVisibility({ ...DEFAULT_TAB_VISIBILITY, ...JSON.parse(stored) });
      })
      .catch(() => {});
  }, []);

  const toggleTabVisibility = useCallback(async (tabKey) => {
    setTabVisibility((prev) => {
      const updated = { ...prev, [tabKey]: !prev[tabKey] };
      AsyncStorage.setItem(TAB_VISIBILITY_KEY, JSON.stringify(updated)).catch(() => {});
      return updated;
    });
  }, []);

  return (
    <TabVisibilityContext.Provider value={{ tabVisibility, toggleTabVisibility }}>
      {children}
    </TabVisibilityContext.Provider>
  );
};
