import React from "react";
import { View, Text } from "react-native";

const allBadges = [
  { id: "first_habit", icon: "\u{1F331}", title: "First Seed", desc: "Created your first habit", check: (h, d, i) => h.length >= 1 },
  { id: "five_habits", icon: "\u{1F333}", title: "Garden Keeper", desc: "Created 5 habits", check: (h, d, i) => h.length >= 5 },
  { id: "streak_3", icon: "\u{1F525}", title: "On Fire", desc: "3-day streak on any habit", check: (h) => h.some((x) => x.current_streak >= 3) },
  { id: "streak_7", icon: "\u{2B50}", title: "Week Warrior", desc: "7-day streak on any habit", check: (h) => h.some((x) => x.current_streak >= 7) },
  { id: "streak_14", icon: "\u{1F48E}", title: "Unstoppable", desc: "14-day streak", check: (h) => h.some((x) => x.current_streak >= 14) },
  { id: "streak_30", icon: "\u{1F451}", title: "Legend", desc: "30-day streak", check: (h) => h.some((x) => x.current_streak >= 30) },
  { id: "all_done", icon: "\u{1F3AF}", title: "Perfect Day", desc: "All habits done in a day", check: (h) => h.length > 0 && h.every((x) => x.is_completed_today) },
  { id: "checkins_10", icon: "\u{1F4AA}", title: "Getting Strong", desc: "10 total check-ins", check: (h) => h.reduce((s, x) => s + x.total_completions, 0) >= 10 },
  { id: "checkins_50", icon: "\u{1F3CB}", title: "Iron Will", desc: "50 total check-ins", check: (h) => h.reduce((s, x) => s + x.total_completions, 0) >= 50 },
  { id: "checkins_100", icon: "\u{1F9BE}", title: "Machine Mode", desc: "100 total check-ins", check: (h) => h.reduce((s, x) => s + x.total_completions, 0) >= 100 },
  { id: "first_debt", icon: "\u{1F4B3}", title: "Debt Tracker", desc: "Added first debt", check: (h, d) => d.length >= 1 },
  { id: "debt_cleared", icon: "\u{1F389}", title: "Debt Free!", desc: "Cleared a debt fully", check: (h, d) => d.some((x) => x.is_cleared) },
  { id: "all_debts_clear", icon: "\u{1F3C6}", title: "Freedom!", desc: "All debts cleared", check: (h, d) => d.length > 0 && d.every((x) => x.is_cleared) },
  { id: "first_interview", icon: "\u{1F4E9}", title: "Job Hunter", desc: "Applied to first company", check: (h, d, i) => i.length >= 1 },
  { id: "five_interviews", icon: "\u{1F680}", title: "Mass Applier", desc: "Applied to 5 companies", check: (h, d, i) => i.length >= 5 },
  { id: "got_offer", icon: "\u{1F91D}", title: "Offer Received!", desc: "Got a job offer", check: (h, d, i) => i.some((x) => x.status === "offer") },
];

const AchievementBadges = ({ habits, debts, interviews }) => {
  const unlocked = allBadges.filter((b) => b.check(habits, debts, interviews));
  const locked = allBadges.filter((b) => !b.check(habits, debts, interviews));

  return (
    <View>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <Text style={{ color: "#ffffff", fontSize: 18, fontWeight: "700", letterSpacing: 0.3 }}>
          {"\u{1F3C5}"} Achievements
        </Text>
        <View
          style={{
            backgroundColor: "#a78bfa15",
            paddingHorizontal: 12,
            paddingVertical: 5,
            borderRadius: 14,
          }}
        >
          <Text style={{ color: "#a78bfa", fontSize: 12, fontWeight: "600" }}>
            {unlocked.length}/{allBadges.length}
          </Text>
        </View>
      </View>

      {/* Unlocked */}
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 16 }}>
        {unlocked.map((badge) => (
          <View
            key={badge.id}
            style={{
              backgroundColor: "#1a1a2e",
              borderRadius: 16,
              padding: 16,
              width: "30%",
              alignItems: "center",
              borderWidth: 1,
              borderColor: "#a78bfa25",
            }}
          >
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: 14,
                backgroundColor: "#a78bfa12",
                justifyContent: "center",
                alignItems: "center",
                marginBottom: 8,
              }}
            >
              <Text style={{ fontSize: 24 }}>{badge.icon}</Text>
            </View>
            <Text style={{ color: "#a78bfa", fontSize: 10, fontWeight: "700", textAlign: "center" }}>
              {badge.title}
            </Text>
            <Text style={{ color: "#6b7280", fontSize: 8, textAlign: "center", marginTop: 3 }}>
              {badge.desc}
            </Text>
          </View>
        ))}
      </View>

      {/* Locked */}
      {locked.length > 0 && (
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
          {locked.map((badge) => (
            <View
              key={badge.id}
              style={{
                backgroundColor: "#0d0d14",
                borderRadius: 16,
                padding: 16,
                width: "30%",
                alignItems: "center",
                opacity: 0.4,
                borderWidth: 1,
                borderColor: "#ffffff06",
              }}
            >
              <View
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 14,
                  backgroundColor: "#ffffff08",
                  justifyContent: "center",
                  alignItems: "center",
                  marginBottom: 8,
                }}
              >
                <Text style={{ fontSize: 24 }}>{"\u{1F512}"}</Text>
              </View>
              <Text style={{ color: "#6b7280", fontSize: 10, fontWeight: "700", textAlign: "center" }}>
                {badge.title}
              </Text>
              <Text style={{ color: "#4b5563", fontSize: 8, textAlign: "center", marginTop: 3 }}>
                {badge.desc}
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

export default AchievementBadges;
