import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  Animated,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { useGlobal } from "../context/GlobalContext";
import { useTheme } from "../context/ThemeContext";
import useShake from "../hooks/useShake";
import { formatINR, toDateString } from "../utils/helpers";

const incomeCategories = [
  { key: "salary", label: "Salary", icon: "\u{1F4B0}" },
  { key: "freelance", label: "Freelance", icon: "\u{1F4BB}" },
  { key: "investment", label: "Investment", icon: "\u{1F4C8}" },
  { key: "gift", label: "Gift", icon: "\u{1F381}" },
  { key: "refund", label: "Refund", icon: "\u{1F504}" },
  { key: "other_income", label: "Other", icon: "\u{1F4B5}" },
];

const expenseCategories = [
  { key: "food", label: "Food", icon: "\u{1F355}" },
  { key: "transport", label: "Transport", icon: "\u{1F697}" },
  { key: "shopping", label: "Shopping", icon: "\u{1F6CD}" },
  { key: "bills", label: "Bills", icon: "\u{1F4C4}" },
  { key: "rent", label: "Rent", icon: "\u{1F3E0}" },
  { key: "entertainment", label: "Fun", icon: "\u{1F3AE}" },
  { key: "health", label: "Health", icon: "\u{1FA7A}" },
  { key: "education", label: "Education", icon: "\u{1F4DA}" },
  { key: "recharge", label: "Recharge", icon: "\u{1F4F1}" },
  { key: "emi", label: "EMI", icon: "\u{1F3E6}" },
  { key: "other_expense", label: "Other", icon: "\u{1F4B8}" },
];

const allCategories = [...incomeCategories, ...expenseCategories];
const getCategoryInfo = (key) => allCategories.find((c) => c.key === key) || { label: key, icon: "\u{1F4B5}" };

