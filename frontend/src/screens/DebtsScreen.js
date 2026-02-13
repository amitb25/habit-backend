import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  RefreshControl,
} from "react-native";
import { useGlobal } from "../context/GlobalContext";
import DebtCard from "../components/DebtCard";
import ProgressBar from "../components/ProgressBar";
import { formatINR, getPercentage } from "../utils/helpers";

const DebtsScreen = ({ navigation }) => {
  const {
    user,
    debts,
    debtSummary,
    loadDebts,
    addDebt,
    removeDebt,
  } = useGlobal();

  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [filter, setFilter] = useState("all");

  // Form state
  const [lender, setLender] = useState("");
  const [amount, setAmount] = useState("");
  const [desc, setDesc] = useState("");
  const [dueDate, setDueDate] = useState("");

  useEffect(() => {
    loadDebts(user.id);
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDebts(user.id);
    setRefreshing(false);
  };

  const handleAdd = async () => {
    if (!lender.trim() || !amount.trim()) {
      Alert.alert("Error", "Lender name and amount are required");
      return;
    }
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      Alert.alert("Error", "Enter a valid amount");
      return;
    }
    await addDebt({
      profile_id: user.id,
      lender_name: lender.trim(),
      total_amount: parsedAmount,
      description: desc.trim() || null,
      due_date: dueDate.trim() || null,
    });
    setLender("");
    setAmount("");
    setDesc("");
    setDueDate("");
    setModalVisible(false);
    loadDebts(user.id);
  };

  const handleDelete = (id, name) => {
    Alert.alert("Delete Debt", `Remove debt to "${name}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await removeDebt(id);
          loadDebts(user.id);
        },
      },
    ]);
  };

  const overallPercent = getPercentage(debtSummary.total_paid, debtSummary.total_debt);
  const activeDebts = debts.filter((d) => !d.is_cleared);
  const clearedDebts = debts.filter((d) => d.is_cleared);

  const filteredDebts =
    filter === "all" ? debts : filter === "active" ? activeDebts : clearedDebts;

  return (
    <View style={{ flex: 1, backgroundColor: "#0a0a0f" }}>
      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#4f8cff" />}
      >
        {/* Overall summary */}
        {debts.length > 0 && (
          <View
            style={{
              backgroundColor: "#1a1a2e",
              borderRadius: 18,
              padding: 22,
              marginBottom: 22,
              borderWidth: 1,
              borderColor: "#ffffff08",
            }}
          >
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 16 }}>
              <View>
                <Text style={{ color: "#6b7280", fontSize: 10, letterSpacing: 0.5 }}>Total Debt</Text>
                <Text style={{ color: "#ffffff", fontSize: 22, fontWeight: "800", marginTop: 2 }}>{formatINR(debtSummary.total_debt)}</Text>
              </View>
              <View style={{ alignItems: "center" }}>
                <Text style={{ color: "#6b7280", fontSize: 10, letterSpacing: 0.5 }}>Paid</Text>
                <Text style={{ color: "#34d399", fontSize: 22, fontWeight: "800", marginTop: 2 }}>{formatINR(debtSummary.total_paid)}</Text>
              </View>
              <View style={{ alignItems: "flex-end" }}>
                <Text style={{ color: "#6b7280", fontSize: 10, letterSpacing: 0.5 }}>Remaining</Text>
                <Text style={{ color: "#f87171", fontSize: 22, fontWeight: "800", marginTop: 2 }}>{formatINR(debtSummary.total_remaining)}</Text>
              </View>
            </View>
            <ProgressBar
              percentage={overallPercent}
              color={overallPercent === 100 ? "#34d399" : "#4f8cff"}
              height={12}
            />
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 10 }}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: "#fbbf24", marginRight: 6 }} />
                <Text style={{ color: "#fbbf24", fontSize: 11 }}>{activeDebts.length} active</Text>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: "#34d399", marginRight: 6 }} />
                <Text style={{ color: "#34d399", fontSize: 11 }}>{clearedDebts.length} cleared</Text>
              </View>
            </View>
          </View>
        )}

        {/* Filters */}
        <View style={{ flexDirection: "row", marginBottom: 18, gap: 8 }}>
          {[
            { key: "all", label: `All (${debts.length})` },
            { key: "active", label: `Active (${activeDebts.length})` },
            { key: "cleared", label: `Cleared (${clearedDebts.length})` },
          ].map((f) => (
            <TouchableOpacity
              key={f.key}
              onPress={() => setFilter(f.key)}
              style={{
                backgroundColor: filter === f.key ? "#4f8cff" : "#1a1a2e",
                paddingHorizontal: 16,
                paddingVertical: 9,
                borderRadius: 22,
                borderWidth: filter === f.key ? 0 : 1,
                borderColor: "#ffffff08",
              }}
            >
              <Text style={{ color: filter === f.key ? "#ffffff" : "#9ca3af", fontSize: 12, fontWeight: "600" }}>
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Debt cards */}
        {filteredDebts.length === 0 ? (
          <View style={{ alignItems: "center", paddingVertical: 48 }}>
            <Text style={{ fontSize: 44 }}>{"\u{1F4B8}"}</Text>
            <Text style={{ color: "#6b7280", marginTop: 12, fontSize: 14 }}>
              {filter === "all" ? "No debts tracked yet" : `No ${filter} debts`}
            </Text>
          </View>
        ) : (
          filteredDebts.map((debt) => (
            <DebtCard
              key={debt.id}
              debt={debt}
              onPress={() => navigation.navigate("DebtDetail", { debtId: debt.id, lender: debt.lender_name })}
              onDelete={() => handleDelete(debt.id, debt.lender_name)}
            />
          ))
        )}
      </ScrollView>

      {/* Floating Add Button */}
      <TouchableOpacity
        onPress={() => setModalVisible(true)}
        style={{
          position: "absolute",
          bottom: 20,
          right: 20,
          backgroundColor: "#f87171",
          width: 58,
          height: 58,
          borderRadius: 18,
          justifyContent: "center",
          alignItems: "center",
          elevation: 8,
          shadowColor: "#f87171",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
        }}
      >
        <Text style={{ color: "#ffffff", fontSize: 28, fontWeight: "300", marginTop: -2 }}>+</Text>
      </TouchableOpacity>

      {/* Add Debt Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={{ flex: 1, justifyContent: "flex-end", backgroundColor: "#00000080" }}>
          <View
            style={{
              backgroundColor: "#12121a",
              borderTopLeftRadius: 28,
              borderTopRightRadius: 28,
              padding: 28,
              borderWidth: 1,
              borderColor: "#ffffff08",
              borderBottomWidth: 0,
            }}
          >
            {/* Handle bar */}
            <View style={{ alignItems: "center", marginBottom: 20 }}>
              <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: "#ffffff15" }} />
            </View>

            <Text style={{ color: "#ffffff", fontSize: 22, fontWeight: "700", marginBottom: 24 }}>
              New Debt / Udhari
            </Text>

            {[
              { val: lender, set: setLender, placeholder: "Lender name (e.g. Papa, Ravi)", kb: "default" },
              { val: amount, set: setAmount, placeholder: "Total amount (e.g. 50000)", kb: "numeric" },
              { val: desc, set: setDesc, placeholder: "Description (optional)", kb: "default" },
              { val: dueDate, set: setDueDate, placeholder: "Due date YYYY-MM-DD (optional)", kb: "default" },
            ].map((field, i) => (
              <TextInput
                key={i}
                value={field.val}
                onChangeText={field.set}
                placeholder={field.placeholder}
                placeholderTextColor="#6b7280"
                keyboardType={field.kb}
                style={{
                  backgroundColor: "#1a1a2e",
                  color: "#ffffff",
                  borderRadius: 14,
                  padding: 16,
                  fontSize: 15,
                  marginBottom: 12,
                  borderWidth: 1,
                  borderColor: "#ffffff08",
                }}
              />
            ))}

            <View style={{ flexDirection: "row", gap: 12, marginTop: 8 }}>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={{
                  flex: 1,
                  padding: 16,
                  borderRadius: 14,
                  backgroundColor: "#1a1a2e",
                  alignItems: "center",
                  borderWidth: 1,
                  borderColor: "#ffffff08",
                }}
              >
                <Text style={{ color: "#9ca3af", fontWeight: "600" }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleAdd}
                style={{ flex: 1, padding: 16, borderRadius: 14, backgroundColor: "#f87171", alignItems: "center" }}
              >
                <Text style={{ color: "#ffffff", fontWeight: "600" }}>Add Debt</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default DebtsScreen;
