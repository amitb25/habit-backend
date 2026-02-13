import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { categoryLabels, categoryColors } from "../utils/helpers";

const HabitCard = ({ habit, onToggle, onPress, onDelete }) => {
  const color = categoryColors[habit.category] || "#4f8cff";
  const isDone = habit.is_completed_today;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={{
        backgroundColor: "#12121a",
        borderRadius: 16,
        padding: 18,
        marginBottom: 12,
        borderLeftWidth: 3,
        borderLeftColor: color,
        borderWidth: 1,
        borderColor: "#ffffff06",
      }}
    >
      {/* Top row: title + category + streak */}
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <View style={{ flex: 1 }}>
          <Text style={{ color: "#ffffff", fontSize: 16, fontWeight: "600" }}>
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
            backgroundColor: isDone ? "#34d39915" : "#1a1a2e",
            borderRadius: 14,
            paddingHorizontal: 14,
            paddingVertical: 8,
            flexDirection: "row",
            alignItems: "center",
            borderWidth: 1,
            borderColor: isDone ? "#34d39920" : "#ffffff08",
          }}
        >
          <Text style={{ fontSize: 14 }}>{habit.current_streak > 0 ? "\u{1F525}" : "\u{26AA}"}</Text>
          <Text style={{ color: isDone ? "#34d399" : "#9ca3af", fontSize: 14, fontWeight: "700", marginLeft: 5 }}>
            {habit.current_streak}
          </Text>
        </View>
      </View>

      {/* Bottom row: toggle + stats */}
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 16 }}>
        <TouchableOpacity
          onPress={onToggle}
          style={{
            backgroundColor: isDone ? "#34d399" : "#1a1a2e",
            borderRadius: 12,
            paddingHorizontal: 22,
            paddingVertical: 10,
            borderWidth: isDone ? 0 : 1,
            borderColor: "#ffffff10",
          }}
        >
          <Text style={{ color: isDone ? "#0a0a0f" : "#9ca3af", fontWeight: "600", fontSize: 14 }}>
            {isDone ? "\u2713  Done" : "Mark Done"}
          </Text>
        </TouchableOpacity>

        <View style={{ flexDirection: "row", alignItems: "center", gap: 18 }}>
          <View style={{ alignItems: "center" }}>
            <Text style={{ color: "#6b7280", fontSize: 10 }}>Best</Text>
            <Text style={{ color: "#fbbf24", fontSize: 14, fontWeight: "700" }}>
              {habit.longest_streak}
            </Text>
          </View>
          <View style={{ alignItems: "center" }}>
            <Text style={{ color: "#6b7280", fontSize: 10 }}>Total</Text>
            <Text style={{ color: "#34d399", fontSize: 14, fontWeight: "700" }}>
              {habit.total_completions}
            </Text>
          </View>
          <TouchableOpacity onPress={onDelete} style={{ padding: 4 }}>
            <Text style={{ color: "#f8717160", fontSize: 18 }}>{"\u{1F5D1}"}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default HabitCard;
