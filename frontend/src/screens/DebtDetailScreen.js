import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Animated,
  ActivityIndicator,
} from "react-native";
import { fetchPayments } from "../services/api";
import { useAuth } from "../context/domains/AuthContext";
import { useDebts } from "../context/domains/DebtsContext";
import { useTheme } from "../context/ThemeContext";
import useShake from "../hooks/useShake";
import ProgressBar from "../components/ProgressBar";
import { formatINR, getPercentage, formatDate } from "../utils/helpers";

const DebtDetailScreen = ({ route }) => {
  const { debtId } = route.params;
  const { user } = useAuth();
  const { debts, payDebt } = useDebts();
  const { colors } = useTheme();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [payAmount, setPayAmount] = useState("");
  const [payNote, setPayNote] = useState("");
  const [payError, setPayError] = useState("");
  const { shakeAnim: payShake, triggerShake: shakePayField } = useShake();

  const debt = debts.find((d) => d.id === debtId);

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    try {
      const res = await fetchPayments(debtId);
      setPayments(res.data.data);
    } catch (err) {
      console.error("Failed to load payments:", err);
    } finally {
      setLoading(false);
    }
  };

  const handlePay = async () => {
    setPayError("");
    const amount = parseFloat(payAmount);
    if (!amount || amount <= 0) {
      setPayError("Enter a valid amount");
      shakePayField();
      return;
    }
    if (debt && amount > Number(debt.remaining_amount)) {
      setPayError(`Amount exceeds remaining balance of ${formatINR(debt.remaining_amount)}`);
      shakePayField();
      return;
    }
    await payDebt(debtId, { amount, note: payNote.trim() || null }, user.id);
    setPayAmount("");
    setPayNote("");
    loadPayments();
  };

  if (!debt) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: colors.background }}>
        <Text style={{ color: "#e05555" }}>Debt not found</Text>
      </View>
    );
  }

  const percentage = getPercentage(debt.paid_amount, debt.total_amount);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ padding: 20 }}
    >
      {/* Debt header */}
      <View style={{ backgroundColor: colors.glassCard, borderRadius: 16, padding: 24, marginBottom: 20 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <Text style={{ color: colors.textPrimary, fontSize: 24, fontWeight: "800" }}>
            {debt.lender_name}
          </Text>
          {debt.is_cleared && (
            <View style={{ backgroundColor: "#2bb88320", borderRadius: 8, paddingHorizontal: 12, paddingVertical: 4 }}>
              <Text style={{ color: "#2bb883", fontWeight: "700" }}>CLEARED</Text>
            </View>
          )}
        </View>
        {debt.description && (
          <Text style={{ color: colors.textTertiary, fontSize: 13, marginTop: 4 }}>{debt.description}</Text>
        )}

        {/* Amount breakdown */}
        <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 20 }}>
          <View>
            <Text style={{ color: colors.textTertiary, fontSize: 11 }}>Total</Text>
            <Text style={{ color: colors.textPrimary, fontSize: 22, fontWeight: "800" }}>
              {formatINR(debt.total_amount)}
            </Text>
          </View>
          <View style={{ alignItems: "center" }}>
            <Text style={{ color: colors.textTertiary, fontSize: 11 }}>Paid</Text>
            <Text style={{ color: "#2bb883", fontSize: 22, fontWeight: "800" }}>
              {formatINR(debt.paid_amount)}
            </Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={{ color: colors.textTertiary, fontSize: 11 }}>Left</Text>
            <Text style={{ color: "#e05555", fontSize: 22, fontWeight: "800" }}>
              {formatINR(debt.remaining_amount)}
            </Text>
          </View>
        </View>

        <ProgressBar
          percentage={percentage}
          color={debt.is_cleared ? "#2bb883" : "#4078e0"}
          height={12}
        />

        {debt.due_date && (
          <Text style={{ color: "#e0a820", fontSize: 12, marginTop: 8 }}>
            Due: {formatDate(debt.due_date)}
          </Text>
        )}
      </View>

      {/* Record Payment */}
      {!debt.is_cleared && (
        <View style={{ backgroundColor: colors.glassCardAlt, borderRadius: 16, padding: 20, marginBottom: 24 }}>
          <Text style={{ color: colors.textPrimary, fontSize: 16, fontWeight: "700", marginBottom: 14 }}>
            Record Payment
          </Text>
          <Animated.View style={{ transform: [{ translateX: payShake }], marginBottom: 10 }}>
            <TextInput
              value={payAmount}
              onChangeText={(t) => { setPayAmount(t); setPayError(""); }}
              placeholder="Amount (e.g. 5000)"
              placeholderTextColor={colors.textTertiary}
              keyboardType="numeric"
              style={{
                backgroundColor: colors.glassCard,
                color: colors.textPrimary,
                borderRadius: 12,
                padding: 14,
                fontSize: 15,
                borderWidth: 1,
                borderColor: payError ? colors.accentRed : "transparent",
              }}
            />
            {payError ? <Text style={{ color: colors.accentRed, fontSize: 12, marginTop: 4, marginLeft: 4 }}>{payError}</Text> : null}
          </Animated.View>
          <TextInput
            value={payNote}
            onChangeText={setPayNote}
            placeholder="Note (optional)"
            placeholderTextColor={colors.textTertiary}
            style={{
              backgroundColor: colors.glassCard,
              color: colors.textPrimary,
              borderRadius: 12,
              padding: 14,
              fontSize: 15,
              marginBottom: 14,
            }}
          />
          <TouchableOpacity
            onPress={handlePay}
            style={{
              backgroundColor: "#4078e0",
              borderRadius: 12,
              padding: 14,
              alignItems: "center",
            }}
          >
            <Text style={{ color: "#0a0a0f", fontWeight: "700", fontSize: 15 }}>
              Pay {payAmount ? formatINR(payAmount) : ""}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Payment history */}
      <Text style={{ color: colors.textPrimary, fontSize: 18, fontWeight: "700", marginBottom: 14 }}>
        Payment History
      </Text>

      {loading ? (
        <ActivityIndicator color="#4078e0" />
      ) : payments.length === 0 ? (
        <Text style={{ color: colors.textTertiary, textAlign: "center", paddingVertical: 20 }}>
          No payments recorded yet.
        </Text>
      ) : (
        payments.map((payment) => (
          <View
            key={payment.id}
            style={{
              backgroundColor: colors.glassCardAlt,
              borderRadius: 12,
              padding: 16,
              marginBottom: 10,
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <View>
              <Text style={{ color: "#2bb883", fontSize: 16, fontWeight: "700" }}>
                {formatINR(payment.amount)}
              </Text>
              {payment.note && (
                <Text style={{ color: colors.textTertiary, fontSize: 12, marginTop: 2 }}>{payment.note}</Text>
              )}
            </View>
            <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
              {formatDate(payment.paid_on)}
            </Text>
          </View>
        ))
      )}
    </ScrollView>
  );
};

export default DebtDetailScreen;
