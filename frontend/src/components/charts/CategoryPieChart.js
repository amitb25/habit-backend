import React from "react";
import { View, Text } from "react-native";
import PieChart from "react-native-chart-kit/dist/PieChart";
import { Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { categoryLabels, categoryColors } from "../../utils/helpers";
import { useTheme } from "../../context/ThemeContext";

const screenWidth = Dimensions.get("window").width;

const defaultColors = ["#4078e0", "#c09460", "#e05555", "#2bb883", "#e0a820", "#e06612"];

const CategoryPieChart = ({ data = [] }) => {
  const { colors, cardShadow } = useTheme();

  if (!data || data.length === 0) return null;

  const total = data.reduce((sum, d) => sum + d.count, 0);
  if (total === 0) return null;

  const pieData = data.map((item, index) => ({
    name: categoryLabels[item.category] || item.category,
    count: item.count,
    color: categoryColors[item.category] || defaultColors[index % defaultColors.length],
    legendFontColor: colors.textSecondary,
    legendFontSize: 12,
  }));

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
            backgroundColor: "#c0946018",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Ionicons name="pie-chart" size={14} color="#c09460" />
        </View>
        <Text style={{ color: colors.textPrimary, fontSize: 15, fontWeight: "700" }}>
          Category Breakdown
        </Text>
      </View>

      <PieChart
        data={pieData}
        width={screenWidth - 76}
        height={180}
        chartConfig={{
          color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
        }}
        accessor="count"
        backgroundColor="transparent"
        paddingLeft="0"
        absolute
      />

      {/* Custom legend below */}
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 10 }}>
        {pieData.map((item) => (
          <View key={item.name} style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <View
              style={{
                width: 10,
                height: 10,
                borderRadius: 3,
                backgroundColor: item.color,
              }}
            />
            <Text style={{ color: colors.textSecondary, fontSize: 11 }}>
              {item.name}: {item.count}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

export default CategoryPieChart;
