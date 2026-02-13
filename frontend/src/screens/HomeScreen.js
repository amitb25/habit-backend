import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Platform,
  StatusBar,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useGlobal } from "../context/GlobalContext";
import DashboardScreen from "./DashboardScreen";
import HabitsScreen from "./HabitsScreen";

import DebtsScreen from "./DebtsScreen";
import ExercisesScreen from "./ExercisesScreen";

const tabs = [
  { key: "dashboard", label: "Dashboard", icon: "grid-outline", iconActive: "grid", color: "#a78bfa" },
  { key: "habits", label: "Habits", icon: "flame-outline", iconActive: "flame", color: "#f87171" },
  { key: "workout", label: "Workout", icon: "barbell-outline", iconActive: "barbell", color: "#fbbf24" },
  { key: "debts", label: "Debts", icon: "wallet-outline", iconActive: "wallet", color: "#60a5fa" },
];

const HomeScreen = ({ navigation }) => {
  const { profile } = useGlobal();
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <View style={{ flex: 1, backgroundColor: "#0a0a0f" }}>
      {/* Header + Tabs */}
      <View
        style={{
          paddingTop: Platform.OS === "ios" ? 54 : (StatusBar.currentHeight || 24) + 10,
          backgroundColor: "#0a0a0f",
        }}
      >
        {/* App Header */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            paddingHorizontal: 20,
            marginBottom: 16,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <TouchableOpacity
              onPress={() => navigation.navigate("Profile")}
              activeOpacity={0.7}
              style={{
                width: 38,
                height: 38,
                borderRadius: 19,
                backgroundColor: "#7c3aed20",
                justifyContent: "center",
                alignItems: "center",
                marginRight: 10,
                borderWidth: 1,
                borderColor: "#7c3aed30",
                overflow: "hidden",
              }}
            >
              {profile?.avatar_url ? (
                <Image
                  source={{ uri: profile.avatar_url }}
                  style={{ width: 38, height: 38 }}
                />
              ) : (
                <Ionicons name="person" size={18} color="#a78bfa" />
              )}
            </TouchableOpacity>
            <Text style={{ color: "#ffffff", fontSize: 20, fontWeight: "800", letterSpacing: 0.5 }}>
              <Text style={{ color: "#9ca3af", fontWeight: "600" }}>Hi, </Text>{profile?.name?.split(" ")[0] || "Hey"}
            </Text>
          </View>

          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <TouchableOpacity
              onPress={() => navigation.navigate("DailyTaskSheet")}
              activeOpacity={0.7}
              style={{
                width: 38,
                height: 38,
                borderRadius: 12,
                backgroundColor: "#4f8cff12",
                justifyContent: "center",
                alignItems: "center",
                borderWidth: 1,
                borderColor: "#4f8cff25",
              }}
            >
              <Ionicons name="today" size={18} color="#4f8cff" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => navigation.navigate("WeeklyReport")}
              style={{
                width: 38,
                height: 38,
                borderRadius: 12,
                backgroundColor: "#ffffff08",
                justifyContent: "center",
                alignItems: "center",
                borderWidth: 1,
                borderColor: "#ffffff06",
              }}
            >
              <Ionicons name="stats-chart" size={18} color="#9ca3af" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {}}
              activeOpacity={0.7}
              style={{
                width: 38,
                height: 38,
                borderRadius: 12,
                backgroundColor: "#ffffff08",
                justifyContent: "center",
                alignItems: "center",
                borderWidth: 1,
                borderColor: "#ffffff06",
              }}
            >
              <Ionicons name="notifications-outline" size={20} color="#9ca3af" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Top Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 2 }}
          style={{ marginBottom: 2 }}
        >
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                onPress={() => setActiveTab(tab.key)}
                activeOpacity={0.7}
                style={{
                  marginRight: 8,
                  paddingHorizontal: 16,
                  paddingVertical: 9,
                  borderRadius: 24,
                  backgroundColor: isActive ? `${tab.color}18` : "#ffffff08",
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 6,
                  borderWidth: 1,
                  borderColor: isActive ? `${tab.color}30` : "#ffffff0a",
                }}
              >
                <Ionicons
                  name={isActive ? tab.iconActive : tab.icon}
                  size={14}
                  color={isActive ? tab.color : "#6b7280"}
                />
                <Text
                  style={{
                    color: isActive ? tab.color : "#8b95a5",
                    fontSize: 13,
                    fontWeight: isActive ? "700" : "500",
                  }}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Divider */}
        <View style={{ height: 1, backgroundColor: "#ffffff06", marginTop: 10 }} />
      </View>

      {/* Content */}
      <View style={{ flex: 1 }}>
        {activeTab === "dashboard" && <DashboardScreen navigation={navigation} onSwitchTab={setActiveTab} />}
        {activeTab === "habits" && <HabitsScreen navigation={navigation} />}
        {activeTab === "workout" && <ExercisesScreen />}

        {activeTab === "debts" && <DebtsScreen navigation={navigation} />}
      </View>

      {/* Floating Bottom Bar */}
      <View
        style={{
          position: "absolute",
          bottom: Platform.OS === "ios" ? 28 : 14,
          left: 0,
          right: 0,
          alignItems: "center",
        }}
        pointerEvents="box-none"
      >
        <View
          style={{
            backgroundColor: "#1a1a2acc",
            borderRadius: 24,
            paddingVertical: 10,
            paddingHorizontal: 40,
            borderWidth: 1,
            borderColor: "#ffffff10",
          }}
        >
          <TouchableOpacity
            onPress={() => setActiveTab("dashboard")}
            activeOpacity={0.8}
          >
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: 14,
                backgroundColor: "#2a2a3a",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Ionicons name="home" size={22} color="#ffffff" />
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default HomeScreen;
