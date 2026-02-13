import React, { useState, useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, Dimensions } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StatusBar } from "expo-status-bar";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { Video, ResizeMode } from "expo-av";
import * as SplashScreen from "expo-splash-screen";
import { GlobalProvider } from "./src/context/GlobalContext";

import LoginScreen from "./src/screens/LoginScreen";
import HomeScreen from "./src/screens/HomeScreen";
import ProfileScreen from "./src/screens/ProfileScreen";
import WeeklyReportScreen from "./src/screens/WeeklyReportScreen";
import HabitDetailScreen from "./src/screens/HabitDetailScreen";
import DebtDetailScreen from "./src/screens/DebtDetailScreen";
import DailyTaskSheetScreen from "./src/screens/DailyTaskSheetScreen";

// Keep Expo Go splash hidden until our app is ready
SplashScreen.preventAutoHideAsync();

const Stack = createNativeStackNavigator();
const { width, height } = Dimensions.get("window");

const screenOptions = {
  headerStyle: { backgroundColor: "#0a0a0f" },
  headerTintColor: "#ffffff",
  headerTitleStyle: { fontWeight: "bold" },
  contentStyle: { backgroundColor: "#0a0a0f" },
};

function MainNavigator() {
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen name="HomeMain" component={HomeScreen} options={{ headerShown: false }} />
      <Stack.Screen name="DailyTaskSheet" component={DailyTaskSheetScreen} options={{ headerShown: false }} />
      <Stack.Screen name="WeeklyReport" component={WeeklyReportScreen} options={{ headerShown: false }} />
      <Stack.Screen name="HabitDetail" component={HabitDetailScreen} options={{ title: "Habit Details" }} />
      <Stack.Screen name="DebtDetail" component={DebtDetailScreen} options={{ title: "Debt Details" }} />
      <Stack.Screen name="Profile" component={ProfileScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
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
        <Text style={{ color: "#ffffff", fontSize: 28, fontWeight: "900", letterSpacing: 1 }}>
          HustleKit
        </Text>
        <Text style={{ color: "#ffffff80", fontSize: 12, marginTop: 6, letterSpacing: 0.5 }}>
          Hustle Every Day
        </Text>
      </View>
    </View>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const stored = await AsyncStorage.getItem("hustlekit_user");
      if (stored) setUser(JSON.parse(stored));
    } catch (e) {}
    setChecking(false);
  };

  const handleLogin = async (userData) => {
    setUser(userData);
    await AsyncStorage.setItem("hustlekit_user", JSON.stringify(userData));
  };

  const handleLogout = async () => {
    setUser(null);
    await AsyncStorage.removeItem("hustlekit_user");
  };

  if (showSplash) {
    return <CustomSplash onFinish={() => setShowSplash(false)} />;
  }

  if (checking) {
    return (
      <View style={{ flex: 1, backgroundColor: "#0a0a0f", justifyContent: "center", alignItems: "center" }}>
        <StatusBar style="light" />
        <View
          style={{
            width: 80,
            height: 80,
            borderRadius: 24,
            backgroundColor: "#4f8cff12",
            justifyContent: "center",
            alignItems: "center",
            borderWidth: 1,
            borderColor: "#4f8cff25",
            marginBottom: 20,
          }}
        >
          <Text style={{ fontSize: 40 }}>{"\u{1F525}"}</Text>
        </View>
        <Text style={{ color: "#ffffff", fontSize: 32, fontWeight: "900", letterSpacing: 1 }}>
          HustleKit
        </Text>
        <Text style={{ color: "#6b7280", fontSize: 13, marginTop: 8, letterSpacing: 0.5 }}>
          Track. Grind. Level Up.
        </Text>
      </View>
    );
  }

  if (!user) {
    return (
      <>
        <StatusBar style="light" />
        <LoginScreen onLogin={handleLogin} />
      </>
    );
  }

  return (
    <GlobalProvider user={user} onLogout={handleLogout}>
      <NavigationContainer>
        <StatusBar style="light" />
        <MainNavigator />
      </NavigationContainer>
    </GlobalProvider>
  );
}
