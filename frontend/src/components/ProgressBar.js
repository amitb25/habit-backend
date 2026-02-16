import React from "react";
import { View, Text } from "react-native";
import { useTheme } from '../context/ThemeContext';

const ProgressBar = ({ percentage = 0, color = "#4078e0", height = 10, showLabel = true }) => {
  const { colors } = useTheme();
  const clampedPercent = Math.min(100, Math.max(0, percentage));

  return (
    <View style={{ marginVertical: 8 }}>
      {showLabel && (
        <Text style={{ color: colors.textSecondary, fontSize: 12, marginBottom: 5, textAlign: "right", fontWeight: "500" }}>
          {clampedPercent}%
        </Text>
      )}
      <View
        style={{
          height,
          backgroundColor: colors.progressTrack,
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

export default React.memo(ProgressBar);
