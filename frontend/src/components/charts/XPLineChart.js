import React from "react";
import { View, Text, Dimensions } from "react-native";
import LineChart from "react-native-chart-kit/dist/line-chart";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";

const screenWidth = Dimensions.get("window").width;

const XPLineChart = ({ data = [] }) => {
  const { colors, cardShadow } = useTheme();

  if (!data || data.length === 0) return null;

  const labels = data.map((d) => d.label);
  const values = data.map((d) => d.xp);
  const totalXP = values.reduce((sum, v) => sum + v, 0);

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
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <View
            style={{
              width: 28,
              height: 28,
              borderRadius: 8,
              backgroundColor: "#c0946018",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Ionicons name="trending-up" size={14} color="#c09460" />
          </View>
          <Text style={{ color: colors.textPrimary, fontSize: 15, fontWeight: "700" }}>
            XP Earned (7 Days)
          </Text>
        </View>
        <Text style={{ color: "#c09460", fontSize: 13, fontWeight: "700" }}>
          {totalXP} XP
        </Text>
      </View>

      <LineChart
        data={{
          labels,
          datasets: [{ data: values.every((v) => v === 0) ? [0, 0, 0, 0, 0, 0, 1] : values }],
        }}
        width={screenWidth - 76}
        height={180}
        fromZero
        bezier
        withInnerLines={false}
        chartConfig={{
          backgroundGradientFrom: colors.chartBg,
          backgroundGradientTo: colors.chartBg,
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(167, 139, 250, ${opacity})`,
          labelColor: () => colors.chartLabel,
          propsForLabels: { fontSize: 11 },
          propsForDots: {
            r: "4",
            strokeWidth: "2",
            stroke: "#c09460",
            fill: colors.chartDotFill,
          },
          propsForBackgroundLines: { stroke: colors.chartGridLine },
        }}
        style={{ borderRadius: 12, marginLeft: -10 }}
      />

      <Text style={{ color: colors.textTertiary, fontSize: 11, textAlign: "center", marginTop: 6 }}>
        XP earned per day
      </Text>
    </View>
  );
};

export default XPLineChart;
