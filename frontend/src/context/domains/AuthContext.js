import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { useToast } from "../ToastContext";

// Extract a clean string from any error
export const getErrorMsg = (err, fallback) => {
  const msg = err?.response?.data?.message;
  if (typeof msg === "string") return msg;
  if (err?.message === "Network Error")
    return "Could not connect to server. Please check your internet or make sure the backend is running.";
  if (err?.code === "ECONNABORTED") return "Request timed out. Please try again.";
  return fallback;
};

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};

export const AuthProvider = ({ children, user, onLogout }) => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Show error as toast whenever it changes
  useEffect(() => {
    if (error) {
      showToast(error, "error");
      setError(null);
    }
  }, [error]);

  const clearError = useCallback(() => setError(null), []);

  const value = {
    user,
    onLogout,
    loading,
    setLoading,
    error,
    setError,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
