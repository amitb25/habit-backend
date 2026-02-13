import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { fetchPayments } from "../services/api";
import { useGlobal } from "../context/GlobalContext";
import ProgressBar from "../components/ProgressBar";
import { formatINR, getPercentage, formatDate } from "../utils/helpers";

const DebtDetailScreen = ({ route }) => {
  const { debtId } = route.params;
  const { user, debts, payDebt } = useGlobal();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [payAmount, setPayAmount] = useState("");
  const [payNote, setPayNote] = useState("");

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
    const amount = parseFloat(payAmount);
    if (!amount || amount <= 0) {
      Alert.alert("Error", "Enter a valid amount");
      return;
    }
    if (debt && amount > Number(debt.remaining_amount)) {
      Alert.alert("Error", `Amount exceeds remaining balance of ${formatINR(debt.remaining_amount)}`);
      return;
    }
    await payDebt(debtId, { amount, note: payNote.trim() || null }, user.id);
    setPayAmount("");
    setPayNote("");
    loadPayments();
  };

  if (!debt) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#0a0a0f" }}>
        <Text style={{ color: "#f87171" }}>Debt not found</Text>
      </View>
    );
  }

  const percentage = getPercentage(debt.paid_amount, debt.total_amount);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "#0a0a0f" }}
      contentContainerStyle={{ padding: 20 }}
    >
      {/* Debt header */}
      <View style={{ backgroundColor: "#1a1a2e", borderRadius: 16, padding: 24, marginBottom: 20 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <Text style={{ color: "#ffffff", fontSize: 24, fontWeight: "800" }}>
            {debt.lender_name}
          </Text>
          {debt.is_cleared && (
            <View style={{ backgroundColor: "#34d39920", borderRadius: 8, paddingHorizontal: 12, paddingVertical: 4 }}>
              <Text style={{ color: "#34d399", fontWeight: "700" }}>CLEARED</Text>
            </View>
          )}
        </View>
        {debt.description && (
          <Text style={{ color: "#6b7280", fontSize: 13, marginTop: 4 }}>{debt.description}</Text>
        )}

        {/* Amount breakdown */}
        <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 20 }}>
          <View>
            <Text style={{ color: "#6b7280", fontSize: 11 }}>Total</Text>
            <Text style={{ color: "#ffffff", fontSize: 22, fontWeight: "800" }}>
              {formatINR(debt.total_amount)}
            </Text>
          </View>
          <View style={{ alignItems: "center" }}>
            <Text style={{ color: "#6b7280", fontSize: 11 }}>Paid</Text>
            <Text style={{ color: "#34d399", fontSize: 22, fontWeight: "800" }}>
              {formatINR(debt.paid_amount)}
            </Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={{ color: "#6b7280", fontSize: 11 }}>Left</Text>
            <Text style={{ color: "#f87171", fontSize: 22, fontWeight: "800" }}>
              {formatINR(debt.remaining_amount)}
            </Text>
          </View>
        </View>

        <ProgressBar
          percentage={percentage}
          color={debt.is_cleared ? "#34d399" : "#4f8cff"}
          height={12}
        />

        {debt.due_date && (
          <Text style={{ color: "#fbbf24", fontSize: 12, marginTop: 8 }}>
            Due: {formatDate(debt.due_date)}
          </Text>
        )}
      </View>

      {/* Record Payment */}
      {!debt.is_cleared && (
        <View style={{ backgroundColor: "#12121a", borderRadius: 16, padding: 20, marginBottom: 24 }}>
          <Text style={{ color: "#ffffff", fontSize: 16, fontWeight: "700", marginBottom: 14 }}>
            Record Payment
          </Text>
          <TextInput
            value={payAmount}
            onChangeText={setPayAmount}
            placeholder="Amount (e.g. 5000)"
            placeholderTextColor="#6b7280"
            keyboardType="numeric"
            style={{
              backgroundColor: "#1a1a2e",
              color: "#ffffff",
              borderRadius: 12,
              padding: 14,
              fontSize: 15,
              marginBottom: 10,
            }}
          />
          <TextInput
            value={payNote}
            onChangeText={setPayNote}
            placeholder="Note (optional)"
            placeholderTextColor="#6b7280"
            style={{
              backgroundColor: "#1a1a2e",
              color: "#ffffff",
              borderRadius: 12,
              padding: 14,
              fontSize: 15,
              marginBottom: 14,
            }}
          />
          <TouchableOpacity
            onPress={handlePay}
            style={{
              backgroundColor: "#4f8cff",
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
      <Text style={{ color: "#ffffff", fontSize: 18, fontWeight: "700", marginBottom: 14 }}>
        Payment History
      </Text>

      {loading ? (
        <ActivityIndicator color="#4f8cff" />
      ) : payments.length === 0 ? (
        <Text style={{ color: "#6b7280", textAlign: "center", paddingVertical: 20 }}>
          No payments recorded yet.
        </Text>
      ) : (
        payments.map((payment) => (
          <View
            key={payment.id}
            style={{
              backgroundColor: "#12121a",
              borderRadius: 12,
              padding: 16,
              marginBottom: 10,
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <View>
              <Text style={{ color: "#34d399", fontSize: 16, fontWeight: "700" }}>
                {formatINR(payment.amount)}
              </Text>
              {payment.note && (
                <Text style={{ color: "#6b7280", fontSize: 12, marginTop: 2 }}>{payment.note}</Text>
              )}
            </View>
            <Text style={{ color: "#9ca3af", fontSize: 12 }}>
              {formatDate(payment.paid_on)}
            </Text>
          </View>
        ))
      )}
    </ScrollView>
  );
};

export default DebtDetailScreen;
