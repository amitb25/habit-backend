import React, { useState, useEffect, useRef } from "react";
import { View, Text, Image, TouchableOpacity, Dimensions, AppState } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StatusBar } from "expo-status-bar";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { Video, ResizeMode } from "expo-av";
import * as SplashScreen from "expo-splash-screen";
import { useProfile } from "./src/context/domains/ProfileContext";
import { ThemeProvider, useTheme } from "./src/context/ThemeContext";
import { ToastProvider } from "./src/context/ToastContext";
import {
  AuthProvider,
  ProfileProvider,
  HabitsProvider,
  DebtsProvider,
  DailyTasksProvider,
  FinanceProvider,
  GoalsProvider,
  AffirmationsProvider,
  TabVisibilityProvider,
  WaterProvider,
  SleepProvider,
} from "./src/context/domains";
import Toast from "./src/components/Toast";
import LevelUpModal from "./src/components/LevelUpModal";
import { requestNotificationPermissions, rescheduleAll } from "./src/services/notifications";
import { fetchNotificationPrefs } from "./src/services/api";
import { getLockSettings } from "./src/services/appLock";
import AppLockScreen from "./src/screens/AppLockScreen";

import LoginScreen from "./src/screens/LoginScreen";
import HomeScreen from "./src/screens/HomeScreen";
import ProfileScreen from "./src/screens/ProfileScreen";
import WeeklyReportScreen from "./src/screens/WeeklyReportScreen";
import HabitDetailScreen from "./src/screens/HabitDetailScreen";
import DebtDetailScreen from "./src/screens/DebtDetailScreen";
import DailyTaskSheetScreen from "./src/screens/DailyTaskSheetScreen";
import SettingsScreen from "./src/screens/SettingsScreen";

// Keep Expo Go splash hidden until our app is ready
SplashScreen.preventAutoHideAsync();

const Stack = createNativeStackNavigator();
const { width, height } = Dimensions.get("window");

function MainNavigator() {
  const { colors } = useTheme();

  const screenOptions = {
    headerStyle: { backgroundColor: colors.background },
    headerTintColor: colors.textPrimary,
    headerTitleStyle: { fontWeight: "bold" },
    contentStyle: { backgroundColor: colors.background },
  };

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen name="HomeMain" component={HomeScreen} options={{ headerShown: false }} />
      <Stack.Screen name="DailyTaskSheet" component={DailyTaskSheetScreen} options={{ headerShown: false }} />
      <Stack.Screen name="WeeklyReport" component={WeeklyReportScreen} options={{ headerShown: false }} />
      <Stack.Screen name="HabitDetail" component={HabitDetailScreen} options={{ title: "Habit Details" }} />
      <Stack.Screen name="DebtDetail" component={DebtDetailScreen} options={{ title: "Debt Details" }} />
      <Stack.Screen name="Profile" component={ProfileScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Settings" component={SettingsScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}

function AppWithGamification() {
  const { levelUpInfo, dismissLevelUp } = useProfile();
  const { colors } = useTheme();

  return (
    <>
      <NavigationContainer>
        <StatusBar style={colors.statusBarStyle} />
        <MainNavigator />
      </NavigationContainer>
      <LevelUpModal
        visible={!!levelUpInfo}
        level={levelUpInfo?.level}
        onDismiss={dismissLevelUp}
      />
    </>
  );
}

function CustomSplash({ onFinish }) {
  const videoRef = useRef(null);

  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: "#000000" }}>
      <StatusBar style="light" />
      <Video
        ref={videoRef}
        source={require("./assets/splash-video.mp4")}
        style={{ width, height }}
        resizeMode={ResizeMode.COVER}
        shouldPlay
        isLooping={false}
        isMuted={false}
        onPlaybackStatusUpdate={(status) => {
          if (status.didJustFinish) {
            onFinish();
          }
        }}
      />
      {/* App name at bottom */}
      <View
        style={{
          position: "absolute",
          bottom: 60,
          left: 0,
          right: 0,
          alignItems: "center",
        }}
      >
        <Image
          source={require("./assets/logo.png")}
          style={{ width: 180, height: 80 }}
          resizeMode="contain"
        />
      </View>
    </View>
  );
}

