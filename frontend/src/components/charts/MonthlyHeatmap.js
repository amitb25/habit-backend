import React from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";

const MonthlyHeatmap = ({ data = [] }) => {
  const { colors, cardShadow } = useTheme();

  const getColor = (count, maxCount) => {
    if (count === 0) return colors.heatmapEmpty;
    const ratio = count / Math.max(maxCount, 1);
    if (ratio <= 0.25) return colors.heatmapLow;
    if (ratio <= 0.5) return colors.heatmapMedLow;
    if (ratio <= 0.75) return colors.heatmapMedHigh;
    return colors.heatmapHigh;
  };

  if (!data || data.length === 0) return null;

  const maxCount = Math.max(...data.map((d) => d.count), 1);
  const totalRows = Math.ceil(data.length / 7);

  return (
    <View
      style={{
        backgroundColor: colors.chartBg,
        borderRadius: 18,
        padding: 18,
        marginBottom: 14,
        ...cardShadow,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 14 }}>
        <View
          style={{
            width: 28,
            height: 28,
            borderRadius: 8,
            backgroundColor: "#2bb88318",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Ionicons name="grid" size={14} color="#2bb883" />
        </View>
        <Text style={{ color: colors.textPrimary, fontSize: 15, fontWeight: "700" }}>
          30-Day Activity
        </Text>
      </View>

      {/* Heatmap grid */}
      <View style={{ flexDirection: "column", gap: 4, alignItems: "center" }}>
        {Array.from({ length: totalRows }).map((_, rowIdx) => (
          <View key={rowIdx} style={{ flexDirection: "row", gap: 4 }}>
            {data.slice(rowIdx * 7, rowIdx * 7 + 7).map((item, colIdx) => (
              <View
                key={colIdx}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 6,
                  backgroundColor: getColor(item.count, maxCount),
                  justifyContent: "center",
                  alignItems: "center",
                  borderWidth: 1,
                  borderColor: colors.borderLight,
                }}
              >
                {item.count > 0 && (
                  <Text style={{ color: colors.textPrimary, fontSize: 9, fontWeight: "700" }}>
                    {item.count}
                  </Text>
                )}
              </View>
            ))}
            {/* Fill remaining cells if last row is incomplete */}
            {rowIdx === totalRows - 1 &&
              data.length % 7 !== 0 &&
              Array.from({ length: 7 - (data.length % 7) }).map((_, i) => (
                <View
                  key={`empty-${i}`}
                  style={{ width: 32, height: 32, borderRadius: 6 }}
                />
              ))}
          </View>
        ))}
      </View>

      {/* Legend */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 6,
          marginTop: 12,
        }}
      >
        <Text style={{ color: colors.textTertiary, fontSize: 10 }}>Less</Text>
        {[colors.heatmapEmpty, colors.heatmapLow, colors.heatmapMedLow, colors.heatmapMedHigh, colors.heatmapHigh].map((color, i) => (
          <View
            key={i}
            style={{
              width: 14,
              height: 14,
              borderRadius: 3,
              backgroundColor: color,
              borderWidth: 1,
              borderColor: colors.borderLight,
            }}
          />
        ))}
        <Text style={{ color: colors.textTertiary, fontSize: 10 }}>More</Text>
      </View>
    </View>
  );
};

export default MonthlyHeatmap;
