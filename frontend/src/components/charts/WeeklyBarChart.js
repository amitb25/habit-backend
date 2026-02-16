import React from "react";
import { View, Text, Dimensions } from "react-native";
import BarChart from "react-native-chart-kit/dist/BarChart";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";

const screenWidth = Dimensions.get("window").width;

const WeeklyBarChart = ({ data = [] }) => {
  const { colors, cardShadow } = useTheme();

  if (!data || data.length === 0) return null;

  const labels = data.map((d) => d.label);
  const values = data.map((d) => d.count);
  const maxVal = Math.max(...values, 1);

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
            backgroundColor: "#4078e018",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Ionicons name="bar-chart" size={14} color="#4078e0" />
        </View>
        <Text style={{ color: colors.textPrimary, fontSize: 15, fontWeight: "700" }}>
          Weekly Completions
        </Text>
      </View>

      <BarChart
        data={{
          labels,
          datasets: [{ data: values }],
        }}
        width={screenWidth - 76}
        height={180}
        fromZero
        showValuesOnTopOfBars
        withInnerLines={false}
        chartConfig={{
          backgroundGradientFrom: colors.chartBg,
          backgroundGradientTo: colors.chartBg,
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(79, 140, 255, ${opacity})`,
          labelColor: () => colors.chartLabel,
          barPercentage: 0.6,
          propsForLabels: { fontSize: 11 },
          propsForBackgroundLines: { stroke: colors.chartGridLine },
        }}
        style={{ borderRadius: 12, marginLeft: -10 }}
      />

      <Text style={{ color: colors.textTertiary, fontSize: 11, textAlign: "center", marginTop: 6 }}>
        Habits completed per day (last 7 days)
      </Text>
    </View>
  );
};

export default React.memo(WeeklyBarChart);
