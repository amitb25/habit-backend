import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useGlobal } from "../context/GlobalContext";
import { useTheme } from "../context/ThemeContext";
import ManifestationBox from "../components/ManifestationBox";
import DailyQuote from "../components/DailyQuote";
import WeeklyBarChart from "../components/charts/WeeklyBarChart";
import { fetchHabitAnalytics } from "../services/api";
import { getGreeting, formatINR, getPercentage, toDateString } from "../utils/helpers";

const DashboardScreen = ({ navigation, onSwitchTab }) => {
  const {
    user,
    profile,
    habits,
    debts,
    debtSummary,
    dailyTaskSummary,
    loading,
    loadProfile,
    loadHabits,
    loadDebts,
    loadDailyTasks,
    saveManifestation,
  } = useGlobal();

  const { colors, isDark, cardShadow, cardShadowLg, glassShadow, glassShadowLg } = useTheme();

  const [refreshing, setRefreshing] = useState(false);
  const [analyticsData, setAnalyticsData] = useState(null);

  useEffect(() => {
    if (user?.id) loadAll();
  }, [user]);

  const loadAll = async () => {
    await Promise.all([
      loadProfile(user.id),
      loadHabits(user.id),
      loadDebts(user.id),
      loadDailyTasks(user.id, toDateString(new Date())),
    ]);
    // Fetch analytics separately (non-blocking)
    try {
      const res = await fetchHabitAnalytics(user.id);
      setAnalyticsData(res.data.data);
    } catch (_) {}
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAll();
    setRefreshing(false);
  };

  const completedToday = habits.filter((h) => h.is_completed_today).length;
  const totalHabits = habits.length;
  const habitPercent = totalHabits > 0 ? Math.round((completedToday / totalHabits) * 100) : 0;
  const bestStreak = habits.length > 0 ? Math.max(...habits.map((h) => h.current_streak)) : 0;
  const overallDebtPercent = getPercentage(debtSummary.total_paid, debtSummary.total_debt);
  const activeDebts = debts.filter((d) => !d.is_cleared).length;
  const totalStreakDays = habits.reduce((sum, h) => sum + h.current_streak, 0);
  const taskTotal = dailyTaskSummary.total;
  const taskDone = dailyTaskSummary.completed;
  const taskPending = dailyTaskSummary.pending;
  const taskPercent = taskTotal > 0 ? Math.round((taskDone / taskTotal) * 100) : 0;
  const taskAllDone = taskTotal > 0 && taskDone === taskTotal;

  if (loading && !refreshing && !profile) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color="#4078e0" />
      </View>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#4078e0" />}
    >
      {/* Greeting */}
      <Text style={{ color: colors.textTertiary, fontSize: 13, marginBottom: 16 }}>{getGreeting()}</Text>

      {/* Hero Card — Today's Progress */}
      <TouchableOpacity
        onPress={() => onSwitchTab?.("habits")}
        activeOpacity={0.85}
        style={{
          backgroundColor: colors.glassCardHero,
          borderRadius: 24,
          padding: 22,
          marginBottom: 12,
          borderWidth: 1,
          borderColor: isDark ? "#84643820" : "#84643840",
          ...(isDark ? { shadowColor: "#846438", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 16, elevation: 6 } : glassShadowLg),
        }}
      >
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 14 }}>
              <View style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: "#84643820", justifyContent: "center", alignItems: "center" }}>
                <Ionicons name="checkmark-circle" size={18} color="#c09460" />
              </View>
              <Text style={{ color: "#c09460", fontSize: 13, fontWeight: "600" }}>Today's Progress</Text>
            </View>
            <Text style={{ color: "#d4b888", fontSize: 48, fontWeight: "900", letterSpacing: -1 }}>
              {habitPercent}<Text style={{ fontSize: 24, color: "#c09460" }}>%</Text>
            </Text>
            <Text style={{ color: colors.textTertiary, fontSize: 13, marginTop: 6 }}>
              {completedToday} of {totalHabits} habits done
            </Text>
          </View>
          {/* Circular progress visual */}
          <View style={{ alignItems: "center", marginTop: 10 }}>
            <View
              style={{
                width: 72,
                height: 72,
                borderRadius: 36,
                borderWidth: 5,
                borderColor: colors.glassProgressTrack,
                justifyContent: "center",
                alignItems: "center",
                position: "relative",
              }}
            >
              <View
                style={{
                  position: "absolute",
                  width: 72,
                  height: 72,
                  borderRadius: 36,
                  borderWidth: 5,
                  borderColor: "transparent",
                  borderTopColor: habitPercent > 0 ? "#c09460" : "transparent",
                  borderRightColor: habitPercent > 25 ? "#c09460" : "transparent",
                  borderBottomColor: habitPercent > 50 ? "#c09460" : "transparent",
                  borderLeftColor: habitPercent > 75 ? "#c09460" : "transparent",
                }}
              />
              <Text style={{ color: "#d4b888", fontSize: 16, fontWeight: "800" }}>
                {completedToday}/{totalHabits}
              </Text>
            </View>
          </View>
        </View>
        {/* Progress bar */}
        <View style={{ height: 6, backgroundColor: colors.glassProgressTrack, borderRadius: 3, marginTop: 16 }}>
          <View
            style={{
              height: 6,
              width: `${Math.min(100, habitPercent)}%`,
              backgroundColor: "#c09460",
              borderRadius: 3,
            }}
          />
        </View>
      </TouchableOpacity>

      {/* Gamification Row — App Streak + XP/Level + Freeze */}
      <View style={{ flexDirection: "row", gap: 10, marginBottom: 12 }}>
        {/* App Streak */}
        <View
          style={{
            flex: 1,
            backgroundColor: colors.glassCardHero,
            borderRadius: 20,
            padding: 18,
            borderWidth: 1,
            borderColor: isDark ? "#e0555515" : "#e0555535",
            ...glassShadow,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 12 }}>
            <View style={{ width: 26, height: 26, borderRadius: 8, backgroundColor: "#e0555518", justifyContent: "center", alignItems: "center" }}>
              <Ionicons name="flame" size={14} color="#e05555" />
            </View>
            <Text style={{ color: colors.textSecondary, fontSize: 11, fontWeight: "600" }}>App Streak</Text>
          </View>
          <Text style={{ color: "#fca5a5", fontSize: 34, fontWeight: "900", letterSpacing: -1 }}>
            {profile?.app_streak || 0}
          </Text>
          <Text style={{ color: "#e0555590", fontSize: 11, fontWeight: "500", marginTop: 4 }}>
            Best: {profile?.longest_app_streak || 0}
          </Text>
        </View>

        {/* XP / Level */}
        <View
          style={{
            flex: 1,
            backgroundColor: colors.glassCardHero,
            borderRadius: 20,
            padding: 18,
            borderWidth: 1,
            borderColor: isDark ? "#e0a82015" : "#e0a82035",
            ...glassShadow,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 12 }}>
            <View style={{ width: 26, height: 26, borderRadius: 8, backgroundColor: "#e0a82018", justifyContent: "center", alignItems: "center" }}>
              <Ionicons name="star" size={14} color="#e0a820" />
            </View>
            <Text style={{ color: colors.textSecondary, fontSize: 11, fontWeight: "600" }}>Level</Text>
          </View>
          <Text style={{ color: "#fde68a", fontSize: 34, fontWeight: "900", letterSpacing: -1 }}>
            {profile?.level || 1}
          </Text>
          {/* XP progress bar */}
          <View style={{ height: 4, backgroundColor: colors.glassProgressTrack, borderRadius: 2, marginTop: 8 }}>
            <View
              style={{
                height: 4,
                width: `${(profile?.xp || 0) % 100}%`,
                backgroundColor: "#e0a820",
                borderRadius: 2,
              }}
            />
          </View>
          <Text style={{ color: "#e0a82090", fontSize: 10, fontWeight: "500", marginTop: 4 }}>
            {(profile?.xp || 0) % 100}/100 XP
          </Text>
        </View>
      </View>

      {/* Row — Freeze + Best Streak */}
      <View style={{ flexDirection: "row", gap: 10, marginBottom: 12 }}>
        {/* Streak Freeze */}
        <View
          style={{
            flex: 1,
            backgroundColor: colors.glassCardHero,
            borderRadius: 20,
            padding: 18,
            borderWidth: 1,
            borderColor: isDark ? "#30a5d815" : "#30a5d835",
            ...glassShadow,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 12 }}>
            <View style={{ width: 26, height: 26, borderRadius: 8, backgroundColor: "#30a5d818", justifyContent: "center", alignItems: "center" }}>
              <Ionicons name="snow" size={14} color="#30a5d8" />
            </View>
            <Text style={{ color: colors.textSecondary, fontSize: 11, fontWeight: "600" }}>Freezes</Text>
          </View>
          <Text style={{ color: "#7dd3fc", fontSize: 34, fontWeight: "900", letterSpacing: -1 }}>
            {profile?.streak_freezes_available || 0}
          </Text>
          <Text style={{ color: "#30a5d890", fontSize: 11, fontWeight: "500", marginTop: 4 }}>streak shields</Text>
        </View>

        {/* Best Streak */}
        <TouchableOpacity
          onPress={() => onSwitchTab?.("habits")}
          activeOpacity={0.85}
          style={{
            flex: 1,
            backgroundColor: colors.glassCardHero,
            borderRadius: 20,
            padding: 18,
            borderWidth: 1,
            borderColor: isDark ? "#e0a82015" : "#e0a82035",
            ...glassShadow,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 12 }}>
            <View style={{ width: 26, height: 26, borderRadius: 8, backgroundColor: "#e0a82018", justifyContent: "center", alignItems: "center" }}>
              <Ionicons name="flash" size={14} color="#e0a820" />
            </View>
            <Text style={{ color: colors.textSecondary, fontSize: 11, fontWeight: "600" }}>Best Streak</Text>
          </View>
          <Text style={{ color: "#fde68a", fontSize: 34, fontWeight: "900", letterSpacing: -1 }}>
            {bestStreak}
          </Text>
          <Text style={{ color: "#e0a82090", fontSize: 11, fontWeight: "500", marginTop: 4 }}>days in a row</Text>
        </TouchableOpacity>
      </View>

      {/* Row — 2 column grid */}
      <View style={{ flexDirection: "row", gap: 10, marginBottom: 12 }}>
        {/* Debt Progress */}
        <TouchableOpacity
          onPress={() => onSwitchTab?.("debts")}
          activeOpacity={0.85}
          style={{
            flex: 1,
            backgroundColor: colors.glassCardHero,
            borderRadius: 20,
            padding: 18,
            borderWidth: 1,
            borderColor: isDark ? "#3b82f615" : "#3b82f635",
            ...glassShadow,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 12 }}>
            <View style={{ width: 26, height: 26, borderRadius: 8, backgroundColor: "#3b82f618", justifyContent: "center", alignItems: "center" }}>
              <Ionicons name="trending-up" size={14} color="#5494e0" />
            </View>
            <Text style={{ color: colors.textSecondary, fontSize: 11, fontWeight: "600" }}>Debt Cleared</Text>
          </View>
          <Text style={{ color: "#93c5fd", fontSize: 34, fontWeight: "900", letterSpacing: -1 }}>
            {overallDebtPercent}<Text style={{ fontSize: 18, color: "#5494e0" }}>%</Text>
          </Text>
          <View style={{ height: 4, backgroundColor: colors.glassProgressTrack, borderRadius: 4, marginTop: 10 }}>
            <View
              style={{
                height: 4,
                width: `${Math.min(100, overallDebtPercent)}%`,
                backgroundColor: overallDebtPercent >= 100 ? "#2bb883" : "#5494e0",
                borderRadius: 4,
              }}
            />
          </View>
        </TouchableOpacity>

        {/* Active Debts */}
        <TouchableOpacity
          onPress={() => onSwitchTab?.("debts")}
          activeOpacity={0.85}
          style={{
            flex: 1,
            backgroundColor: colors.glassCardHero,
            borderRadius: 20,
            padding: 18,
            borderWidth: 1,
            borderColor: isDark ? "#d43c3c15" : "#d43c3c35",
            ...glassShadow,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 12 }}>
            <View style={{ width: 26, height: 26, borderRadius: 8, backgroundColor: "#d43c3c18", justifyContent: "center", alignItems: "center" }}>
              <Ionicons name="wallet" size={14} color="#e05555" />
            </View>
            <Text style={{ color: colors.textSecondary, fontSize: 11, fontWeight: "600" }}>Active Debts</Text>
          </View>
          <Text style={{ color: "#fca5a5", fontSize: 34, fontWeight: "900", letterSpacing: -1 }}>
            {activeDebts}
          </Text>
          <Text style={{ color: "#e05555", fontSize: 11, fontWeight: "600", marginTop: 4 }}>
            {formatINR(debtSummary.total_remaining)} left
          </Text>
        </TouchableOpacity>
      </View>

      {/* Weekly Completions Chart */}
      {analyticsData?.weeklyCompletions && (
        <WeeklyBarChart data={analyticsData.weeklyCompletions} />
      )}

      {/* Daily Tasks Progress */}
      <TouchableOpacity
        onPress={() => navigation.navigate("DailyTaskSheet")}
        activeOpacity={0.85}
        style={{
          backgroundColor: colors.glassCardHero,
          borderRadius: 20,
          padding: 20,
          marginBottom: 12,
          borderWidth: 1,
          borderColor: isDark ? "#4078e015" : "#4078e035",
          ...glassShadow,
        }}
      >
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <View style={{ width: 30, height: 30, borderRadius: 9, backgroundColor: "#4078e018", justifyContent: "center", alignItems: "center" }}>
              <Ionicons name="today" size={16} color="#4078e0" />
            </View>
            <Text style={{ color: "#4078e0", fontSize: 13, fontWeight: "700" }}>Today's Tasks</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color="#4078e060" />
        </View>

        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 14 }}>
          <View>
            <Text style={{ color: taskAllDone ? "#2bb883" : "#93c5fd", fontSize: 40, fontWeight: "900", letterSpacing: -1 }}>
              {taskPercent}<Text style={{ fontSize: 20, color: taskAllDone ? "#2bb88390" : "#4078e0" }}>%</Text>
            </Text>
            <Text style={{ color: colors.textTertiary, fontSize: 12, marginTop: 2 }}>
              {taskDone} of {taskTotal} tasks done
            </Text>
          </View>
          <View style={{ flexDirection: "row", gap: 16, marginBottom: 4 }}>
            <View style={{ alignItems: "center" }}>
              <Text style={{ color: "#2bb883", fontSize: 20, fontWeight: "800" }}>{taskDone}</Text>
              <Text style={{ color: colors.textTertiary, fontSize: 10 }}>Done</Text>
            </View>
            <View style={{ alignItems: "center" }}>
              <Text style={{ color: "#d88c0a", fontSize: 20, fontWeight: "800" }}>{taskPending}</Text>
              <Text style={{ color: colors.textTertiary, fontSize: 10 }}>Pending</Text>
            </View>
          </View>
        </View>

        {/* Progress bar */}
        <View style={{ height: 5, backgroundColor: colors.glassProgressTrack, borderRadius: 3 }}>
          <View
            style={{
              height: 5,
              width: `${Math.min(100, taskPercent)}%`,
              backgroundColor: taskAllDone ? "#2bb883" : "#4078e0",
              borderRadius: 3,
            }}
          />
        </View>
      </TouchableOpacity>

      {/* Manifestation */}
      <ManifestationBox
        manifestation={profile?.manifestation}
        onSave={(text) => saveManifestation(user.id, text)}
      />

      {/* Daily Quote */}
      <DailyQuote />

    </ScrollView>
  );
};

export default DashboardScreen;
