import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import ProgressBar from "./ProgressBar";
import { formatINR, getPercentage } from "../utils/helpers";
import { useTheme } from '../context/ThemeContext';

const DebtCard = ({ debt, onPress, onDelete }) => {
  const { colors, glassShadow } = useTheme();
  const percentage = getPercentage(debt.paid_amount, debt.total_amount);
  const isCleared = debt.is_cleared;

  const barColor = isCleared
    ? "#2bb883"
    : percentage > 60
    ? "#2bb883"
    : percentage > 30
    ? "#e0a820"
    : "#e05555";

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={{
        backgroundColor: colors.glassCard,
        borderRadius: 16,
        padding: 18,
        marginBottom: 12,
        opacity: isCleared ? 0.6 : 1,
        borderWidth: 1,
        borderColor: colors.glassBorder,
        borderTopWidth: 1,
        borderTopColor: colors.glassHighlight,
        ...glassShadow,
      }}
    >
      {/* Header */}
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <View style={{ flex: 1 }}>
          <Text style={{ color: colors.textPrimary, fontSize: 16, fontWeight: "600" }}>
            {debt.lender_name}
          </Text>
          {debt.description ? (
            <Text style={{ color: colors.textTertiary, fontSize: 12, marginTop: 3 }}>
              {debt.description}
            </Text>
          ) : null}
        </View>
        {isCleared && (
          <View
            style={{
              backgroundColor: "#2bb88315",
              borderRadius: 10,
              paddingHorizontal: 12,
              paddingVertical: 5,
              borderWidth: 1,
              borderColor: "#2bb88320",
            }}
          >
            <Text style={{ color: "#2bb883", fontSize: 12, fontWeight: "600" }}>CLEARED</Text>
          </View>
        )}
      </View>

      {/* Amounts */}
      <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 16 }}>
        <View>
          <Text style={{ color: colors.textTertiary, fontSize: 10, letterSpacing: 0.5 }}>Total</Text>
          <Text style={{ color: colors.textPrimary, fontSize: 15, fontWeight: "700", marginTop: 2 }}>
            {formatINR(debt.total_amount)}
          </Text>
        </View>
        <View style={{ alignItems: "center" }}>
          <Text style={{ color: colors.textTertiary, fontSize: 10, letterSpacing: 0.5 }}>Paid</Text>
          <Text style={{ color: "#2bb883", fontSize: 15, fontWeight: "700", marginTop: 2 }}>
            {formatINR(debt.paid_amount)}
          </Text>
        </View>
        <View style={{ alignItems: "flex-end" }}>
          <Text style={{ color: colors.textTertiary, fontSize: 10, letterSpacing: 0.5 }}>Remaining</Text>
          <Text style={{ color: "#e05555", fontSize: 15, fontWeight: "700", marginTop: 2 }}>
            {formatINR(debt.remaining_amount)}
          </Text>
        </View>
      </View>

      {/* Progress bar */}
      <ProgressBar percentage={percentage} color={barColor} height={8} />

      {/* Delete */}
      <View style={{ flexDirection: "row", justifyContent: "flex-end", marginTop: 4 }}>
        <TouchableOpacity onPress={onDelete} style={{ padding: 4 }}>
          <Text style={{ color: "#e0555550", fontSize: 12 }}>Delete</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

export default DebtCard;