const FinanceScreen = () => {
  const {
    user,
    transactions,
    financeSummary,
    loadTransactions,
    addTransaction,
    removeTransaction,
    monthlyBudget,
    setMonthlyBudget,
  } = useGlobal();
  const { colors, isDark, glassShadow } = useTheme();

  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [filter, setFilter] = useState("all");
  const [budgetModal, setBudgetModal] = useState(false);

  // Current month
  const [selectedMonth, setSelectedMonth] = useState(toDateString(new Date()).slice(0, 7));

  // Form state
  const [txType, setTxType] = useState("expense");
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [note, setNote] = useState("");
  const [txDate, setTxDate] = useState(toDateString(new Date()));

  // Budget form
  const [budgetAmount, setBudgetAmount] = useState("");

  // Validation
  const [titleError, setTitleError] = useState("");
  const [amountError, setAmountError] = useState("");
  const [budgetError, setBudgetError] = useState("");
  const { shakeAnim: titleShake, triggerShake: shakeTitle } = useShake();
  const { shakeAnim: amountShake, triggerShake: shakeAmount } = useShake();
  const { shakeAnim: budgetShake, triggerShake: shakeBudget } = useShake();

  useEffect(() => {
    loadTransactions(user.id, selectedMonth);
  }, [selectedMonth]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTransactions(user.id, selectedMonth);
    setRefreshing(false);
  };

  const changeMonth = (delta) => {
    const [y, m] = selectedMonth.split("-").map(Number);
    const d = new Date(y, m - 1 + delta, 1);
    const newMonth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    setSelectedMonth(newMonth);
  };

  const getMonthLabel = (monthStr) => {
    const [y, m] = monthStr.split("-").map(Number);
    const d = new Date(y, m - 1, 1);
    return d.toLocaleDateString("en-IN", { month: "long", year: "numeric" });
  };

  const handleAdd = async () => {
    let hasError = false;
    setTitleError(""); setAmountError("");
    if (!title.trim()) {
      setTitleError("Title is required");
      shakeTitle();
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
    await addTransaction({
      profile_id: user.id,
      type: txType,
      amount: parsedAmount,
      category,
      title: title.trim(),
      note: note.trim() || null,
      transaction_date: txDate,
    });
    // Reset form
    setTitle("");
    setAmount("");
    setCategory("");
    setNote("");
    setTxDate(toDateString(new Date()));
    setModalVisible(false);
    loadTransactions(user.id, selectedMonth);
  };

  const handleDelete = (id, name) => {
    Alert.alert("Delete", `Remove "${name}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await removeTransaction(id);
          loadTransactions(user.id, selectedMonth);
        },
      },
    ]);
  };

  const handleSetBudget = async () => {
    setBudgetError("");
    const parsed = parseFloat(budgetAmount);
    if (isNaN(parsed) || parsed <= 0) {
      setBudgetError("Enter a valid budget amount");
      shakeBudget();
      return;
    }
    await setMonthlyBudget(user.id, selectedMonth, parsed);
    setBudgetAmount("");
    setBudgetModal(false);
  };

  const filteredTx =
    filter === "all"
      ? transactions
      : transactions.filter((t) => t.type === filter);

  const budgetUsed = monthlyBudget
    ? Math.min(100, Math.round((financeSummary.total_expense / monthlyBudget) * 100))
    : 0;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#4078e0" />}
      >
        {/* Month Navigation */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 18,
          }}
        >
          <TouchableOpacity
            onPress={() => changeMonth(-1)}
            style={{
              width: 38,
              height: 38,
              borderRadius: 12,
              backgroundColor: colors.glassChip,
              justifyContent: "center",
              alignItems: "center",
              borderWidth: 1,
              borderColor: colors.glassChipBorder,
            }}
          >
            <Ionicons name="chevron-back" size={18} color={colors.textSecondary} />
          </TouchableOpacity>
          <Text style={{ color: colors.textPrimary, fontSize: 17, fontWeight: "700" }}>
            {getMonthLabel(selectedMonth)}
          </Text>
          <TouchableOpacity
            onPress={() => changeMonth(1)}
            style={{
              width: 38,
              height: 38,
              borderRadius: 12,
              backgroundColor: colors.glassChip,
              justifyContent: "center",
              alignItems: "center",
              borderWidth: 1,
              borderColor: colors.glassChipBorder,
            }}
          >
            <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Summary Card */}
        <View
          style={{
            backgroundColor: colors.glassCard,
            borderRadius: 18,
            padding: 22,
            marginBottom: 16,
            borderWidth: 1,
            borderColor: colors.glassBorder,
            borderTopWidth: 1,
            borderTopColor: colors.glassHighlight,
            ...glassShadow,
          }}
        >
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 16 }}>
            <View>
              <Text style={{ color: colors.textTertiary, fontSize: 10, letterSpacing: 0.5 }}>Income</Text>
              <Text style={{ color: colors.accentGreen, fontSize: 22, fontWeight: "800", marginTop: 2 }}>
                {formatINR(financeSummary.total_income)}
              </Text>
            </View>
            <View style={{ alignItems: "center" }}>
              <Text style={{ color: colors.textTertiary, fontSize: 10, letterSpacing: 0.5 }}>Expense</Text>
              <Text style={{ color: colors.accentRed, fontSize: 22, fontWeight: "800", marginTop: 2 }}>
                {formatINR(financeSummary.total_expense)}
              </Text>
            </View>
            <View style={{ alignItems: "flex-end" }}>
              <Text style={{ color: colors.textTertiary, fontSize: 10, letterSpacing: 0.5 }}>Balance</Text>
              <Text
                style={{
                  color: financeSummary.balance >= 0 ? colors.accentGreen : colors.accentRed,
                  fontSize: 22,
                  fontWeight: "800",
                  marginTop: 2,
                }}
              >
                {formatINR(Math.abs(financeSummary.balance))}
              </Text>
            </View>
          </View>

          {/* Budget Bar */}
          {monthlyBudget ? (
            <View>
              <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 6 }}>
                <Text style={{ color: colors.textSecondary, fontSize: 11 }}>
                  Budget: {formatINR(monthlyBudget)}
                </Text>
                <Text
                  style={{
                    color: budgetUsed > 90 ? colors.accentRed : budgetUsed > 70 ? colors.accentYellow : colors.accentGreen,
                    fontSize: 11,
                    fontWeight: "600",
                  }}
                >
                  {budgetUsed}% used
                </Text>
              </View>
              <View
                style={{
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: colors.glassProgressTrack,
                  overflow: "hidden",
                }}
              >
                <View
                  style={{
                    height: "100%",
                    width: `${Math.min(100, budgetUsed)}%`,
                    borderRadius: 4,
                    backgroundColor:
                      budgetUsed > 90 ? "#e05555" : budgetUsed > 70 ? "#e0a820" : "#2bb883",
                  }}
                />
              </View>
            </View>
          ) : (
            <TouchableOpacity onPress={() => setBudgetModal(true)}>
              <Text style={{ color: colors.accentBlue, fontSize: 12, textAlign: "center" }}>
                + Set Monthly Budget
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Quick Stats */}
        <View style={{ flexDirection: "row", gap: 10, marginBottom: 18 }}>
          {[
            { label: "Transactions", value: transactions.length, color: colors.accentBlue, icon: "\u{1F4CA}" },
            {
              label: "Top Expense",
              value: transactions.filter((t) => t.type === "expense").length > 0
                ? getCategoryInfo(
                    transactions
                      .filter((t) => t.type === "expense")
                      .sort((a, b) => Number(b.amount) - Number(a.amount))[0]?.category
                  ).label
                : "\u2014",
              color: colors.accentRed,
              icon: "\u{1F525}",
            },
          ].map((s) => (
            <View
              key={s.label}
              style={{
                flex: 1,
                backgroundColor: colors.glassCard,
                borderRadius: 14,
                padding: 16,
                alignItems: "center",
                borderWidth: 1,
                borderColor: colors.glassBorder,
                ...glassShadow,
              }}
            >
              <Text style={{ fontSize: 18, marginBottom: 6 }}>{s.icon}</Text>
              <Text style={{ color: s.color, fontSize: 18, fontWeight: "800" }}>{s.value}</Text>
              <Text style={{ color: colors.textTertiary, fontSize: 10, marginTop: 3 }}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Filters */}
        <View style={{ flexDirection: "row", marginBottom: 18, gap: 8 }}>
          {[
            { key: "all", label: `All (${transactions.length})` },
            { key: "income", label: `Income` },
            { key: "expense", label: `Expense` },
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
              <Text
                style={{
                  color: filter === f.key ? "#ffffff" : colors.textSecondary,
                  fontSize: 12,
                  fontWeight: "600",
                }}
              >
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
          {monthlyBudget && (
            <TouchableOpacity
              onPress={() => setBudgetModal(true)}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 9,
                borderRadius: 22,
                backgroundColor: colors.glassChip,
                borderWidth: 1,
                borderColor: colors.glassChipBorder,
              }}
            >
              <Text style={{ color: colors.accentYellow, fontSize: 12, fontWeight: "600" }}>Edit Budget</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Transaction List */}
        {filteredTx.length === 0 ? (
          <View style={{ alignItems: "center", paddingVertical: 48 }}>
            <Text style={{ fontSize: 44 }}>{"\u{1F4B8}"}</Text>
            <Text style={{ color: colors.textTertiary, marginTop: 12, fontSize: 14 }}>
              No transactions this month
            </Text>
          </View>
        ) : (
          filteredTx.map((tx) => {
            const catInfo = getCategoryInfo(tx.category);
            const isIncome = tx.type === "income";
            return (
              <TouchableOpacity
                key={tx.id}
                onLongPress={() => handleDelete(tx.id, tx.title)}
                activeOpacity={0.7}
                style={{
                  backgroundColor: colors.glassCard,
                  borderRadius: 14,
                  padding: 16,
                  marginBottom: 10,
                  flexDirection: "row",
                  alignItems: "center",
                  borderWidth: 1,
                  borderColor: colors.glassBorder,
                  borderLeftWidth: 3,
                  borderLeftColor: isIncome ? "#2bb883" : "#e05555",
                  ...glassShadow,
                }}
              >
                {/* Icon */}
                <View
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 12,
                    backgroundColor: isIncome ? (isDark ? "#2bb88312" : "#2bb88325") : (isDark ? "#e0555512" : "#e0555525"),
                    justifyContent: "center",
                    alignItems: "center",
                    marginRight: 14,
                  }}
                >
                  <Text style={{ fontSize: 20 }}>{catInfo.icon}</Text>
                </View>

                {/* Details */}
                <View style={{ flex: 1 }}>
                  <Text style={{ color: colors.textPrimary, fontSize: 14, fontWeight: "600" }}>
                    {tx.title}
                  </Text>
                  <View style={{ flexDirection: "row", alignItems: "center", marginTop: 4, gap: 8 }}>
                    <Text style={{ color: colors.textTertiary, fontSize: 11 }}>{catInfo.label}</Text>
                    <Text style={{ color: colors.borderStrong }}>{"\u2022"}</Text>
                    <Text style={{ color: colors.textTertiary, fontSize: 11 }}>
                      {new Date(tx.transaction_date + "T00:00:00").toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                      })}
                    </Text>
                  </View>
                </View>

                {/* Amount */}
                <Text
                  style={{
                    color: isIncome ? colors.accentGreen : colors.accentRed,
                    fontSize: 16,
                    fontWeight: "700",
                  }}
                >
                  {isIncome ? "+" : "-"}{formatINR(tx.amount)}
                </Text>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      {/* Floating Add Button */}
      <TouchableOpacity
        onPress={() => setModalVisible(true)}
        style={{
          position: "absolute",
          bottom: 20,
          right: 20,
          backgroundColor: "#1eac50",
          width: 58,
          height: 58,
          borderRadius: 18,
          justifyContent: "center",
          alignItems: "center",
          elevation: 8,
          shadowColor: "#1eac50",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
        }}
      >
        <Text style={{ color: "#ffffff", fontSize: 28, fontWeight: "300", marginTop: -2 }}>+</Text>
      </TouchableOpacity>

      {/* Add Transaction Modal */}
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
              maxHeight: "85%",
              ...glassShadow,
            }}
          >
            {/* Handle bar */}
            <View style={{ alignItems: "center", marginBottom: 20 }}>
              <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: colors.borderHandle }} />
            </View>

            <Text style={{ color: colors.textPrimary, fontSize: 22, fontWeight: "700", marginBottom: 20 }}>
              New Transaction
            </Text>

            {/* Type Toggle */}
            <View style={{ flexDirection: "row", gap: 10, marginBottom: 18 }}>
              {[
                { key: "expense", label: "Expense", color: "#e05555" },
                { key: "income", label: "Income", color: "#2bb883" },
              ].map((t) => (
                <TouchableOpacity
                  key={t.key}
                  onPress={() => {
                    setTxType(t.key);
                    setCategory("");
                  }}
                  style={{
                    flex: 1,
                    padding: 14,
                    borderRadius: 14,
                    backgroundColor: txType === t.key ? `${t.color}${isDark ? "18" : "25"}` : colors.glassInput,
                    alignItems: "center",
                    borderWidth: 1,
                    borderColor: txType === t.key ? `${t.color}${isDark ? "30" : "50"}` : colors.glassBorder,
                  }}
                >
                  <Text
                    style={{
                      color: txType === t.key ? t.color : colors.textSecondary,
                      fontWeight: "700",
                      fontSize: 15,
                    }}
                  >
                    {t.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Title */}
              <Animated.View style={{ transform: [{ translateX: titleShake }], marginBottom: 12 }}>
                <TextInput
                  value={title}
                  onChangeText={(t) => { setTitle(t); setTitleError(""); }}
                  placeholder="Title (e.g. Zomato, Salary)"
                  placeholderTextColor={colors.textTertiary}
                  style={{
                    backgroundColor: colors.glassInput,
                    color: colors.textPrimary,
                    borderRadius: 14,
                    padding: 16,
                    fontSize: 15,
                    borderWidth: 1,
                    borderColor: titleError ? colors.accentRed : colors.glassBorder,
                  }}
                />
                {titleError ? <Text style={{ color: colors.accentRed, fontSize: 12, marginTop: 4, marginLeft: 4 }}>{titleError}</Text> : null}
              </Animated.View>
              {/* Amount */}
              <Animated.View style={{ transform: [{ translateX: amountShake }], marginBottom: 12 }}>
                <TextInput
                  value={amount}
                  onChangeText={(t) => { setAmount(t); setAmountError(""); }}
                  placeholder="Amount (e.g. 500)"
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
              {/* Date & Note */}
              {[
                { val: txDate, set: setTxDate, placeholder: "Date YYYY-MM-DD", kb: "default" },
                { val: note, set: setNote, placeholder: "Note (optional)", kb: "default" },
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

              {/* Category selector */}
              <Text style={{ color: colors.textSecondary, fontSize: 12, marginBottom: 10, marginTop: 4 }}>
                Select Category
              </Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 18 }}>
                {(txType === "income" ? incomeCategories : expenseCategories).map((cat) => (
                  <TouchableOpacity
                    key={cat.key}
                    onPress={() => setCategory(cat.key)}
                    style={{
                      paddingHorizontal: 14,
                      paddingVertical: 10,
                      borderRadius: 12,
                      backgroundColor: category === cat.key ? (isDark ? "#4078e018" : "#4078e025") : colors.glassInput,
                      borderWidth: 1,
                      borderColor: category === cat.key ? (isDark ? "#4078e030" : "#4078e050") : colors.glassBorder,
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <Text style={{ fontSize: 14 }}>{cat.icon}</Text>
                    <Text
                      style={{
                        color: category === cat.key ? "#4078e0" : colors.textSecondary,
                        fontSize: 12,
                        fontWeight: "600",
                      }}
                    >
                      {cat.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

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
                style={{
                  flex: 1,
                  padding: 16,
                  borderRadius: 14,
                  backgroundColor: txType === "income" ? "#2bb883" : "#e05555",
                  alignItems: "center",
                }}
              >
                <Text style={{ color: "#ffffff", fontWeight: "600" }}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Budget Modal */}
      <Modal visible={budgetModal} animationType="slide" transparent>
        <View style={{ flex: 1, justifyContent: "flex-end" }}>
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => setBudgetModal(false)}
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
            <View style={{ alignItems: "center", marginBottom: 20 }}>
              <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: colors.borderHandle }} />
            </View>
            <Text style={{ color: colors.textPrimary, fontSize: 20, fontWeight: "700", marginBottom: 18 }}>
              Set Budget for {getMonthLabel(selectedMonth)}
            </Text>
            <Animated.View style={{ transform: [{ translateX: budgetShake }], marginBottom: 16 }}>
              <TextInput
                value={budgetAmount}
                onChangeText={(t) => { setBudgetAmount(t); setBudgetError(""); }}
                placeholder={monthlyBudget ? `Current: ${formatINR(monthlyBudget)}` : "Monthly budget (e.g. 20000)"}
                placeholderTextColor={colors.textTertiary}
                keyboardType="numeric"
                style={{
                  backgroundColor: colors.glassInput,
                  color: colors.textPrimary,
                  borderRadius: 14,
                  padding: 16,
                  fontSize: 15,
                  borderWidth: 1,
                  borderColor: budgetError ? colors.accentRed : colors.glassBorder,
                }}
              />
              {budgetError ? <Text style={{ color: colors.accentRed, fontSize: 12, marginTop: 4, marginLeft: 4 }}>{budgetError}</Text> : null}
            </Animated.View>
            <View style={{ flexDirection: "row", gap: 12 }}>
              <TouchableOpacity
                onPress={() => setBudgetModal(false)}
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
                onPress={handleSetBudget}
                style={{ flex: 1, padding: 16, borderRadius: 14, backgroundColor: "#e0a820", alignItems: "center" }}
              >
                <Text style={{ color: "#000000", fontWeight: "600" }}>Set Budget</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default FinanceScreen;
