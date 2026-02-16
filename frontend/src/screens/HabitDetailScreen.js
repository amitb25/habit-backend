import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, ActivityIndicator } from "react-native";
import { fetchHabitLogs } from "../services/api";
import { useHabits } from "../context/domains/HabitsContext";
import { useTheme } from "../context/ThemeContext";
import { categoryLabels, categoryColors, formatDate } from "../utils/helpers";
import MonthlyHeatmap from "../components/charts/MonthlyHeatmap";

const HabitDetailScreen = ({ route }) => {
  const { habitId } = route.params;
  const { habits } = useHabits();
  const { colors, isDark, cardShadow } = useTheme();
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
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: colors.background }}>
        <Text style={{ color: "#e05555" }}>Habit not found</Text>
      </View>
    );
  }

  const color = categoryColors[habit.category] || "#4078e0";

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ padding: 20 }}
    >
      {/* Habit header */}
      <View
        style={{
          backgroundColor: colors.glassCard,
          borderRadius: 16,
          padding: 24,
          marginBottom: 24,
          borderLeftWidth: 4,
          borderLeftColor: color,
          ...cardShadow,
        }}
      >
        <Text style={{ color: colors.textPrimary, fontSize: 24, fontWeight: "800" }}>
          {habit.title}
        </Text>
        <Text style={{ color: color, fontSize: 14, marginTop: 4 }}>
          {categoryLabels[habit.category]}
        </Text>
      </View>

      {/* Stats grid */}
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12, marginBottom: 24 }}>
        {[
          { label: "Current Streak", value: habit.current_streak, icon: "\u{1F525}", color: "#e05555" },
          { label: "Longest Streak", value: habit.longest_streak, icon: "\u{1F3C6}", color: "#e0a820" },
          { label: "Total Completions", value: habit.total_completions, icon: "\u2705", color: "#2bb883" },
          { label: "Status Today", value: habit.is_completed_today ? "Done" : "Pending", icon: habit.is_completed_today ? "\u{1F7E2}" : "\u{1F534}", color: habit.is_completed_today ? "#2bb883" : "#e05555" },
        ].map((stat) => (
          <View
            key={stat.label}
            style={{
              backgroundColor: colors.glassCardAlt,
              borderRadius: 14,
              padding: 18,
              width: "47%",
              alignItems: "center",
              ...cardShadow,
            }}
          >
            <Text style={{ fontSize: 24 }}>{stat.icon}</Text>
            <Text style={{ color: stat.color, fontSize: 28, fontWeight: "800", marginTop: 6 }}>
              {stat.value}
            </Text>
            <Text style={{ color: colors.textTertiary, fontSize: 11, marginTop: 4 }}>{stat.label}</Text>
          </View>
        ))}
      </View>

      {/* Monthly Heatmap */}
      {logs.length > 0 && (
        <MonthlyHeatmap
          data={(() => {
            const today = new Date();
            const heatmapData = [];
            const logDates = new Set(logs.map((l) => l.completed_date));
            for (let i = 29; i >= 0; i--) {
              const d = new Date(today);
              d.setDate(d.getDate() - i);
              const dateStr = d.toISOString().split("T")[0];
              heatmapData.push({ date: dateStr, count: logDates.has(dateStr) ? 1 : 0 });
            }
            return heatmapData;
          })()}
        />
      )}

      {/* Completion history */}
      <Text style={{ color: colors.textPrimary, fontSize: 18, fontWeight: "700", marginBottom: 14 }}>
        Recent Activity (Last 30)
      </Text>

      {loading ? (
        <ActivityIndicator color="#4078e0" />
      ) : logs.length === 0 ? (
        <Text style={{ color: colors.textTertiary, textAlign: "center", paddingVertical: 20 }}>
          No completions yet. Start your journey!
        </Text>
      ) : (
        logs.map((log, index) => (
          <View
            key={log.id}
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: colors.glassCardAlt,
              borderRadius: 10,
              padding: 14,
              marginBottom: 8,
            }}
          >
            <Text style={{ color: "#4078e0", fontSize: 16, marginRight: 12 }}>{"\u2713"}</Text>
            <Text style={{ color: colors.textSubtitle, fontSize: 14 }}>
              {formatDate(log.completed_date)}
            </Text>
            <View style={{ flex: 1 }} />
            <Text style={{ color: colors.textTertiary, fontSize: 12 }}>Day {logs.length - index}</Text>
          </View>
        ))
      )}
    </ScrollView>
  );
};

export default HabitDetailScreen;
