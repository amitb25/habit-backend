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
import ManifestationBox from "../components/ManifestationBox";
import DailyQuote from "../components/DailyQuote";
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

  const [refreshing, setRefreshing] = useState(false);

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
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#0a0a0f" }}>
        <ActivityIndicator size="large" color="#4f8cff" />
      </View>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "#0a0a0f" }}
      contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#4f8cff" />}
    >
      {/* Greeting */}
      <Text style={{ color: "#6b7280", fontSize: 13, marginBottom: 16 }}>{getGreeting()}</Text>

      {/* Hero Card — Today's Progress */}
      <TouchableOpacity
        onPress={() => onSwitchTab?.("habits")}
        activeOpacity={0.85}
        style={{
          backgroundColor: "#111827",
          borderRadius: 24,
          padding: 22,
          marginBottom: 12,
          borderWidth: 1,
          borderColor: "#7c3aed20",
          shadowColor: "#7c3aed",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.15,
          shadowRadius: 16,
          elevation: 6,
        }}
      >
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 14 }}>
              <View style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: "#7c3aed20", justifyContent: "center", alignItems: "center" }}>
                <Ionicons name="checkmark-circle" size={18} color="#a78bfa" />
              </View>
              <Text style={{ color: "#a78bfa", fontSize: 13, fontWeight: "600" }}>Today's Progress</Text>
            </View>
            <Text style={{ color: "#c4b5fd", fontSize: 48, fontWeight: "900", letterSpacing: -1 }}>
              {habitPercent}<Text style={{ fontSize: 24, color: "#a78bfa" }}>%</Text>
            </Text>
            <Text style={{ color: "#6b7280", fontSize: 13, marginTop: 6 }}>
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
                borderColor: "#ffffff08",
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
                  borderTopColor: habitPercent > 0 ? "#a78bfa" : "transparent",
                  borderRightColor: habitPercent > 25 ? "#a78bfa" : "transparent",
                  borderBottomColor: habitPercent > 50 ? "#a78bfa" : "transparent",
                  borderLeftColor: habitPercent > 75 ? "#a78bfa" : "transparent",
                }}
              />
              <Text style={{ color: "#c4b5fd", fontSize: 16, fontWeight: "800" }}>
                {completedToday}/{totalHabits}
              </Text>
            </View>
          </View>
        </View>
        {/* Progress bar */}
        <View style={{ height: 6, backgroundColor: "#ffffff08", borderRadius: 3, marginTop: 16 }}>
          <View
            style={{
              height: 6,
              width: `${Math.min(100, habitPercent)}%`,
              backgroundColor: "#a78bfa",
              borderRadius: 3,
            }}
          />
        </View>
      </TouchableOpacity>

      {/* Row — 2 column grid */}
      <View style={{ flexDirection: "row", gap: 10, marginBottom: 12 }}>
        {/* Best Streak */}
        <TouchableOpacity
          onPress={() => onSwitchTab?.("habits")}
          activeOpacity={0.85}
          style={{
            flex: 1,
            backgroundColor: "#111827",
            borderRadius: 20,
            padding: 18,
            borderWidth: 1,
            borderColor: "#f8717115",
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 12 }}>
            <View style={{ width: 26, height: 26, borderRadius: 8, backgroundColor: "#f8717118", justifyContent: "center", alignItems: "center" }}>
              <Ionicons name="flame" size={14} color="#f87171" />
            </View>
            <Text style={{ color: "#9ca3af", fontSize: 11, fontWeight: "600" }}>Best Streak</Text>
          </View>
          <Text style={{ color: "#fca5a5", fontSize: 34, fontWeight: "900", letterSpacing: -1 }}>
            {bestStreak}
          </Text>
          <Text style={{ color: "#f8717190", fontSize: 11, fontWeight: "500", marginTop: 4 }}>days in a row</Text>
        </TouchableOpacity>

        {/* Total Streak Days */}
        <TouchableOpacity
          onPress={() => onSwitchTab?.("habits")}
          activeOpacity={0.85}
          style={{
            flex: 1,
            backgroundColor: "#111827",
            borderRadius: 20,
            padding: 18,
            borderWidth: 1,
            borderColor: "#fbbf2415",
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 12 }}>
            <View style={{ width: 26, height: 26, borderRadius: 8, backgroundColor: "#fbbf2418", justifyContent: "center", alignItems: "center" }}>
              <Ionicons name="flash" size={14} color="#fbbf24" />
            </View>
            <Text style={{ color: "#9ca3af", fontSize: 11, fontWeight: "600" }}>Total Streaks</Text>
          </View>
          <Text style={{ color: "#fde68a", fontSize: 34, fontWeight: "900", letterSpacing: -1 }}>
            {totalStreakDays}
          </Text>
          <Text style={{ color: "#fbbf2490", fontSize: 11, fontWeight: "500", marginTop: 4 }}>across all habits</Text>
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
            backgroundColor: "#111827",
            borderRadius: 20,
            padding: 18,
            borderWidth: 1,
            borderColor: "#3b82f615",
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 12 }}>
            <View style={{ width: 26, height: 26, borderRadius: 8, backgroundColor: "#3b82f618", justifyContent: "center", alignItems: "center" }}>
              <Ionicons name="trending-up" size={14} color="#60a5fa" />
            </View>
            <Text style={{ color: "#9ca3af", fontSize: 11, fontWeight: "600" }}>Debt Cleared</Text>
          </View>
          <Text style={{ color: "#93c5fd", fontSize: 34, fontWeight: "900", letterSpacing: -1 }}>
            {overallDebtPercent}<Text style={{ fontSize: 18, color: "#60a5fa" }}>%</Text>
          </Text>
          <View style={{ height: 4, backgroundColor: "#ffffff08", borderRadius: 4, marginTop: 10 }}>
            <View
              style={{
                height: 4,
                width: `${Math.min(100, overallDebtPercent)}%`,
                backgroundColor: overallDebtPercent >= 100 ? "#34d399" : "#60a5fa",
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
            backgroundColor: "#111827",
            borderRadius: 20,
            padding: 18,
            borderWidth: 1,
            borderColor: "#ef444415",
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 12 }}>
            <View style={{ width: 26, height: 26, borderRadius: 8, backgroundColor: "#ef444418", justifyContent: "center", alignItems: "center" }}>
              <Ionicons name="wallet" size={14} color="#f87171" />
            </View>
            <Text style={{ color: "#9ca3af", fontSize: 11, fontWeight: "600" }}>Active Debts</Text>
          </View>
          <Text style={{ color: "#fca5a5", fontSize: 34, fontWeight: "900", letterSpacing: -1 }}>
            {activeDebts}
          </Text>
          <Text style={{ color: "#f87171", fontSize: 11, fontWeight: "600", marginTop: 4 }}>
            {formatINR(debtSummary.total_remaining)} left
          </Text>
        </TouchableOpacity>
      </View>

      {/* Daily Tasks Progress */}
      <TouchableOpacity
        onPress={() => navigation.navigate("DailyTaskSheet")}
        activeOpacity={0.85}
        style={{
          backgroundColor: "#111827",
          borderRadius: 20,
          padding: 20,
          marginBottom: 12,
          borderWidth: 1,
          borderColor: "#4f8cff15",
        }}
      >
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <View style={{ width: 30, height: 30, borderRadius: 9, backgroundColor: "#4f8cff18", justifyContent: "center", alignItems: "center" }}>
              <Ionicons name="today" size={16} color="#4f8cff" />
            </View>
            <Text style={{ color: "#4f8cff", fontSize: 13, fontWeight: "700" }}>Today's Tasks</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color="#4f8cff60" />
        </View>

        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 14 }}>
          <View>
            <Text style={{ color: taskAllDone ? "#34d399" : "#93c5fd", fontSize: 40, fontWeight: "900", letterSpacing: -1 }}>
              {taskPercent}<Text style={{ fontSize: 20, color: taskAllDone ? "#34d39990" : "#4f8cff" }}>%</Text>
            </Text>
            <Text style={{ color: "#6b7280", fontSize: 12, marginTop: 2 }}>
              {taskDone} of {taskTotal} tasks done
            </Text>
          </View>
          <View style={{ flexDirection: "row", gap: 16, marginBottom: 4 }}>
            <View style={{ alignItems: "center" }}>
              <Text style={{ color: "#34d399", fontSize: 20, fontWeight: "800" }}>{taskDone}</Text>
              <Text style={{ color: "#6b7280", fontSize: 10 }}>Done</Text>
            </View>
            <View style={{ alignItems: "center" }}>
              <Text style={{ color: "#f59e0b", fontSize: 20, fontWeight: "800" }}>{taskPending}</Text>
              <Text style={{ color: "#6b7280", fontSize: 10 }}>Pending</Text>
            </View>
          </View>
        </View>

        {/* Progress bar */}
        <View style={{ height: 5, backgroundColor: "#ffffff08", borderRadius: 3 }}>
          <View
            style={{
              height: 5,
              width: `${Math.min(100, taskPercent)}%`,
              backgroundColor: taskAllDone ? "#34d399" : "#4f8cff",
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
