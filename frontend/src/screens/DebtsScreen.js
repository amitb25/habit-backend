import React, { useEffect, useState, useMemo, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  Animated,
  RefreshControl,
} from "react-native";
import { BlurView } from "expo-blur";
import { useAuth } from "../context/domains/AuthContext";
import { useDebts } from "../context/domains/DebtsContext";
import { useTheme } from "../context/ThemeContext";
import useShake from "../hooks/useShake";
import DebtCard from "../components/DebtCard";
import ProgressBar from "../components/ProgressBar";
import { formatINR, getPercentage } from "../utils/helpers";

const DebtsScreen = ({ navigation }) => {
  const { user } = useAuth();
  const { debts, debtSummary, loadDebts, addDebt, removeDebt } = useDebts();
  const { colors, isDark, glassShadow } = useTheme();

  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [filter, setFilter] = useState("all");

  // Form state
  const [lender, setLender] = useState("");
  const [amount, setAmount] = useState("");
  const [desc, setDesc] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [lenderError, setLenderError] = useState("");
  const [amountError, setAmountError] = useState("");
  const { shakeAnim: lenderShake, triggerShake: shakeLender } = useShake();
  const { shakeAnim: amountShake, triggerShake: shakeAmount } = useShake();

  useEffect(() => {
    loadDebts(user.id);
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadDebts(user.id);
    setRefreshing(false);
  }, [user.id, loadDebts]);

  const handleAdd = async () => {
    let hasError = false;
    setLenderError(""); setAmountError("");

    if (!lender.trim()) {
      setLenderError("Lender name is required");
      shakeLender();
      hasError = true;
    }
    if (!amount.trim()) {
      setAmountError("Amount is required");
      shakeAmount();
      hasError = true;
    }
    if (hasError) return;

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setAmountError("Enter a valid amount");
      shakeAmount();
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

  const handleDelete = useCallback((id, name) => {
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
  }, [removeDebt, loadDebts, user.id]);

  const overallPercent = useMemo(() => getPercentage(debtSummary.total_paid, debtSummary.total_debt), [debtSummary]);
  const activeDebts = useMemo(() => debts.filter((d) => !d.is_cleared), [debts]);
  const clearedDebts = useMemo(() => debts.filter((d) => d.is_cleared), [debts]);

  const filteredDebts = useMemo(() =>
    filter === "all" ? debts : filter === "active" ? activeDebts : clearedDebts,
    [filter, debts, activeDebts, clearedDebts]
  );

  const renderDebtCard = useCallback(({ item: debt }) => (
    <DebtCard
      debt={debt}
      onPress={() => navigation.navigate("DebtDetail", { debtId: debt.id, lender: debt.lender_name })}
      onDelete={() => handleDelete(debt.id, debt.lender_name)}
    />
  ), [handleDelete, navigation]);

  const debtListHeader = useMemo(() => (
    <>
      {/* Overall summary */}
      {debts.length > 0 && (
        <View
          style={{
            backgroundColor: colors.glassCard,
            borderRadius: 18,
            padding: 22,
            marginBottom: 22,
            borderWidth: 1,
            borderColor: colors.glassBorder,
            borderTopWidth: 1,
            borderTopColor: colors.glassHighlight,
            ...glassShadow,
          }}
        >
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 16 }}>
            <View>
              <Text style={{ color: colors.textTertiary, fontSize: 10, letterSpacing: 0.5 }}>Total Debt</Text>
              <Text style={{ color: colors.textPrimary, fontSize: 22, fontWeight: "800", marginTop: 2 }}>{formatINR(debtSummary.total_debt)}</Text>
            </View>
            <View style={{ alignItems: "center" }}>
              <Text style={{ color: colors.textTertiary, fontSize: 10, letterSpacing: 0.5 }}>Paid</Text>
              <Text style={{ color: colors.accentGreen, fontSize: 22, fontWeight: "800", marginTop: 2 }}>{formatINR(debtSummary.total_paid)}</Text>
            </View>
            <View style={{ alignItems: "flex-end" }}>
              <Text style={{ color: colors.textTertiary, fontSize: 10, letterSpacing: 0.5 }}>Remaining</Text>
              <Text style={{ color: colors.accentRed, fontSize: 22, fontWeight: "800", marginTop: 2 }}>{formatINR(debtSummary.total_remaining)}</Text>
            </View>
          </View>
          <ProgressBar
            percentage={overallPercent}
            color={overallPercent === 100 ? "#2bb883" : "#4078e0"}
            height={12}
          />
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 10 }}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: "#e0a820", marginRight: 6 }} />
              <Text style={{ color: colors.accentYellow, fontSize: 11 }}>{activeDebts.length} active</Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: "#2bb883", marginRight: 6 }} />
              <Text style={{ color: colors.accentGreen, fontSize: 11 }}>{clearedDebts.length} cleared</Text>
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
              backgroundColor: filter === f.key ? "#4078e0" : colors.glassChip,
              paddingHorizontal: 16,
              paddingVertical: 9,
              borderRadius: 22,
              borderWidth: filter === f.key ? 0 : 1,
              borderColor: filter === f.key ? "transparent" : colors.glassChipBorder,
            }}
          >
            <Text style={{ color: filter === f.key ? "#ffffff" : colors.textSecondary, fontSize: 12, fontWeight: "600" }}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </>
  ), [debts.length, debtSummary, overallPercent, activeDebts.length, clearedDebts.length, filter, colors, glassShadow]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <FlatList
        data={filteredDebts}
        keyExtractor={(item) => item.id}
        renderItem={renderDebtCard}
        ListHeaderComponent={debtListHeader}
        ListEmptyComponent={
          <View style={{ alignItems: "center", paddingVertical: 48 }}>
            <Text style={{ fontSize: 44 }}>{"\u{1F4B8}"}</Text>
            <Text style={{ color: colors.textTertiary, marginTop: 12, fontSize: 14 }}>
              {filter === "all" ? "No debts tracked yet" : `No ${filter} debts`}
            </Text>
          </View>
        }
        contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#4078e0" />}
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        windowSize={5}
        initialNumToRender={10}
      />

      {/* Floating Add Button */}
      <TouchableOpacity
        onPress={() => setModalVisible(true)}
        style={{
          position: "absolute",
          bottom: 20,
          right: 20,
          backgroundColor: "#e05555",
          width: 58,
          height: 58,
          borderRadius: 18,
          justifyContent: "center",
          alignItems: "center",
          elevation: 8,
          shadowColor: "#e05555",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
        }}
      >
        <Text style={{ color: "#ffffff", fontSize: 28, fontWeight: "300", marginTop: -2 }}>+</Text>
      </TouchableOpacity>

      {/* Add Debt Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={{ flex: 1, justifyContent: "flex-end" }}>
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => setModalVisible(false)}
            style={{ flex: 1 }}
          >
            <BlurView
              intensity={colors.blurIntensity}
              tint={colors.blurTint}
              style={{ flex: 1 }}
            />
          </TouchableOpacity>
          <View
            style={{
              backgroundColor: colors.glassModal,
              borderTopLeftRadius: 28,
              borderTopRightRadius: 28,
              padding: 28,
              borderWidth: 1,
              borderColor: colors.glassBorderMedium,
              borderBottomWidth: 0,
              ...glassShadow,
            }}
          >
            {/* Handle bar */}
            <View style={{ alignItems: "center", marginBottom: 20 }}>
              <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: colors.borderHandle }} />
            </View>

            <Text style={{ color: colors.textPrimary, fontSize: 22, fontWeight: "700", marginBottom: 24 }}>
              New Debt / Udhari
            </Text>

            <Animated.View style={{ transform: [{ translateX: lenderShake }], marginBottom: 12 }}>
              <TextInput
                value={lender}
                onChangeText={(t) => { setLender(t); setLenderError(""); }}
                placeholder="Lender name (e.g. Papa, Ravi)"
                placeholderTextColor={colors.textTertiary}
                style={{
                  backgroundColor: colors.glassInput,
                  color: colors.textPrimary,
                  borderRadius: 14,
                  padding: 16,
                  fontSize: 15,
                  borderWidth: 1,
                  borderColor: lenderError ? colors.accentRed : colors.glassBorder,
                }}
              />
              {lenderError ? <Text style={{ color: colors.accentRed, fontSize: 12, marginTop: 4, marginLeft: 4 }}>{lenderError}</Text> : null}
            </Animated.View>
            <Animated.View style={{ transform: [{ translateX: amountShake }], marginBottom: 12 }}>
              <TextInput
                value={amount}
                onChangeText={(t) => { setAmount(t); setAmountError(""); }}
                placeholder="Total amount (e.g. 50000)"
                placeholderTextColor={colors.textTertiary}
                keyboardType="numeric"
                style={{
                  backgroundColor: colors.glassInput,
                  color: colors.textPrimary,
                  borderRadius: 14,
                  padding: 16,
                  fontSize: 15,
                  borderWidth: 1,
                  borderColor: amountError ? colors.accentRed : colors.glassBorder,
                }}
              />
              {amountError ? <Text style={{ color: colors.accentRed, fontSize: 12, marginTop: 4, marginLeft: 4 }}>{amountError}</Text> : null}
            </Animated.View>
            {[
              { val: desc, set: setDesc, placeholder: "Description (optional)", kb: "default" },
              { val: dueDate, set: setDueDate, placeholder: "Due date YYYY-MM-DD (optional)", kb: "default" },
            ].map((field, i) => (
              <TextInput
                key={i}
                value={field.val}
                onChangeText={field.set}
                placeholder={field.placeholder}
                placeholderTextColor={colors.textTertiary}
                keyboardType={field.kb}
                style={{
                  backgroundColor: colors.glassInput,
                  color: colors.textPrimary,
                  borderRadius: 14,
                  padding: 16,
                  fontSize: 15,
                  marginBottom: 12,
                  borderWidth: 1,
                  borderColor: colors.glassBorder,
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
                  backgroundColor: colors.glassInput,
                  alignItems: "center",
                  borderWidth: 1,
                  borderColor: colors.glassBorder,
                }}
              >
                <Text style={{ color: colors.textSecondary, fontWeight: "600" }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleAdd}
                style={{ flex: 1, padding: 16, borderRadius: 14, backgroundColor: "#e05555", alignItems: "center" }}
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
