import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  taskCategoryLabels,
  taskCategoryColors,
  priorityConfig,
  formatTaskTime,
} from "../utils/helpers";

const DailyTaskCard = ({ task, onToggle, onDelete }) => {
  const isDone = task.is_completed;
  const priority = priorityConfig[task.priority] || priorityConfig.medium;
  const catColor = taskCategoryColors[task.category] || "#6b7280";
  const catLabel = taskCategoryLabels[task.category] || task.category;

  return (
    <View
      style={{
        backgroundColor: "#12121a",
        borderRadius: 14,
        padding: 14,
        marginBottom: 10,
        borderLeftWidth: 3,
        borderLeftColor: priority.color,
        borderWidth: 1,
        borderColor: "#ffffff06",
        opacity: isDone ? 0.6 : 1,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        {/* Checkbox */}
        <TouchableOpacity
          onPress={onToggle}
          style={{
            width: 24,
            height: 24,
            borderRadius: 7,
            borderWidth: 2,
            borderColor: isDone ? "#34d399" : "#ffffff20",
            backgroundColor: isDone ? "#34d399" : "transparent",
            justifyContent: "center",
            alignItems: "center",
            marginRight: 12,
          }}
        >
          {isDone && <Ionicons name="checkmark" size={14} color="#0a0a0f" />}
        </TouchableOpacity>

        {/* Title + badges */}
        <View style={{ flex: 1 }}>
          <Text
            style={{
              color: isDone ? "#6b7280" : "#ffffff",
              fontSize: 15,
              fontWeight: "600",
              textDecorationLine: isDone ? "line-through" : "none",
            }}
            numberOfLines={2}
          >
            {task.title}
          </Text>

          {/* Badge row */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginTop: 6,
              gap: 6,
              flexWrap: "wrap",
            }}
          >
            {/* Time badge */}
            {task.task_time && (
              <View
                style={{
                  backgroundColor: "#ffffff08",
                  paddingHorizontal: 8,
                  paddingVertical: 3,
                  borderRadius: 8,
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 3,
                }}
              >
                <Ionicons name="time-outline" size={10} color="#9ca3af" />
                <Text style={{ color: "#9ca3af", fontSize: 11, fontWeight: "500" }}>
                  {formatTaskTime(task.task_time)}
                </Text>
              </View>
            )}

            {/* Category badge */}
            <View
              style={{
                backgroundColor: `${catColor}18`,
                paddingHorizontal: 8,
                paddingVertical: 3,
                borderRadius: 8,
              }}
            >
              <Text style={{ color: catColor, fontSize: 11, fontWeight: "600" }}>
                {catLabel}
              </Text>
            </View>

            {/* Priority badge */}
            <View
              style={{
                backgroundColor: priority.bg,
                paddingHorizontal: 8,
                paddingVertical: 3,
                borderRadius: 8,
              }}
            >
              <Text
                style={{
                  color: priority.color,
                  fontSize: 11,
                  fontWeight: "600",
                }}
              >
                {priority.label}
              </Text>
            </View>
          </View>
        </View>

        {/* Delete button */}
        <TouchableOpacity
          onPress={onDelete}
          style={{ padding: 6, marginLeft: 4 }}
        >
          <Ionicons name="trash-outline" size={16} color="#f8717160" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default DailyTaskCard;
