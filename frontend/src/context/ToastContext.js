import React, { createContext, useContext, useState, useCallback, useRef } from "react";

const ToastContext = createContext();

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
};

export const ToastProvider = ({ children }) => {
  const [toast, setToast] = useState(null);
  const timerRef = useRef(null);

  const showToast = useCallback((message, type = "error") => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setToast({ message, type, key: Date.now() });
    timerRef.current = setTimeout(() => {
      setToast(null);
      timerRef.current = null;
    }, 3000);
  }, []);

  const hideToast = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = null;
    setToast(null);
  }, []);

  return (
    <ToastContext.Provider value={{ toast, showToast, hideToast }}>
      {children}
    </ToastContext.Provider>
  );
};
