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
import HabitCard from "../components/HabitCard";

const categories = [
  { key: "dsa", label: "DSA" },
  { key: "react_native", label: "React Native" },
  { key: "job_application", label: "Job Apps" },
  { key: "english", label: "English" },
  { key: "other", label: "Other" },
];

const HabitsScreen = ({ navigation }) => {
  const {
    user,
    habits,
    loadHabits,
    addHabit,
    toggleHabitStatus,
    removeHabit,
  } = useGlobal();

  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [habitTitle, setHabitTitle] = useState("");
  const [habitCategory, setHabitCategory] = useState("dsa");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    loadHabits(user.id);
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadHabits(user.id);
    setRefreshing(false);
  };

  const handleAdd = async () => {
    if (!habitTitle.trim()) {
      Alert.alert("Error", "Enter a habit name");
      return;
    }
    await addHabit({
      profile_id: user.id,
      title: habitTitle.trim(),
      category: habitCategory,
    });
    setHabitTitle("");
    setHabitCategory("dsa");
    setModalVisible(false);
  };

  const handleDelete = (id, title) => {
    Alert.alert("Delete Habit", `Remove "${title}"?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => removeHabit(id) },
    ]);
  };

  // Filter logic
  const filteredHabits =
    filter === "all"
      ? habits
      : filter === "done"
      ? habits.filter((h) => h.is_completed_today)
      : filter === "pending"
      ? habits.filter((h) => !h.is_completed_today)
      : habits.filter((h) => h.category === filter);

  const completedToday = habits.filter((h) => h.is_completed_today).length;

  const filters = [
    { key: "all", label: "All" },
    { key: "done", label: "Done" },
    { key: "pending", label: "Pending" },
    { key: "dsa", label: "DSA" },
    { key: "react_native", label: "RN" },
    { key: "job_application", label: "Jobs" },
    { key: "english", label: "English" },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: "#0a0a0f" }}>
      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#4f8cff" />}
      >
        {/* Stats bar */}
        <View
          style={{
            backgroundColor: "#1a1a2e",
            borderRadius: 16,
            padding: 18,
            marginBottom: 18,
            flexDirection: "row",
            justifyContent: "space-around",
            borderWidth: 1,
            borderColor: "#ffffff08",
          }}
        >
          <View style={{ alignItems: "center", flex: 1 }}>
            <Text style={{ color: "#4f8cff", fontSize: 26, fontWeight: "800" }}>{completedToday}</Text>
            <Text style={{ color: "#6b7280", fontSize: 11, marginTop: 3 }}>Done</Text>
          </View>
          <View style={{ width: 1, backgroundColor: "#ffffff10", marginVertical: 4 }} />
          <View style={{ alignItems: "center", flex: 1 }}>
            <Text style={{ color: "#f87171", fontSize: 26, fontWeight: "800" }}>{habits.length - completedToday}</Text>
            <Text style={{ color: "#6b7280", fontSize: 11, marginTop: 3 }}>Pending</Text>
          </View>
          <View style={{ width: 1, backgroundColor: "#ffffff10", marginVertical: 4 }} />
          <View style={{ alignItems: "center", flex: 1 }}>
            <Text style={{ color: "#4f8cff", fontSize: 26, fontWeight: "800" }}>{habits.length}</Text>
            <Text style={{ color: "#6b7280", fontSize: 11, marginTop: 3 }}>Total</Text>
          </View>
        </View>

        {/* Filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 18 }}>
          {filters.map((f) => (
            <TouchableOpacity
              key={f.key}
              onPress={() => setFilter(f.key)}
              style={{
                backgroundColor: filter === f.key ? "#4f8cff" : "#1a1a2e",
                paddingHorizontal: 16,
                paddingVertical: 9,
                borderRadius: 22,
                marginRight: 8,
                borderWidth: filter === f.key ? 0 : 1,
                borderColor: "#ffffff08",
              }}
            >
              <Text style={{ color: filter === f.key ? "#ffffff" : "#9ca3af", fontSize: 12, fontWeight: "600" }}>
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Habit cards */}
        {filteredHabits.length === 0 ? (
          <View style={{ alignItems: "center", paddingVertical: 48 }}>
            <Text style={{ fontSize: 44 }}>{"\u{1F4AD}"}</Text>
            <Text style={{ color: "#6b7280", marginTop: 12, fontSize: 14 }}>
              {filter === "all" ? "No habits yet. Create your first one!" : "No habits match this filter"}
            </Text>
          </View>
        ) : (
          filteredHabits.map((habit) => (
            <HabitCard
              key={habit.id}
              habit={habit}
              onToggle={() => toggleHabitStatus(habit.id)}
              onPress={() => navigation.navigate("HabitDetail", { habitId: habit.id, title: habit.title })}
              onDelete={() => handleDelete(habit.id, habit.title)}
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
          backgroundColor: "#4f8cff",
          width: 58,
          height: 58,
          borderRadius: 18,
          justifyContent: "center",
          alignItems: "center",
          elevation: 8,
          shadowColor: "#4f8cff",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
        }}
      >
        <Text style={{ color: "#ffffff", fontSize: 28, fontWeight: "300", marginTop: -2 }}>+</Text>
      </TouchableOpacity>

      {/* Add Habit Modal */}
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
              New Habit
            </Text>

            <TextInput
              value={habitTitle}
              onChangeText={setHabitTitle}
              placeholder="Habit name (e.g. Solve 2 DSA problems)"
              placeholderTextColor="#6b7280"
              style={{
                backgroundColor: "#1a1a2e",
                color: "#ffffff",
                borderRadius: 14,
                padding: 16,
                fontSize: 15,
                marginBottom: 18,
                borderWidth: 1,
                borderColor: "#ffffff08",
              }}
            />

            <Text style={{ color: "#9ca3af", fontSize: 13, marginBottom: 12, fontWeight: "500" }}>Category</Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 28 }}>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat.key}
                  onPress={() => setHabitCategory(cat.key)}
                  style={{
                    backgroundColor: habitCategory === cat.key ? "#4f8cff" : "#1a1a2e",
                    paddingHorizontal: 16,
                    paddingVertical: 9,
                    borderRadius: 22,
                    borderWidth: habitCategory === cat.key ? 0 : 1,
                    borderColor: "#ffffff08",
                  }}
                >
                  <Text style={{ color: habitCategory === cat.key ? "#ffffff" : "#9ca3af", fontSize: 13 }}>
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
                style={{ flex: 1, padding: 16, borderRadius: 14, backgroundColor: "#4f8cff", alignItems: "center" }}
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