function AppContent() {
  const { colors } = useTheme();
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);
  const [showSplash, setShowSplash] = useState(true);
  const [isLocked, setIsLocked] = useState(false);
  const appStateRef = useRef(AppState.currentState);

  useEffect(() => {
    checkSession();
  }, []);

  // App lock: check on launch + listen for background→foreground
  useEffect(() => {
    const checkLock = async () => {
      const settings = await getLockSettings();
      if (settings.enabled) setIsLocked(true);
    };
    checkLock();

    const sub = AppState.addEventListener("change", async (nextState) => {
      if (
        appStateRef.current.match(/background/) &&
        nextState === "active"
      ) {
        const settings = await getLockSettings();
        if (settings.enabled) setIsLocked(true);
      }
      appStateRef.current = nextState;
    });
    return () => sub.remove();
  }, []);

  const checkSession = async () => {
    try {
      const stored = await AsyncStorage.getItem("hustlekit_user");
      if (stored) {
        const parsed = JSON.parse(stored);
        setUser(parsed);
        initNotifications(parsed.id);
      }
    } catch (e) {}
    setChecking(false);
  };

  const handleLogin = async (userData) => {
    setUser(userData);
    await AsyncStorage.setItem("hustlekit_user", JSON.stringify(userData));
    // Initialize notifications after login
    initNotifications(userData.id);
  };

  const initNotifications = async (userId) => {
    try {
      const granted = await requestNotificationPermissions();
      if (granted) {
        const res = await fetchNotificationPrefs(userId);
        if (res.data?.data) await rescheduleAll(res.data.data);
      }
    } catch (e) {
      // Non-critical - notifications are optional
    }
  };

  const handleLogout = async () => {
    // Clear Google Sign-In session so account picker shows next time
    try {
      const { GoogleSignin } = require("@react-native-google-signin/google-signin");
      await GoogleSignin.signOut();
    } catch (e) {
      // Google Sign-In not available (Expo Go) — ignore
    }
    setUser(null);
    await AsyncStorage.removeItem("hustlekit_user");
  };

  if (showSplash) {
    return <CustomSplash onFinish={() => setShowSplash(false)} />;
  }

  if (checking) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: "center", alignItems: "center" }}>
        <StatusBar style={colors.statusBarStyle} />
        <Image
          source={require("./assets/logo.png")}
          style={{ width: 220, height: 100 }}
          resizeMode="contain"
        />
      </View>
    );
  }

  if (!user) {
    return (
      <>
        <StatusBar style={colors.statusBarStyle} />
        <LoginScreen onLogin={handleLogin} />
      </>
    );
  }

  return (
    <AuthProvider user={user} onLogout={handleLogout}>
      <TabVisibilityProvider>
        <ProfileProvider>
          <HabitsProvider>
            <DebtsProvider>
              <DailyTasksProvider>
                <FinanceProvider>
                  <GoalsProvider>
                    <AffirmationsProvider>
                      <WaterProvider>
                        <SleepProvider>
                          <AppWithGamification />
                          {isLocked && (
                            <AppLockScreen onUnlock={() => setIsLocked(false)} />
                          )}
                        </SleepProvider>
                      </WaterProvider>
                    </AffirmationsProvider>
                  </GoalsProvider>
                </FinanceProvider>
              </DailyTasksProvider>
            </DebtsProvider>
          </HabitsProvider>
        </ProfileProvider>
      </TabVisibilityProvider>
    </AuthProvider>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AppContent />
        <Toast />
      </ToastProvider>
    </ThemeProvider>
  );
}
