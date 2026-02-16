import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { categoryLabels, categoryColors } from "../utils/helpers";
import { useTheme } from '../context/ThemeContext';

const HabitCard = ({ habit, onToggle, onPress, onDelete }) => {
  const { colors, glassShadow } = useTheme();
  const color = categoryColors[habit.category] || "#4078e0";
  const isDone = habit.is_completed_today;
  const [xpFeedback, setXpFeedback] = useState(null);

  const handleToggle = async () => {
    const result = await onToggle();
    if (result) {
      if (result.freeze_used) {
        setXpFeedback("Streak Protected!");
      } else if (result.action === "marked") {
        setXpFeedback(`+${result.xp_change || 10} XP`);
      } else if (result.action === "unmarked") {
        setXpFeedback("-10 XP");
      }
      setTimeout(() => setXpFeedback(null), 2000);
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={{
        backgroundColor: colors.glassCard,
        borderRadius: 16,
        padding: 18,
        marginBottom: 12,
        borderLeftWidth: 3,
        borderLeftColor: color,
        borderWidth: 1,
        borderColor: colors.glassBorder,
        borderTopWidth: 1,
        borderTopColor: colors.glassHighlight,
        ...glassShadow,
      }}
    >
      {/* XP Feedback */}
      {xpFeedback && (
        <View
          style={{
            position: "absolute",
            top: 8,
            right: 12,
            backgroundColor: xpFeedback.includes("Protected") ? "#30a5d820" : "#e0a82020",
            borderRadius: 8,
            paddingHorizontal: 10,
            paddingVertical: 4,
            zIndex: 10,
          }}
        >
          <Text
            style={{
              color: xpFeedback.includes("Protected") ? "#30a5d8" : "#e0a820",
              fontSize: 12,
              fontWeight: "700",
            }}
          >
            {xpFeedback}
          </Text>
        </View>
      )}

      {/* Top row: title + category + streak */}
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <View style={{ flex: 1 }}>
          <Text style={{ color: colors.textPrimary, fontSize: 16, fontWeight: "600" }}>
            {habit.title}
          </Text>
          <View style={{ flexDirection: "row", alignItems: "center", marginTop: 4 }}>
            <View
              style={{
                backgroundColor: `${color}18`,
                paddingHorizontal: 10,
                paddingVertical: 3,
                borderRadius: 10,
              }}
            >
              <Text style={{ color: color, fontSize: 11, fontWeight: "600" }}>
                {categoryLabels[habit.category] || habit.category}
              </Text>
            </View>
          </View>
        </View>

        {/* Streak badge */}
        <View
          style={{
            backgroundColor: isDone ? "#2bb88315" : colors.glassInput,
            borderRadius: 14,
            paddingHorizontal: 14,
            paddingVertical: 8,
            flexDirection: "row",
            alignItems: "center",
            borderWidth: 1,
            borderColor: isDone ? "#2bb88320" : colors.glassBorder,
          }}
        >
          <Text style={{ fontSize: 14 }}>{habit.current_streak > 0 ? "\u{1F525}" : "\u{26AA}"}</Text>
          <Text style={{ color: isDone ? "#2bb883" : colors.textSecondary, fontSize: 14, fontWeight: "700", marginLeft: 5 }}>
            {habit.current_streak}
          </Text>
        </View>
      </View>

      {/* Bottom row: toggle + stats */}
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 16 }}>
        <TouchableOpacity
          onPress={handleToggle}
          style={{
            backgroundColor: isDone ? "#2bb883" : colors.glassInput,
            borderRadius: 12,
            paddingHorizontal: 22,
            paddingVertical: 10,
            borderWidth: isDone ? 0 : 1,
            borderColor: colors.glassBorder,
          }}
        >
          <Text style={{ color: isDone ? "#0a0a0f" : colors.textSecondary, fontWeight: "600", fontSize: 14 }}>
            {isDone ? "\u2713  Done" : "Mark Done"}
          </Text>
        </TouchableOpacity>

        <View style={{ flexDirection: "row", alignItems: "center", gap: 18 }}>
          <View style={{ alignItems: "center" }}>
            <Text style={{ color: colors.textTertiary, fontSize: 10 }}>Best</Text>
            <Text style={{ color: "#e0a820", fontSize: 14, fontWeight: "700" }}>
              {habit.longest_streak}
            </Text>
          </View>
          <View style={{ alignItems: "center" }}>
            <Text style={{ color: colors.textTertiary, fontSize: 10 }}>Total</Text>
            <Text style={{ color: "#2bb883", fontSize: 14, fontWeight: "700" }}>
              {habit.total_completions}
            </Text>
          </View>
          <TouchableOpacity onPress={onDelete} style={{ padding: 4 }}>
            <Text style={{ color: "#e0555560", fontSize: 18 }}>{"\u{1F5D1}"}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default React.memo(HabitCard);
