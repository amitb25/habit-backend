import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, ActivityIndicator } from "react-native";
import { fetchHabitLogs } from "../services/api";
import { useGlobal } from "../context/GlobalContext";
import { categoryLabels, categoryColors, formatDate } from "../utils/helpers";

const HabitDetailScreen = ({ route }) => {
  const { habitId } = route.params;
  const { habits } = useGlobal();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const habit = habits.find((h) => h.id === habitId);

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    try {
      const res = await fetchHabitLogs(habitId);
      setLogs(res.data.data);
    } catch (err) {
      console.error("Failed to load logs:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!habit) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#0a0a0f" }}>
        <Text style={{ color: "#f87171" }}>Habit not found</Text>
      </View>
    );
  }

  const color = categoryColors[habit.category] || "#4f8cff";

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "#0a0a0f" }}
      contentContainerStyle={{ padding: 20 }}
    >
      {/* Habit header */}
      <View
        style={{
          backgroundColor: "#1a1a2e",
          borderRadius: 16,
          padding: 24,
          marginBottom: 24,
          borderLeftWidth: 4,
          borderLeftColor: color,
        }}
      >
        <Text style={{ color: "#ffffff", fontSize: 24, fontWeight: "800" }}>
          {habit.title}
        </Text>
        <Text style={{ color: color, fontSize: 14, marginTop: 4 }}>
          {categoryLabels[habit.category]}
        </Text>
      </View>

      {/* Stats grid */}
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12, marginBottom: 24 }}>
        {[
          { label: "Current Streak", value: habit.current_streak, icon: "\u{1F525}", color: "#f87171" },
          { label: "Longest Streak", value: habit.longest_streak, icon: "\u{1F3C6}", color: "#fbbf24" },
          { label: "Total Completions", value: habit.total_completions, icon: "\u2705", color: "#34d399" },
          { label: "Status Today", value: habit.is_completed_today ? "Done" : "Pending", icon: habit.is_completed_today ? "\u{1F7E2}" : "\u{1F534}", color: habit.is_completed_today ? "#34d399" : "#f87171" },
        ].map((stat) => (
          <View
            key={stat.label}
            style={{
              backgroundColor: "#12121a",
              borderRadius: 14,
              padding: 18,
              width: "47%",
              alignItems: "center",
            }}
          >
            <Text style={{ fontSize: 24 }}>{stat.icon}</Text>
            <Text style={{ color: stat.color, fontSize: 28, fontWeight: "800", marginTop: 6 }}>
              {stat.value}
            </Text>
            <Text style={{ color: "#6b7280", fontSize: 11, marginTop: 4 }}>{stat.label}</Text>
          </View>
        ))}
      </View>

      {/* Completion history */}
      <Text style={{ color: "#ffffff", fontSize: 18, fontWeight: "700", marginBottom: 14 }}>
        Recent Activity (Last 30)
      </Text>

      {loading ? (
        <ActivityIndicator color="#4f8cff" />
      ) : logs.length === 0 ? (
        <Text style={{ color: "#6b7280", textAlign: "center", paddingVertical: 20 }}>
          No completions yet. Start your journey!
        </Text>
      ) : (
        logs.map((log, index) => (
          <View
            key={log.id}
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: "#12121a",
              borderRadius: 10,
              padding: 14,
              marginBottom: 8,
            }}
          >
            <Text style={{ color: "#4f8cff", fontSize: 16, marginRight: 12 }}>{"\u2713"}</Text>
            <Text style={{ color: "#e5e7eb", fontSize: 14 }}>
              {formatDate(log.completed_date)}
            </Text>
            <View style={{ flex: 1 }} />
            <Text style={{ color: "#6b7280", fontSize: 12 }}>Day {logs.length - index}</Text>
          </View>
        ))
      )}
    </ScrollView>
  );
};

export default HabitDetailScreen;
