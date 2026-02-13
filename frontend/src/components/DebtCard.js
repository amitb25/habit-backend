import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import ProgressBar from "./ProgressBar";
import { formatINR, getPercentage } from "../utils/helpers";

const DebtCard = ({ debt, onPress, onDelete }) => {
  const percentage = getPercentage(debt.paid_amount, debt.total_amount);
  const isCleared = debt.is_cleared;

  const barColor = isCleared
    ? "#34d399"
    : percentage > 60
    ? "#34d399"
    : percentage > 30
    ? "#fbbf24"
    : "#f87171";

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={{
        backgroundColor: "#12121a",
        borderRadius: 16,
        padding: 18,
        marginBottom: 12,
        opacity: isCleared ? 0.6 : 1,
        borderWidth: 1,
        borderColor: "#ffffff06",
      }}
    >
      {/* Header */}
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <View style={{ flex: 1 }}>
          <Text style={{ color: "#ffffff", fontSize: 16, fontWeight: "600" }}>
            {debt.lender_name}
          </Text>
          {debt.description ? (
            <Text style={{ color: "#6b7280", fontSize: 12, marginTop: 3 }}>
              {debt.description}
            </Text>
          ) : null}
        </View>
        {isCleared && (
          <View
            style={{
              backgroundColor: "#34d39915",
              borderRadius: 10,
              paddingHorizontal: 12,
              paddingVertical: 5,
              borderWidth: 1,
              borderColor: "#34d39920",
            }}
          >
            <Text style={{ color: "#34d399", fontSize: 12, fontWeight: "600" }}>CLEARED</Text>
          </View>
        )}
      </View>

      {/* Amounts */}
      <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 16 }}>
        <View>
          <Text style={{ color: "#6b7280", fontSize: 10, letterSpacing: 0.5 }}>Total</Text>
          <Text style={{ color: "#ffffff", fontSize: 15, fontWeight: "700", marginTop: 2 }}>
            {formatINR(debt.total_amount)}
          </Text>
        </View>
        <View style={{ alignItems: "center" }}>
          <Text style={{ color: "#6b7280", fontSize: 10, letterSpacing: 0.5 }}>Paid</Text>
          <Text style={{ color: "#34d399", fontSize: 15, fontWeight: "700", marginTop: 2 }}>
            {formatINR(debt.paid_amount)}
          </Text>
        </View>
        <View style={{ alignItems: "flex-end" }}>
          <Text style={{ color: "#6b7280", fontSize: 10, letterSpacing: 0.5 }}>Remaining</Text>
          <Text style={{ color: "#f87171", fontSize: 15, fontWeight: "700", marginTop: 2 }}>
            {formatINR(debt.remaining_amount)}
          </Text>
        </View>
      </View>

      {/* Progress bar */}
      <ProgressBar percentage={percentage} color={barColor} height={8} />

      {/* Delete */}
      <View style={{ flexDirection: "row", justifyContent: "flex-end", marginTop: 4 }}>
        <TouchableOpacity onPress={onDelete} style={{ padding: 4 }}>
          <Text style={{ color: "#f8717150", fontSize: 12 }}>Delete</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

export default DebtCard;
