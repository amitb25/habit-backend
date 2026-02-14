import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const THEME_KEY = "@hustlekit_theme";
const ACCENT_KEY = "@hustlekit_accent";
const FONTSIZE_KEY = "@hustlekit_fontsize";
const DEFAULT_TAB_KEY = "@hustlekit_default_tab";
const STREAK_WARNING_KEY = "@hustlekit_streak_warning";

const darkColors = {
  background: "#000000",
  card: "#0f0f0f",
  cardAlt: "#0a0a0a",
  cardElevated: "#141414",
  cardModal: "#0f0f0f",
  surface: "#080808",
  textPrimary: "#e0e0e0",
  textSubtitle: "#bfbfbf",
  textSecondary: "#8a8a8a",
  textTertiary: "#5c5c5c",
  textDim: "#383838",
  border: "#1c1c1c",
  borderLight: "#161616",
  borderMedium: "#242424",
  borderStrong: "#2e2e2e",
  borderHandle: "#3a3a3a",
  borderDivider: "#222222",
  modalOverlay: "#00000090",
  modalOverlayDark: "#000000a8",
  switchTrackOff: "#2a2a2a",
  tabInactiveText: "#6a6a6a",
  floatingBarBg: "#0a0a0ae0",
  floatingButtonBg: "#1a1a1a",
  chipInactiveBg: "#141414",
  progressTrack: "#1a1a1a",
  statusBarStyle: "light",
  // Chart/Heatmap
  chartBg: "#0a0a0a",
  chartLabel: "#666666",
  chartGridLine: "#1a1a1a",
  chartDotFill: "#0a0a0a",
  heatmapEmpty: "#0f0f0f",
  heatmapLow: "#162050",
  heatmapMedLow: "#1e40a0",
  heatmapMedHigh: "#3060d0",
  heatmapHigh: "#4f80f0",
  // Glass — solid clean cards (like workout tab), blur only on modals/drawer
  glassCard: "#0f0f0f",
  glassCardAlt: "#0a0a0a",
  glassCardElevated: "#141414",
  glassCardHero: "#0f0f0f",
  glassSurface: "#080808",
  glassBorder: "#1c1c1c",
  glassBorderLight: "#161616",
  glassBorderMedium: "#242424",
  glassBorderStrong: "#2e2e2e",
  glassHighlight: "#1c1c1c",
  glassChip: "#141414",
  glassChipBorder: "#1c1c1c",
  glassModal: "rgba(14,14,14,0.88)",
  glassDrawer: "rgba(10,10,10,0.92)",
  glassFloatingBar: "rgba(8,8,8,0.85)",
  glassInput: "#0a0a0a",
  glassProgressTrack: "#1a1a1a",
  blurIntensity: 50,
  blurTint: "dark",
  // Softer accent text colors for dark mode (less eye strain)
  accentBlue: "#6a94c8",
  accentGreen: "#4daa88",
  accentRed: "#c07070",
  accentYellow: "#c09a3a",
  accentOrange: "#c07838",
  accentGreenAlt: "#3ca060",
  accentGold: "#a88058",
};

