import React, { useEffect, useState, useMemo, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  Animated,
  RefreshControl,
} from "react-native";
import { BlurView } from "expo-blur";
import { useAuth } from "../context/domains/AuthContext";
import { useHabits } from "../context/domains/HabitsContext";
import { useTheme } from "../context/ThemeContext";
import useShake from "../hooks/useShake";
import HabitCard from "../components/HabitCard";

const categories = [
  { key: "dsa", label: "DSA" },
  { key: "react_native", label: "React Native" },
  { key: "job_application", label: "Job Apps" },
  { key: "english", label: "English" },
  { key: "other", label: "Other" },
];

const HabitsScreen = ({ navigation }) => {
  const { user } = useAuth();
  const { habits, loadHabits, addHabit, toggleHabitStatus, removeHabit } = useHabits();
  const { colors, isDark, glassShadow } = useTheme();

  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [habitTitle, setHabitTitle] = useState("");
  const [habitCategory, setHabitCategory] = useState("dsa");
  const [filter, setFilter] = useState("all");
  const [habitError, setHabitError] = useState("");
  const { shakeAnim: habitShake, triggerShake: shakeHabitField } = useShake();

  useEffect(() => {
    loadHabits(user.id);
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadHabits(user.id);
    setRefreshing(false);
  }, [user.id, loadHabits]);

  const handleAdd = useCallback(async () => {
    if (!habitTitle.trim()) {
      setHabitError("Enter a habit name");
      shakeHabitField();
      return;
    }
    setHabitError("");
    await addHabit({
      profile_id: user.id,
      title: habitTitle.trim(),
      category: habitCategory,
    });
    setHabitTitle("");
    setHabitCategory("dsa");
    setModalVisible(false);
  }, [habitTitle, habitCategory, user.id, addHabit, shakeHabitField]);

  const handleDelete = useCallback((id, title) => {
    Alert.alert("Delete Habit", `Remove "${title}"?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => removeHabit(id) },
    ]);
  }, [removeHabit]);

  // Filter logic
  const filteredHabits = useMemo(() =>
    filter === "all"
      ? habits
      : filter === "done"
      ? habits.filter((h) => h.is_completed_today)
      : filter === "pending"
      ? habits.filter((h) => !h.is_completed_today)
      : habits.filter((h) => h.category === filter),
    [habits, filter]
  );

  const completedToday = useMemo(() => habits.filter((h) => h.is_completed_today).length, [habits]);

  const filters = [
    { key: "all", label: "All" },
    { key: "done", label: "Done" },
    { key: "pending", label: "Pending" },
    { key: "dsa", label: "DSA" },
    { key: "react_native", label: "RN" },
    { key: "job_application", label: "Jobs" },
    { key: "english", label: "English" },
  ];

  const renderHabitCard = useCallback(({ item: habit }) => (
    <HabitCard
      habit={habit}
      onToggle={() => toggleHabitStatus(habit.id)}
      onPress={() => navigation.navigate("HabitDetail", { habitId: habit.id, title: habit.title })}
      onDelete={() => handleDelete(habit.id, habit.title)}
    />
  ), [toggleHabitStatus, handleDelete, navigation]);

  const listHeader = useMemo(() => (
    <>
      {/* Stats bar */}
      <View
        style={{
          backgroundColor: colors.glassCard,
          borderRadius: 16,
          padding: 18,
          marginBottom: 18,
          flexDirection: "row",
          justifyContent: "space-around",
          borderWidth: 1,
          borderColor: colors.glassBorder,
          borderTopWidth: 1,
          borderTopColor: colors.glassHighlight,
          ...glassShadow,
        }}
      >
        <View style={{ alignItems: "center", flex: 1 }}>
          <Text style={{ color: colors.accentBlue, fontSize: 26, fontWeight: "800" }}>{completedToday}</Text>
          <Text style={{ color: colors.textTertiary, fontSize: 11, marginTop: 3 }}>Done</Text>
        </View>
        <View style={{ width: 1, backgroundColor: colors.glassBorderStrong, marginVertical: 4 }} />
        <View style={{ alignItems: "center", flex: 1 }}>
          <Text style={{ color: colors.accentRed, fontSize: 26, fontWeight: "800" }}>{habits.length - completedToday}</Text>
          <Text style={{ color: colors.textTertiary, fontSize: 11, marginTop: 3 }}>Pending</Text>
        </View>
        <View style={{ width: 1, backgroundColor: colors.glassBorderStrong, marginVertical: 4 }} />
        <View style={{ alignItems: "center", flex: 1 }}>
          <Text style={{ color: colors.accentBlue, fontSize: 26, fontWeight: "800" }}>{habits.length}</Text>
          <Text style={{ color: colors.textTertiary, fontSize: 11, marginTop: 3 }}>Total</Text>
        </View>
      </View>

      {/* Filters */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 18 }}>
        {filters.map((f) => (
          <TouchableOpacity
            key={f.key}
            onPress={() => setFilter(f.key)}
            style={{
              backgroundColor: filter === f.key ? "#4078e0" : colors.glassChip,
              paddingHorizontal: 16,
              paddingVertical: 9,
              borderRadius: 22,
              marginRight: 8,
              borderWidth: filter === f.key ? 0 : 1,
              borderColor: filter === f.key ? "transparent" : colors.glassChipBorder,
            }}
          >
            <Text style={{ color: filter === f.key ? "#ffffff" : colors.textSecondary, fontSize: 12, fontWeight: "600" }}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </>
  ), [completedToday, habits.length, filter, colors, glassShadow]);

  const listEmpty = useMemo(() => (
    <View style={{ alignItems: "center", paddingVertical: 48 }}>
      <Text style={{ fontSize: 44 }}>{"\u{1F4AD}"}</Text>
      <Text style={{ color: colors.textTertiary, marginTop: 12, fontSize: 14 }}>
        {filter === "all" ? "No habits yet. Create your first one!" : "No habits match this filter"}
      </Text>
    </View>
  ), [filter, colors]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <FlatList
        data={filteredHabits}
        keyExtractor={(item) => item.id}
        renderItem={renderHabitCard}
        ListHeaderComponent={listHeader}
        ListEmptyComponent={listEmpty}
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
          backgroundColor: "#4078e0",
          width: 58,
          height: 58,
          borderRadius: 18,
          justifyContent: "center",
          alignItems: "center",
          elevation: 8,
          shadowColor: "#4078e0",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
        }}
      >
        <Text style={{ color: "#ffffff", fontSize: 28, fontWeight: "300", marginTop: -2 }}>+</Text>
      </TouchableOpacity>

      {/* Add Habit Modal */}
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
              New Habit
            </Text>

            <Animated.View style={{ transform: [{ translateX: habitShake }], marginBottom: 18 }}>
              <TextInput
                value={habitTitle}
                onChangeText={(t) => { setHabitTitle(t); setHabitError(""); }}
                placeholder="Habit name (e.g. Solve 2 DSA problems)"
                placeholderTextColor={colors.textTertiary}
                style={{
                  backgroundColor: colors.glassInput,
                  color: colors.textPrimary,
                  borderRadius: 14,
                  padding: 16,
                  fontSize: 15,
                  borderWidth: 1,
                  borderColor: habitError ? colors.accentRed : colors.glassBorder,
                }}
              />
              {habitError ? <Text style={{ color: colors.accentRed, fontSize: 12, marginTop: 4, marginLeft: 4 }}>{habitError}</Text> : null}
            </Animated.View>

            <Text style={{ color: colors.textSecondary, fontSize: 13, marginBottom: 12, fontWeight: "500" }}>Category</Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 28 }}>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat.key}
                  onPress={() => setHabitCategory(cat.key)}
                  style={{
                    backgroundColor: habitCategory === cat.key ? "#4078e0" : colors.glassChip,
                    paddingHorizontal: 16,
                    paddingVertical: 9,
                    borderRadius: 22,
                    borderWidth: habitCategory === cat.key ? 0 : 1,
                    borderColor: habitCategory === cat.key ? "transparent" : colors.glassChipBorder,
                  }}
                >
                  <Text style={{ color: habitCategory === cat.key ? "#ffffff" : colors.textSecondary, fontSize: 13 }}>
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={{ flexDirection: "row", gap: 12 }}>
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
                style={{ flex: 1, padding: 16, borderRadius: 14, backgroundColor: "#4078e0", alignItems: "center" }}
              >
                <Text style={{ color: "#ffffff", fontWeight: "600" }}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default HabitsScreen;
