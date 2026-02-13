import React from "react";
import { View, Text, ScrollView, TouchableOpacity, Platform, StatusBar, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useGlobal } from "../context/GlobalContext";
import ProgressBar from "../components/ProgressBar";
import { formatINR, getPercentage, categoryLabels, categoryColors } from "../utils/helpers";

const WeeklyReportScreen = ({ navigation }) => {
  const { profile, habits, debts, debtSummary, interviews, interviewSummary } = useGlobal();

  const completedToday = habits.filter((h) => h.is_completed_today).length;
  const totalHabits = habits.length;
  const totalCompletions = habits.reduce((sum, h) => sum + h.total_completions, 0);
  const bestStreak = habits.length > 0 ? Math.max(...habits.map((h) => h.longest_streak)) : 0;
  const avgStreak = habits.length > 0
    ? Math.round(habits.reduce((sum, h) => sum + h.current_streak, 0) / habits.length)
    : 0;

  const overallDebtPercent = getPercentage(debtSummary.total_paid, debtSummary.total_debt);

  // Calculate score (out of 100)
  const habitScore = totalHabits > 0 ? Math.round((completedToday / totalHabits) * 40) : 0;
  const streakScore = Math.min(30, avgStreak * 5);
  const debtScore = Math.round(overallDebtPercent * 0.2);
  const interviewScore = Math.min(10, (interviewSummary?.in_progress || 0) * 3 + (interviewSummary?.offers || 0) * 5);
  const totalScore = Math.min(100, habitScore + streakScore + debtScore + interviewScore);

  const getGrade = (score) => {
    if (score >= 90) return { grade: "A+", color: "#22c55e", msg: "LEGENDARY! Keep dominating!" };
    if (score >= 75) return { grade: "A", color: "#4f8cff", msg: "Outstanding work! Almost perfect!" };
    if (score >= 60) return { grade: "B+", color: "#4f8cff", msg: "Great progress! Push harder!" };
    if (score >= 40) return { grade: "B", color: "#fbbf24", msg: "Good start. Stay consistent!" };
    if (score >= 20) return { grade: "C", color: "#f97316", msg: "Keep going. Build momentum!" };
    return { grade: "D", color: "#f87171", msg: "Time to level up! Start today!" };
  };

  const gradeInfo = getGrade(totalScore);

  // Category breakdown
  const categoryBreakdown = {};
  habits.forEach((h) => {
    if (!categoryBreakdown[h.category]) {
      categoryBreakdown[h.category] = { total: 0, completed: 0, streaks: 0 };
    }
    categoryBreakdown[h.category].total++;
    if (h.is_completed_today) categoryBreakdown[h.category].completed++;
    categoryBreakdown[h.category].streaks += h.current_streak;
  });

  return (
    <View style={{ flex: 1, backgroundColor: "#0a0a0f" }}>
      {/* Header */}
      <View
        style={{
          paddingTop: Platform.OS === "ios" ? 54 : (StatusBar.currentHeight || 24) + 10,
          backgroundColor: "#0a0a0f",
          paddingHorizontal: 20,
          paddingBottom: 14,
          borderBottomWidth: 1,
          borderBottomColor: "#ffffff06",
        }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: 12 }}>
              <Ionicons name="arrow-back" size={22} color="#ffffff" />
            </TouchableOpacity>
            {profile?.avatar_url ? (
              <Image
                source={{ uri: profile.avatar_url }}
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 19,
                  marginRight: 10,
                  borderWidth: 1,
                  borderColor: "#7c3aed30",
                }}
              />
            ) : (
              <View
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
                }}
              >
                <Ionicons name="person" size={18} color="#a78bfa" />
              </View>
            )}
            <Text style={{ color: "#ffffff", fontSize: 20, fontWeight: "800", letterSpacing: 0.5 }}>
              {profile?.name?.split(" ")[0] || "Hey"}
            </Text>
          </View>

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

    <ScrollView
      style={{ flex: 1, backgroundColor: "#0a0a0f" }}
      contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
    >
      {/* Grade card */}
      <View style={{ backgroundColor: "#1a1a2e", borderRadius: 20, padding: 28, marginBottom: 24, alignItems: "center" }}>
        <Text style={{ color: "#6b7280", fontSize: 14, marginBottom: 8 }}>Your Score</Text>
        <View
          style={{
            width: 100,
            height: 100,
            borderRadius: 50,
            borderWidth: 4,
            borderColor: gradeInfo.color,
            justifyContent: "center",
            alignItems: "center",
            marginBottom: 12,
          }}
        >
          <Text style={{ color: gradeInfo.color, fontSize: 36, fontWeight: "900" }}>{gradeInfo.grade}</Text>
        </View>
        <Text style={{ color: "#ffffff", fontSize: 32, fontWeight: "800" }}>{totalScore}/100</Text>
        <Text style={{ color: gradeInfo.color, fontSize: 14, marginTop: 6, textAlign: "center" }}>
          {gradeInfo.msg}
        </Text>
      </View>

      {/* Score breakdown */}
      <Text style={{ color: "#ffffff", fontSize: 18, fontWeight: "700", marginBottom: 14 }}>
        Score Breakdown
      </Text>
      <View style={{ backgroundColor: "#12121a", borderRadius: 14, padding: 16, marginBottom: 24 }}>
        {[
          { label: "Habits Done Today", score: habitScore, max: 40, color: "#4f8cff" },
          { label: "Streak Average", score: streakScore, max: 30, color: "#fbbf24" },
          { label: "Debt Progress", score: debtScore, max: 20, color: "#4f8cff" },
          { label: "Interview Activity", score: interviewScore, max: 10, color: "#a78bfa" },
        ].map((item) => (
          <View key={item.label} style={{ marginBottom: 14 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 4 }}>
              <Text style={{ color: "#9ca3af", fontSize: 13 }}>{item.label}</Text>
              <Text style={{ color: item.color, fontSize: 13, fontWeight: "700" }}>{item.score}/{item.max}</Text>
            </View>
            <ProgressBar
              percentage={getPercentage(item.score, item.max)}
              color={item.color}
              height={8}
              showLabel={false}
            />
          </View>
        ))}
      </View>

      {/* Habit stats */}
      <Text style={{ color: "#ffffff", fontSize: 18, fontWeight: "700", marginBottom: 14 }}>
        {"\u{1F4AA}"} Habit Stats
      </Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12, marginBottom: 24 }}>
        {[
          { label: "Today", value: `${completedToday}/${totalHabits}`, color: "#4f8cff" },
          { label: "Total Check-ins", value: totalCompletions, color: "#4f8cff" },
          { label: "Best Streak", value: bestStreak, color: "#fbbf24" },
          { label: "Avg Streak", value: avgStreak, color: "#fbbf24" },
        ].map((s) => (
          <View key={s.label} style={{ backgroundColor: "#12121a", borderRadius: 12, padding: 16, width: "47%", alignItems: "center" }}>
            <Text style={{ color: s.color, fontSize: 24, fontWeight: "800" }}>{s.value}</Text>
            <Text style={{ color: "#6b7280", fontSize: 11, marginTop: 4 }}>{s.label}</Text>
          </View>
        ))}
      </View>

      {/* Category breakdown */}
      {Object.keys(categoryBreakdown).length > 0 && (
        <>
          <Text style={{ color: "#ffffff", fontSize: 18, fontWeight: "700", marginBottom: 14 }}>
            {"\u{1F4CA}"} By Category
          </Text>
          {Object.entries(categoryBreakdown).map(([cat, data]) => {
            const color = categoryColors[cat] || "#4f8cff";
            const pct = getPercentage(data.completed, data.total);
            return (
              <View key={cat} style={{ backgroundColor: "#12121a", borderRadius: 12, padding: 14, marginBottom: 10, borderLeftWidth: 3, borderLeftColor: color }}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                  <Text style={{ color: "#ffffff", fontSize: 14, fontWeight: "600" }}>
                    {categoryLabels[cat] || cat}
                  </Text>
                  <Text style={{ color: color, fontSize: 13, fontWeight: "700" }}>
                    {data.completed}/{data.total} done
                  </Text>
                </View>
                <ProgressBar percentage={pct} color={color} height={6} showLabel={false} />
                <Text style={{ color: "#6b7280", fontSize: 11, marginTop: 4 }}>
                  Combined streak: {data.streaks} days
                </Text>
              </View>
            );
          })}
        </>
      )}

      {/* Debt summary */}
      <Text style={{ color: "#ffffff", fontSize: 18, fontWeight: "700", marginTop: 14, marginBottom: 14 }}>
        {"\u{1F4B0}"} Debt Progress
      </Text>
      <View style={{ backgroundColor: "#12121a", borderRadius: 14, padding: 16, marginBottom: 24 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 10 }}>
          <Text style={{ color: "#ffffff", fontWeight: "700" }}>{formatINR(debtSummary.total_paid)}</Text>
          <Text style={{ color: "#6b7280" }}>of {formatINR(debtSummary.total_debt)}</Text>
        </View>
        <ProgressBar percentage={overallDebtPercent} color={overallDebtPercent === 100 ? "#34d399" : "#4f8cff"} height={12} />
      </View>

      {/* Interview summary */}
      <Text style={{ color: "#ffffff", fontSize: 18, fontWeight: "700", marginBottom: 14 }}>
        {"\u{1F4BC}"} Interview Pipeline
      </Text>
      <View style={{ backgroundColor: "#12121a", borderRadius: 14, padding: 16 }}>
        {[
          { label: "Applied", value: interviewSummary?.applied || 0, color: "#4f8cff" },
          { label: "In Progress", value: interviewSummary?.in_progress || 0, color: "#a78bfa" },
          { label: "Offers", value: interviewSummary?.offers || 0, color: "#22c55e" },
          { label: "Rejected", value: interviewSummary?.rejected || 0, color: "#f87171" },
        ].map((s) => (
          <View key={s.label} style={{ flexDirection: "row", justifyContent: "space-between", paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: "#1a1a2e" }}>
            <Text style={{ color: "#9ca3af", fontSize: 14 }}>{s.label}</Text>
            <Text style={{ color: s.color, fontSize: 16, fontWeight: "700" }}>{s.value}</Text>
          </View>
        ))}
      </View>
    </ScrollView>

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
            onPress={() => navigation.navigate("HomeMain")}
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

export default WeeklyReportScreen;
