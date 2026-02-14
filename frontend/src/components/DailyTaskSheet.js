import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  TextInput,
  ScrollView,
  Alert,
  Animated,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { useGlobal } from "../context/GlobalContext";
import { useTheme } from "../context/ThemeContext";
import useShake from "../hooks/useShake";
import DailyTaskCard from "./DailyTaskCard";
import {
  toDateString,
  formatDateHeader,
  taskCategoryLabels,
  taskCategoryColors,
  priorityConfig,
} from "../utils/helpers";

const TIME_SLOTS = [
  "06:00", "07:00", "08:00", "09:00", "10:00", "11:00",
  "12:00", "13:00", "14:00", "15:00", "16:00", "17:00",
  "18:00", "19:00", "20:00", "21:00", "22:00",
];

const CATEGORIES = Object.keys(taskCategoryLabels);
const PRIORITIES = Object.keys(priorityConfig);

const DailyTaskSheet = () => {
  const {
    user,
    dailyTasks,
    dailyTaskSummary,
    loadDailyTasks,
    addDailyTask,
    toggleDailyTaskStatus,
    removeDailyTask,
  } = useGlobal();
  const { colors, glassShadow } = useTheme();

  const [selectedDate, setSelectedDate] = useState(toDateString(new Date()));
  const [showModal, setShowModal] = useState(false);

  // Modal form state
  const [title, setTitle] = useState("");
  const [taskTime, setTaskTime] = useState(null);
  const [priority, setPriority] = useState("medium");
  const [category, setCategory] = useState("other");
  const [titleError, setTitleError] = useState("");
  const { shakeAnim: titleShake, triggerShake: shakeTitle } = useShake();

  useEffect(() => {
    if (user?.id) {
      loadDailyTasks(user.id, selectedDate);
    }
  }, [user, selectedDate]);

  const goToDate = (offset) => {
    const d = new Date(selectedDate + "T00:00:00");
    d.setDate(d.getDate() + offset);
    setSelectedDate(toDateString(d));
  };

  const goToToday = () => setSelectedDate(toDateString(new Date()));

  const isToday = selectedDate === toDateString(new Date());

  const handleAdd = async () => {
    setTitleError("");
    if (!title.trim()) {
      setTitleError("Please enter a task title");
      shakeTitle();
      return;
    }

    await addDailyTask({
      profile_id: user.id,
      title: title.trim(),
      task_date: selectedDate,
      task_time: taskTime,
      priority,
      category,
    });

    // Reset form
    setTitle("");
    setTaskTime(null);
    setPriority("medium");
    setCategory("other");
    setShowModal(false);
  };

  const handleDelete = (id, taskTitle) => {
    Alert.alert("Delete Task", `Remove "${taskTitle}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => removeDailyTask(id),
      },
    ]);
  };

  const { total, completed, pending } = dailyTaskSummary;
  const progressPercent = total > 0 ? Math.round((completed / total) * 100) : 0;
  const allDone = total > 0 && completed === total;

  const formatSlotLabel = (t) => {
    const [h] = t.split(":").map(Number);
    const suffix = h >= 12 ? "PM" : "AM";
    const h12 = h % 12 || 12;
    return `${h12} ${suffix}`;
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Date selector */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 14,
          gap: 12,
        }}
      >
        <TouchableOpacity
          onPress={() => goToDate(-1)}
          style={{
            width: 32,
            height: 32,
            borderRadius: 10,
            backgroundColor: colors.glassChip,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Ionicons name="chevron-back" size={16} color={colors.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity onPress={goToToday}>
          <Text
            style={{
              color: isToday ? "#4078e0" : colors.textPrimary,
              fontSize: 15,
              fontWeight: "700",
              minWidth: 120,
              textAlign: "center",
            }}
          >
            {formatDateHeader(selectedDate)}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => goToDate(1)}
          style={{
            width: 32,
            height: 32,
            borderRadius: 10,
            backgroundColor: colors.glassChip,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Summary stats */}
      {total > 0 && (
        <View style={{ marginBottom: 14 }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginBottom: 8,
            }}
          >
            <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
              <Text style={{ color: "#2bb883", fontWeight: "700" }}>
                {completed}
              </Text>{" "}
              Done
            </Text>
            <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
              <Text style={{ color: "#d88c0a", fontWeight: "700" }}>
                {pending}
              </Text>{" "}
              Pending
            </Text>
            <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
              <Text
                style={{
                  color: allDone ? "#2bb883" : "#4078e0",
                  fontWeight: "700",
                }}
              >
                {progressPercent}%
              </Text>
            </Text>
          </View>
          {/* Progress bar */}
          <View
            style={{
              height: 5,
              backgroundColor: colors.glassProgressTrack,
              borderRadius: 3,
            }}
          >
            <View
              style={{
                height: 5,
                width: `${progressPercent}%`,
                backgroundColor: allDone ? "#2bb883" : "#4078e0",
                borderRadius: 3,
              }}
            />
          </View>
        </View>
      )}

      {/* Task list */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 80 }}
        showsVerticalScrollIndicator={false}
      >
        {dailyTasks.length > 0 ? (
          dailyTasks.map((task) => (
            <DailyTaskCard
              key={task.id}
              task={task}
              onToggle={() => toggleDailyTaskStatus(task.id)}
              onDelete={() => handleDelete(task.id, task.title)}
            />
          ))
        ) : (
          <View style={{ alignItems: "center", paddingVertical: 48 }}>
            <Ionicons
              name="clipboard-outline"
              size={48}
              color={colors.borderHandle}
              style={{ marginBottom: 12 }}
            />
            <Text style={{ color: colors.textTertiary, fontSize: 14, marginBottom: 8 }}>
              No tasks for this day
            </Text>
            <TouchableOpacity onPress={() => setShowModal(true)}>
              <Text style={{ color: "#4078e0", fontSize: 14, fontWeight: "600" }}>
                + Add your first task
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Floating Add Button */}
      <TouchableOpacity
        onPress={() => setShowModal(true)}
        style={{
          position: "absolute",
          bottom: 20,
          right: 4,
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
        <Ionicons name="add" size={28} color="#ffffff" />
      </TouchableOpacity>

      {/* ─── Add Task Modal ─── */}
      <Modal
        visible={showModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1, justifyContent: "flex-end" }}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => setShowModal(false)}
            style={{
              flex: 1,
            }}
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
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              padding: 22,
              paddingBottom: 36,
              borderWidth: 1,
              borderColor: colors.glassBorderMedium,
              borderBottomWidth: 0,
            }}
          >
            {/* Modal header */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 20,
              }}
            >
              <Text
                style={{ color: colors.textPrimary, fontSize: 18, fontWeight: "700" }}
              >
                New Task
              </Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Ionicons name="close" size={22} color={colors.textTertiary} />
              </TouchableOpacity>
            </View>

            {/* Title input */}
            <Animated.View style={{ transform: [{ translateX: titleShake }], marginBottom: 16 }}>
              <TextInput
                placeholder="What do you need to do?"
                placeholderTextColor={colors.textTertiary}
                value={title}
                onChangeText={(t) => { setTitle(t); setTitleError(""); }}
                style={{
                  backgroundColor: colors.glassInput,
                  borderRadius: 14,
                  padding: 16,
                  color: colors.textPrimary,
                  fontSize: 15,
                  borderWidth: 1,
                  borderColor: titleError ? colors.accentRed : colors.glassBorder,
                }}
                autoFocus
              />
              {titleError ? <Text style={{ color: colors.accentRed, fontSize: 12, marginTop: 4, marginLeft: 4 }}>{titleError}</Text> : null}
            </Animated.View>

            {/* Time slots */}
            <Text
              style={{
                color: colors.textSecondary,
                fontSize: 12,
                fontWeight: "600",
                marginBottom: 8,
              }}
            >
              TIME SLOT
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ marginBottom: 16 }}
            >
              <TouchableOpacity
                onPress={() => setTaskTime(null)}
                style={{
                  paddingHorizontal: 14,
                  paddingVertical: 8,
                  borderRadius: 10,
                  backgroundColor: !taskTime ? "#4078e0" : colors.glassChip,
                  marginRight: 8,
                }}
              >
                <Text
                  style={{
                    color: !taskTime ? "#ffffff" : colors.textSecondary,
                    fontSize: 12,
                    fontWeight: "600",
                  }}
                >
                  None
                </Text>
              </TouchableOpacity>
              {TIME_SLOTS.map((slot) => (
                <TouchableOpacity
                  key={slot}
                  onPress={() => setTaskTime(slot)}
                  style={{
                    paddingHorizontal: 14,
                    paddingVertical: 8,
                    borderRadius: 10,
                    backgroundColor:
                      taskTime === slot ? "#4078e0" : colors.glassChip,
                    marginRight: 8,
                  }}
                >
                  <Text
                    style={{
                      color: taskTime === slot ? "#ffffff" : colors.textSecondary,
                      fontSize: 12,
                      fontWeight: "600",
                    }}
                  >
                    {formatSlotLabel(slot)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Priority */}
            <Text
              style={{
                color: colors.textSecondary,
                fontSize: 12,
                fontWeight: "600",
                marginBottom: 8,
              }}
            >
              PRIORITY
            </Text>
            <View
              style={{
                flexDirection: "row",
                gap: 8,
                marginBottom: 16,
              }}
            >
              {PRIORITIES.map((p) => {
                const cfg = priorityConfig[p];
                const selected = priority === p;
                return (
                  <TouchableOpacity
                    key={p}
                    onPress={() => setPriority(p)}
                    style={{
                      flex: 1,
                      paddingVertical: 10,
                      borderRadius: 10,
                      backgroundColor: selected ? cfg.color : cfg.bg,
                      alignItems: "center",
                      borderWidth: 1,
                      borderColor: selected ? cfg.color : "transparent",
                    }}
                  >
                    <Text
                      style={{
                        color: selected ? "#ffffff" : cfg.color,
                        fontSize: 13,
                        fontWeight: "700",
                      }}
                    >
                      {cfg.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Category */}
            <Text
              style={{
                color: colors.textSecondary,
                fontSize: 12,
                fontWeight: "600",
                marginBottom: 8,
              }}
            >
              CATEGORY
            </Text>
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                gap: 8,
                marginBottom: 22,
              }}
            >
              {CATEGORIES.map((cat) => {
                const color = taskCategoryColors[cat];
                const selected = category === cat;
                return (
                  <TouchableOpacity
                    key={cat}
                    onPress={() => setCategory(cat)}
                    style={{
                      paddingHorizontal: 14,
                      paddingVertical: 8,
                      borderRadius: 10,
                      backgroundColor: selected ? color : `${color}18`,
                      borderWidth: 1,
                      borderColor: selected ? color : "transparent",
                    }}
                  >
                    <Text
                      style={{
                        color: selected ? "#ffffff" : color,
                        fontSize: 12,
                        fontWeight: "600",
                      }}
                    >
                      {taskCategoryLabels[cat]}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Add button */}
            <TouchableOpacity
              onPress={handleAdd}
              style={{
                backgroundColor: "#4078e0",
                borderRadius: 14,
                paddingVertical: 16,
                alignItems: "center",
              }}
            >
              <Text
                style={{ color: "#ffffff", fontSize: 16, fontWeight: "700" }}
              >
                Add Task
              </Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

export default DailyTaskSheet;
