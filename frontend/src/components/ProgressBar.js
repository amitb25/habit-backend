import React from "react";
import { View, Text } from "react-native";

const ProgressBar = ({ percentage = 0, color = "#4f8cff", height = 10, showLabel = true }) => {
  const clampedPercent = Math.min(100, Math.max(0, percentage));

  return (
    <View style={{ marginVertical: 8 }}>
      {showLabel && (
        <Text style={{ color: "#9ca3af", fontSize: 12, marginBottom: 5, textAlign: "right", fontWeight: "500" }}>
          {clampedPercent}%
        </Text>
      )}
      <View
        style={{
          height,
          backgroundColor: "#0a0a0f",
          borderRadius: height,
          overflow: "hidden",
        }}
      >
        <View
          style={{
            height: "100%",
            width: `${clampedPercent}%`,
            backgroundColor: color,
            borderRadius: height,
          }}
        />
      </View>
    </View>
  );
};

export default ProgressBar;