const lightColors = {
  background: "#f2f2f7",
  card: "#ffffff",
  cardAlt: "#f8f8fa",
  cardElevated: "#ffffff",
  cardModal: "#ffffff",
  surface: "#ebebf0",
  textPrimary: "#1c1c1e",
  textSubtitle: "#2c2c2e",
  textSecondary: "#48484a",
  textTertiary: "#6e6e73",
  textDim: "#aeaeb2",
  border: "#d1d1d6",
  borderLight: "#e0e0e5",
  borderMedium: "#c7c7cc",
  borderStrong: "#b0b0b6",
  borderHandle: "#b0b0b6",
  borderDivider: "#c7c7cc",
  modalOverlay: "#00000040",
  modalOverlayDark: "#00000060",
  switchTrackOff: "#c7c7cc",
  tabInactiveText: "#6e6e73",
  floatingBarBg: "#ffffffef",
  floatingButtonBg: "#f0f0f5",
  chipInactiveBg: "#e8e8ed",
  progressTrack: "#dddde2",
  statusBarStyle: "dark",
  // Chart/Heatmap
  chartBg: "#f8f8fa",
  chartLabel: "#6e6e73",
  chartGridLine: "#e8e8ed",
  chartDotFill: "#ffffff",
  heatmapEmpty: "#ebebf0",
  heatmapLow: "#c7d9fc",
  heatmapMedLow: "#8db4fa",
  heatmapMedHigh: "#5b92f5",
  heatmapHigh: "#3672e8",
  // Glass — solid clean cards (like workout tab), blur only on modals/drawer
  glassCard: "#ffffff",
  glassCardAlt: "#f8f8fa",
  glassCardElevated: "#ffffff",
  glassCardHero: "#ffffff",
  glassSurface: "#f8f8fa",
  glassBorder: "#e0e0e5",
  glassBorderLight: "#e8e8ed",
  glassBorderMedium: "#d1d1d6",
  glassBorderStrong: "#c7c7cc",
  glassHighlight: "#ffffff",
  glassChip: "#f0f0f5",
  glassChipBorder: "#e0e0e5",
  glassModal: "rgba(255,255,255,0.88)",
  glassDrawer: "rgba(248,248,252,0.92)",
  glassFloatingBar: "rgba(255,255,255,0.85)",
  glassInput: "#f8f8fa",
  glassProgressTrack: "#e8e8ed",
  blurIntensity: 60,
  blurTint: "light",
  // Accent text colors (same as hardcoded for light mode)
  accentBlue: "#4078e0",
  accentGreen: "#2bb883",
  accentRed: "#e05555",
  accentYellow: "#e0a820",
  accentOrange: "#e06612",
  accentGreenAlt: "#1eac50",
  accentGold: "#c09460",
};

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(true);
  const [accentColor, setAccentColorState] = useState("#4078e0");
  const [fontSize, setFontSizeState] = useState("medium");
  const [defaultTab, setDefaultTabState] = useState("dashboard");
  const [streakWarning, setStreakWarningState] = useState(true);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    Promise.all([
      AsyncStorage.getItem(THEME_KEY),
      AsyncStorage.getItem(ACCENT_KEY),
      AsyncStorage.getItem(FONTSIZE_KEY),
      AsyncStorage.getItem(DEFAULT_TAB_KEY),
      AsyncStorage.getItem(STREAK_WARNING_KEY),
    ])
      .then(([themeVal, accentVal, fontVal, tabVal, streakVal]) => {
        if (themeVal === "light") setIsDark(false);
        if (accentVal) setAccentColorState(accentVal);
        if (fontVal) setFontSizeState(fontVal);
        if (tabVal) setDefaultTabState(tabVal);
        if (streakVal !== null) setStreakWarningState(streakVal !== "false");
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, []);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    AsyncStorage.setItem(THEME_KEY, next ? "dark" : "light").catch(() => {});
  };

  const setAccentColor = (color) => {
    setAccentColorState(color);
    AsyncStorage.setItem(ACCENT_KEY, color).catch(() => {});
  };

  const setFontSize = (size) => {
    setFontSizeState(size);
    AsyncStorage.setItem(FONTSIZE_KEY, size).catch(() => {});
  };

  const setDefaultTab = (tab) => {
    setDefaultTabState(tab);
    AsyncStorage.setItem(DEFAULT_TAB_KEY, tab).catch(() => {});
  };

  const setStreakWarning = (val) => {
    setStreakWarningState(val);
    AsyncStorage.setItem(STREAK_WARNING_KEY, val ? "true" : "false").catch(() => {});
  };

  const colors = isDark ? darkColors : lightColors;

  const cardShadow = isDark
    ? {}
    : {
        shadowColor: "#000000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 10,
        elevation: 3,
      };

  const cardShadowLg = isDark
    ? {}
    : {
        shadowColor: "#000000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 18,
        elevation: 6,
      };

  const glassShadow = isDark
    ? {
        shadowColor: "#000000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 4,
      }
    : {
        shadowColor: "#000000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 18,
        elevation: 5,
      };

  const glassShadowLg = isDark
    ? {
        shadowColor: "#000000",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
        elevation: 8,
      }
    : {
        shadowColor: "#000000",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.16,
        shadowRadius: 26,
        elevation: 10,
      };

  if (!loaded) return null;

  return (
    <ThemeContext.Provider value={{ colors, isDark, toggleTheme, cardShadow, cardShadowLg, glassShadow, glassShadowLg, accentColor, setAccentColor, fontSize, setFontSize, defaultTab, setDefaultTab, streakWarning, setStreakWarning }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
