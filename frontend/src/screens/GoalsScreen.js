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
import { formatDate } from "../utils/helpers";

const goalCategories = [
  { key: "career", label: "Career", icon: "\u{1F4BC}", color: "#4078e0" },
  { key: "finance", label: "Finance", icon: "\u{1F4B0}", color: "#2bb883" },
  { key: "health", label: "Health", icon: "\u{1F3CB}", color: "#e05555" },
  { key: "learning", label: "Learning", icon: "\u{1F4DA}", color: "#c09460" },
  { key: "personal", label: "Personal", icon: "\u{1F31F}", color: "#e0a820" },
  { key: "fitness", label: "Fitness", icon: "\u{1F4AA}", color: "#e06612" },
  { key: "other", label: "Other", icon: "\u{1F3AF}", color: "#6b7280" },
];

const getCategoryInfo = (key) => goalCategories.find((c) => c.key === key) || goalCategories[6];

const priorityConfig = {
  high: { label: "High", color: "#d43c3c", bg: "#d43c3c18" },
  medium: { label: "Med", color: "#d88c0a", bg: "#d88c0a18" },
  low: { label: "Low", color: "#1eac50", bg: "#1eac5018" },
};

const GoalsScreen = ({ navigation }) => {
  const {
    user,
    goals,
    goalSummary,
    loadGoals,
    addGoal,
    editGoal,
    updateGoalProgress,
    removeGoal,
    goalMilestones,
    loadMilestones,
    addGoalMilestone,
    toggleGoalMilestone,
    removeGoalMilestone,
  } = useGlobal();
  const { colors, isDark, glassShadow } = useTheme();

  const [refreshing, setRefreshing] = useState(false);
  const [addModal, setAddModal] = useState(false);
  const [filter, setFilter] = useState("all");
  const [expandedGoal, setExpandedGoal] = useState(null);
  const [progressModal, setProgressModal] = useState(null);
  const [milestoneText, setMilestoneText] = useState("");
  const [progressValue, setProgressValue] = useState("");

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("career");
  const [targetValue, setTargetValue] = useState("");
  const [unit, setUnit] = useState("");
  const [deadline, setDeadline] = useState("");
  const [priority, setPriority] = useState("medium");
  const [titleError, setTitleError] = useState("");
  const [progressError, setProgressError] = useState("");
  const { shakeAnim: titleShake, triggerShake: shakeTitle } = useShake();
  const { shakeAnim: progressShake, triggerShake: shakeProgress } = useShake();

  useEffect(() => {
    loadGoals(user.id);
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadGoals(user.id);
    setRefreshing(false);
  };

  const handleAdd = async () => {
    setTitleError("");
    if (!title.trim()) {
      setTitleError("Title is required");
      shakeTitle();
      return;
    }
    await addGoal({
      profile_id: user.id,
      title: title.trim(),
      description: description.trim() || null,
      category,
      target_value: targetValue ? parseFloat(targetValue) : null,
      unit: unit.trim() || null,
      deadline: deadline.trim() || null,
      priority,
    });
    setTitle("");
    setDescription("");
    setCategory("career");
    setTargetValue("");
    setUnit("");
    setDeadline("");
    setPriority("medium");
    setAddModal(false);
    loadGoals(user.id);
  };

  const handleStatusChange = async (id, newStatus) => {
    await editGoal(id, { status: newStatus });
    loadGoals(user.id);
  };

  const handleUpdateProgress = async () => {
    if (!progressModal) return;
    setProgressError("");
    const val = parseFloat(progressValue);
    if (isNaN(val) || val < 0) {
      setProgressError("Enter a valid value");
      shakeProgress();
      return;
    }
    await updateGoalProgress(progressModal.id, val);
    setProgressValue("");
    setProgressModal(null);
    loadGoals(user.id);
  };

  const handleDelete = (id, name) => {
    Alert.alert("Delete Goal", `Remove "${name}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await removeGoal(id);
          loadGoals(user.id);
        },
      },
    ]);
  };

  const handleAddMilestone = async (goalId) => {
    if (!milestoneText.trim()) return;
    await addGoalMilestone(goalId, user.id, milestoneText.trim());
    setMilestoneText("");
    loadMilestones(goalId);
  };

  const handleToggleExpand = (goalId) => {
    if (expandedGoal === goalId) {
      setExpandedGoal(null);
    } else {
      setExpandedGoal(goalId);
      loadMilestones(goalId);
    }
  };

  const filteredGoals =
    filter === "all"
      ? goals
      : goals.filter((g) => g.status === filter);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#4078e0" />}
      >
        {/* Summary Cards */}
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 22 }}>
          {[
            { label: "Total", value: goalSummary.total, color: "#4078e0", textColor: colors.accentBlue, icon: "\u{1F3AF}" },
            { label: "Active", value: goalSummary.active, color: "#e0a820", textColor: colors.accentYellow, icon: "\u{1F525}" },
            { label: "Completed", value: goalSummary.completed, color: "#2bb883", textColor: colors.accentGreen, icon: "\u{2705}" },
            { label: "Abandoned", value: goalSummary.abandoned, color: "#6b7280", textColor: "#6b7280", icon: "\u{1F6AB}" },
          ].map((s) => (
            <View
              key={s.label}
              style={{
                backgroundColor: colors.glassCard,
                borderRadius: 14,
                padding: 16,
                width: "47%",
                alignItems: "center",
                borderWidth: 1,
                borderColor: colors.glassBorder,
                ...glassShadow,
              }}
            >
              <View
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 12,
                  backgroundColor: `${s.color}12`,
                  justifyContent: "center",
                  alignItems: "center",
                  marginBottom: 8,
                }}
              >
                <Text style={{ fontSize: 18 }}>{s.icon}</Text>
              </View>
              <Text style={{ color: s.textColor, fontSize: 26, fontWeight: "800" }}>{s.value}</Text>
              <Text style={{ color: colors.textTertiary, fontSize: 11, marginTop: 3 }}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 18 }}>
          {[
            { key: "all", label: "All" },
            { key: "active", label: "Active" },
            { key: "completed", label: "Completed" },
            { key: "abandoned", label: "Abandoned" },
          ].map((f) => (
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
        </ScrollView>

        {/* Goal Cards */}
        {filteredGoals.length === 0 ? (
          <View style={{ alignItems: "center", paddingVertical: 48 }}>
            <Text style={{ fontSize: 44 }}>{"\u{1F3AF}"}</Text>
            <Text style={{ color: colors.textTertiary, marginTop: 12, fontSize: 14 }}>
              {filter === "all" ? "No goals set yet. Dream big!" : `No ${filter} goals`}
            </Text>
          </View>
        ) : (
          filteredGoals.map((goal) => {
            const catInfo = getCategoryInfo(goal.category);
            const prio = priorityConfig[goal.priority] || priorityConfig.medium;
            const isExpanded = expandedGoal === goal.id;
            const progress = goal.target_value
              ? Math.min(100, Math.round((Number(goal.current_value) / Number(goal.target_value)) * 100))
              : null;
            const milestones = goalMilestones[goal.id] || [];
            const completedMilestones = milestones.filter((m) => m.is_completed).length;

            return (
              <View
                key={goal.id}
                style={{
                  backgroundColor: colors.glassCard,
                  borderRadius: 16,
                  padding: 18,
                  marginBottom: 12,
                  borderLeftWidth: 3,
                  borderLeftColor: catInfo.color,
                  borderWidth: 1,
                  borderColor: colors.glassBorder,
                  borderTopWidth: 1,
                  borderTopColor: colors.glassHighlight,
                  opacity: goal.status === "abandoned" ? 0.5 : 1,
                  ...glassShadow,
                }}
              >
                {/* Header */}
                <TouchableOpacity
                  onPress={() => handleToggleExpand(goal.id)}
                  activeOpacity={0.7}
                >
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 }}>
                        <Text style={{ fontSize: 18 }}>{catInfo.icon}</Text>
                        <Text style={{ color: colors.textPrimary, fontSize: 16, fontWeight: "700", flex: 1 }}>
                          {goal.title}
                        </Text>
                      </View>
                      {goal.description && (
                        <Text style={{ color: colors.textTertiary, fontSize: 12, marginTop: 2, marginLeft: 26 }}>
                          {goal.description}
                        </Text>
                      )}
                    </View>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                      {/* Priority badge */}
                      <View
                        style={{
                          backgroundColor: prio.bg,
                          borderRadius: 8,
                          paddingHorizontal: 8,
                          paddingVertical: 3,
                        }}
                      >
                        <Text style={{ color: prio.color, fontSize: 10, fontWeight: "600" }}>
                          {prio.label}
                        </Text>
                      </View>
                      {/* Status badge */}
                      {goal.status === "completed" && (
                        <View
                          style={{
                            backgroundColor: "#2bb88315",
                            borderRadius: 8,
                            paddingHorizontal: 8,
                            paddingVertical: 3,
                          }}
                        >
                          <Text style={{ color: colors.accentGreen, fontSize: 10, fontWeight: "600" }}>DONE</Text>
                        </View>
                      )}
                    </View>
                  </View>

                  {/* Progress bar (if has target) */}
                  {progress !== null && (
                    <View style={{ marginTop: 14 }}>
                      <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 6 }}>
                        <Text style={{ color: colors.textSecondary, fontSize: 11 }}>
                          {goal.current_value} / {goal.target_value} {goal.unit || ""}
                        </Text>
                        <Text style={{ color: catInfo.color, fontSize: 11, fontWeight: "600" }}>
                          {progress}%
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
                            width: `${progress}%`,
                            borderRadius: 4,
                            backgroundColor: catInfo.color,
                          }}
                        />
                      </View>
                    </View>
                  )}

                  {/* Meta row */}
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 12 }}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                      <Text style={{ color: catInfo.color, fontSize: 11, fontWeight: "500" }}>
                        {catInfo.label}
                      </Text>
                      {goal.deadline && (
                        <>
                          <Text style={{ color: colors.borderStrong }}>{"\u2022"}</Text>
                          <Text style={{ color: colors.textTertiary, fontSize: 11 }}>
                            Due: {formatDate(goal.deadline)}
                          </Text>
                        </>
                      )}
                      {milestones.length > 0 && (
                        <>
                          <Text style={{ color: colors.borderStrong }}>{"\u2022"}</Text>
                          <Text style={{ color: colors.textTertiary, fontSize: 11 }}>
                            {completedMilestones}/{milestones.length} milestones
                          </Text>
                        </>
                      )}
                    </View>
                    <Ionicons
                      name={isExpanded ? "chevron-up" : "chevron-down"}
                      size={16}
                      color={colors.textTertiary}
                    />
                  </View>
                </TouchableOpacity>

                {/* Expanded section */}
                {isExpanded && (
                  <View style={{ marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: colors.glassBorder }}>
                    {/* Action buttons */}
                    <View style={{ flexDirection: "row", gap: 8, marginBottom: 14 }}>
                      {goal.status === "active" && goal.target_value && (
                        <TouchableOpacity
                          onPress={() => {
                            setProgressValue(String(goal.current_value));
                            setProgressModal(goal);
                          }}
                          style={{
                            flex: 1,
                            padding: 10,
                            borderRadius: 12,
                            backgroundColor: isDark ? `${catInfo.color}15` : `${catInfo.color}35`,
                            alignItems: "center",
                            borderWidth: 1,
                            borderColor: isDark ? `${catInfo.color}25` : `${catInfo.color}45`,
                          }}
                        >
                          <Text style={{ color: catInfo.color, fontSize: 12, fontWeight: "600" }}>
                            Update Progress
                          </Text>
                        </TouchableOpacity>
                      )}
                      {goal.status === "active" && (
                        <TouchableOpacity
                          onPress={() => handleStatusChange(goal.id, "completed")}
                          style={{
                            flex: 1,
                            padding: 10,
                            borderRadius: 12,
                            backgroundColor: isDark ? "#2bb88315" : "#2bb88335",
                            alignItems: "center",
                            borderWidth: 1,
                            borderColor: isDark ? "#2bb88325" : "#2bb88345",
                          }}
                        >
                          <Text style={{ color: colors.accentGreen, fontSize: 12, fontWeight: "600" }}>
                            Mark Complete
                          </Text>
                        </TouchableOpacity>
                      )}
                      {goal.status === "active" && (
                        <TouchableOpacity
                          onPress={() => handleStatusChange(goal.id, "abandoned")}
                          style={{
                            padding: 10,
                            borderRadius: 12,
                            backgroundColor: isDark ? "#e0555512" : "#e0555532",
                            alignItems: "center",
                            borderWidth: 1,
                            borderColor: isDark ? "#e0555520" : "#e0555540",
                          }}
                        >
                          <Ionicons name="close" size={16} color="#e05555" />
                        </TouchableOpacity>
                      )}
                    </View>

                    {/* Milestones */}
                    <Text style={{ color: colors.textSecondary, fontSize: 12, fontWeight: "600", marginBottom: 10 }}>
                      Milestones
                    </Text>
                    {milestones.map((m) => (
                      <TouchableOpacity
                        key={m.id}
                        onPress={() => toggleGoalMilestone(m.id, goal.id)}
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          paddingVertical: 10,
                          paddingHorizontal: 12,
                          marginBottom: 6,
                          backgroundColor: m.is_completed ? "#2bb88308" : colors.glassInput,
                          borderRadius: 10,
                        }}
                      >
                        <View
                          style={{
                            width: 22,
                            height: 22,
                            borderRadius: 6,
                            borderWidth: 2,
                            borderColor: m.is_completed ? "#2bb883" : colors.textTertiary,
                            backgroundColor: m.is_completed ? "#2bb883" : "transparent",
                            justifyContent: "center",
                            alignItems: "center",
                            marginRight: 12,
                          }}
                        >
                          {m.is_completed && (
                            <Ionicons name="checkmark" size={14} color="#ffffff" />
                          )}
                        </View>
                        <Text
                          style={{
                            color: m.is_completed ? colors.textTertiary : colors.textPrimary,
                            fontSize: 13,
                            flex: 1,
                            textDecorationLine: m.is_completed ? "line-through" : "none",
                          }}
                        >
                          {m.title}
                        </Text>
                        <TouchableOpacity
                          onPress={() => removeGoalMilestone(m.id, goal.id)}
                          style={{ padding: 4 }}
                        >
                          <Ionicons name="trash-outline" size={14} color="#e0555550" />
                        </TouchableOpacity>
                      </TouchableOpacity>
                    ))}

                    {/* Add milestone */}
                    {goal.status === "active" && (
                      <View style={{ flexDirection: "row", gap: 8, marginTop: 6 }}>
                        <TextInput
                          value={milestoneText}
                          onChangeText={setMilestoneText}
                          placeholder="Add milestone..."
                          placeholderTextColor={colors.textTertiary}
                          style={{
                            flex: 1,
                            backgroundColor: colors.glassInput,
                            color: colors.textPrimary,
                            borderRadius: 10,
                            padding: 12,
                            fontSize: 13,
                            borderWidth: 1,
                            borderColor: colors.glassBorder,
                          }}
                        />
                        <TouchableOpacity
                          onPress={() => handleAddMilestone(goal.id)}
                          style={{
                            width: 44,
                            borderRadius: 10,
                            backgroundColor: catInfo.color,
                            justifyContent: "center",
                            alignItems: "center",
                          }}
                        >
                          <Ionicons name="add" size={20} color="#ffffff" />
                        </TouchableOpacity>
                      </View>
                    )}

                    {/* Delete */}
                    <TouchableOpacity
                      onPress={() => handleDelete(goal.id, goal.title)}
                      style={{ alignSelf: "flex-end", marginTop: 12, padding: 4 }}
                    >
                      <Text style={{ color: "#e0555550", fontSize: 12 }}>Delete Goal</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Floating Add Button */}
      <TouchableOpacity
        onPress={() => setAddModal(true)}
        style={{
          position: "absolute",
          bottom: 20,
          right: 20,
          backgroundColor: "#e0a820",
          width: 58,
          height: 58,
          borderRadius: 18,
          justifyContent: "center",
          alignItems: "center",
          elevation: 8,
          shadowColor: "#e0a820",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
        }}
      >
        <Text style={{ color: "#000000", fontSize: 28, fontWeight: "300", marginTop: -2 }}>+</Text>
      </TouchableOpacity>

      {/* Add Goal Modal */}
      <Modal visible={addModal} animationType="slide" transparent>
        <View style={{ flex: 1, justifyContent: "flex-end" }}>
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => setAddModal(false)}
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
            }}
          >
            <View style={{ alignItems: "center", marginBottom: 20 }}>
              <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: colors.borderHandle }} />
            </View>

            <Text style={{ color: colors.textPrimary, fontSize: 22, fontWeight: "700", marginBottom: 20 }}>
              New Goal
            </Text>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Animated.View style={{ transform: [{ translateX: titleShake }], marginBottom: 12 }}>
                <TextInput
                  value={title}
                  onChangeText={(t) => { setTitle(t); setTitleError(""); }}
                  placeholder="Goal title (e.g. Get 10 LPA job)"
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
              {[
                { val: description, set: setDescription, placeholder: "Description (optional)", kb: "default" },
                { val: deadline, set: setDeadline, placeholder: "Deadline YYYY-MM-DD (optional)", kb: "default" },
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

              {/* Target value row */}
              <View style={{ flexDirection: "row", gap: 10, marginBottom: 12 }}>
                <TextInput
                  value={targetValue}
                  onChangeText={setTargetValue}
                  placeholder="Target (e.g. 50000)"
                  placeholderTextColor={colors.textTertiary}
                  keyboardType="numeric"
                  style={{
                    flex: 2,
                    backgroundColor: colors.glassInput,
                    color: colors.textPrimary,
                    borderRadius: 14,
                    padding: 16,
                    fontSize: 15,
                    borderWidth: 1,
                    borderColor: colors.glassBorder,
                  }}
                />
                <TextInput
                  value={unit}
                  onChangeText={setUnit}
                  placeholder="Unit (INR, kg)"
                  placeholderTextColor={colors.textTertiary}
                  style={{
                    flex: 1,
                    backgroundColor: colors.glassInput,
                    color: colors.textPrimary,
                    borderRadius: 14,
                    padding: 16,
                    fontSize: 15,
                    borderWidth: 1,
                    borderColor: colors.glassBorder,
                  }}
                />
              </View>

              {/* Category selector */}
              <Text style={{ color: colors.textSecondary, fontSize: 12, marginBottom: 10 }}>Category</Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
                {goalCategories.map((cat) => (
                  <TouchableOpacity
                    key={cat.key}
                    onPress={() => setCategory(cat.key)}
                    style={{
                      paddingHorizontal: 14,
                      paddingVertical: 10,
                      borderRadius: 12,
                      backgroundColor: category === cat.key ? `${cat.color}18` : colors.glassInput,
                      borderWidth: 1,
                      borderColor: category === cat.key ? `${cat.color}30` : colors.glassBorder,
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <Text style={{ fontSize: 14 }}>{cat.icon}</Text>
                    <Text
                      style={{
                        color: category === cat.key ? cat.color : colors.textSecondary,
                        fontSize: 12,
                        fontWeight: "600",
                      }}
                    >
                      {cat.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Priority selector */}
              <Text style={{ color: colors.textSecondary, fontSize: 12, marginBottom: 10 }}>Priority</Text>
              <View style={{ flexDirection: "row", gap: 10, marginBottom: 16 }}>
                {Object.entries(priorityConfig).map(([key, val]) => (
                  <TouchableOpacity
                    key={key}
                    onPress={() => setPriority(key)}
                    style={{
                      flex: 1,
                      padding: 12,
                      borderRadius: 12,
                      backgroundColor: priority === key ? val.bg : colors.glassInput,
                      alignItems: "center",
                      borderWidth: 1,
                      borderColor: priority === key ? `${val.color}30` : colors.glassBorder,
                    }}
                  >
                    <Text
                      style={{
                        color: priority === key ? val.color : colors.textSecondary,
                        fontSize: 13,
                        fontWeight: "600",
                      }}
                    >
                      {val.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <View style={{ flexDirection: "row", gap: 12, marginTop: 8 }}>
              <TouchableOpacity
                onPress={() => setAddModal(false)}
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
                style={{ flex: 1, padding: 16, borderRadius: 14, backgroundColor: "#e0a820", alignItems: "center" }}
              >
                <Text style={{ color: "#000000", fontWeight: "600" }}>Create Goal</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Update Progress Modal */}
      <Modal visible={!!progressModal} animationType="slide" transparent>
        <View style={{ flex: 1, justifyContent: "flex-end" }}>
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => setProgressModal(null)}
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
            }}
          >
            <View style={{ alignItems: "center", marginBottom: 20 }}>
              <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: colors.borderHandle }} />
            </View>
            <Text style={{ color: colors.textPrimary, fontSize: 18, fontWeight: "700", marginBottom: 6 }}>
              Update Progress
            </Text>
            <Text style={{ color: colors.textTertiary, fontSize: 13, marginBottom: 18 }}>
              {progressModal?.title} — Target: {progressModal?.target_value} {progressModal?.unit || ""}
            </Text>
            <Animated.View style={{ transform: [{ translateX: progressShake }], marginBottom: 16 }}>
              <TextInput
                value={progressValue}
                onChangeText={(t) => { setProgressValue(t); setProgressError(""); }}
                placeholder={`Current: ${progressModal?.current_value || 0}`}
                placeholderTextColor={colors.textTertiary}
                keyboardType="numeric"
                style={{
                  backgroundColor: colors.glassInput,
                  color: colors.textPrimary,
                  borderRadius: 14,
                  padding: 16,
                  fontSize: 15,
                  borderWidth: 1,
                  borderColor: progressError ? colors.accentRed : colors.glassBorder,
                }}
              />
              {progressError ? <Text style={{ color: colors.accentRed, fontSize: 12, marginTop: 4, marginLeft: 4 }}>{progressError}</Text> : null}
            </Animated.View>
            <View style={{ flexDirection: "row", gap: 12 }}>
              <TouchableOpacity
                onPress={() => setProgressModal(null)}
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
                onPress={handleUpdateProgress}
                style={{ flex: 1, padding: 16, borderRadius: 14, backgroundColor: "#4078e0", alignItems: "center" }}
              >
                <Text style={{ color: "#ffffff", fontWeight: "600" }}>Update</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default GoalsScreen;
