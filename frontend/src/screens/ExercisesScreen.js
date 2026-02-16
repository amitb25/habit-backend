import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  Dimensions,
} from "react-native";
import { Video, ResizeMode } from "expo-av";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "../context/ThemeContext";
import { exerciseData, workoutPlans, exerciseVideos } from "../data/exercises";
import ProgressBar from "../components/ProgressBar";
import { getPercentage } from "../utils/helpers";

const levelColors = {
  beginner: "#2bb883",
  intermediate: "#e0a820",
  advanced: "#e05555",
};

const levelLabels = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

const ExercisesScreen = () => {
  const { colors, isDark, cardShadow } = useTheme();
  const [tab, setTab] = useState("workouts"); // workouts | exercises
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedWorkout, setSelectedWorkout] = useState(null);
  const [levelFilter, setLevelFilter] = useState("all");
  const [videoExercise, setVideoExercise] = useState(null);
  const videoRef = useRef(null);

  // Daily tracking
  const [completedToday, setCompletedToday] = useState({});
  const todayKey = new Date().toISOString().split("T")[0];

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    try {
      const data = await AsyncStorage.getItem(`workout_${todayKey}`);
      if (data) setCompletedToday(JSON.parse(data));
    } catch (e) {}
  };

  const saveProgress = async (newData) => {
    try {
      await AsyncStorage.setItem(`workout_${todayKey}`, JSON.stringify(newData));
    } catch (e) {}
  };

  const toggleExerciseDone = (workoutId, exerciseIndex) => {
    const key = `${workoutId}_${exerciseIndex}`;
    const updated = { ...completedToday, [key]: !completedToday[key] };
    setCompletedToday(updated);
    saveProgress(updated);
  };

  const toggleWorkoutDone = (workoutId) => {
    const updated = { ...completedToday, [`plan_${workoutId}`]: !completedToday[`plan_${workoutId}`] };
    setCompletedToday(updated);
    saveProgress(updated);
  };

  // Count today's completed workouts
  const completedWorkouts = workoutPlans.filter((w) => completedToday[`plan_${w.id}`]).length;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        {/* Today's progress */}
        <View
          style={{
            backgroundColor: colors.glassCard,
            borderRadius: 18,
            padding: 20,
            marginBottom: 22,
            borderWidth: 1,
            borderColor: colors.glassBorder,
            ...cardShadow,
          }}
        >
          <Text style={{ color: colors.textTertiary, fontSize: 12, letterSpacing: 0.5 }}>Today's Progress</Text>
          <View style={{ flexDirection: "row", alignItems: "baseline", marginTop: 8 }}>
            <Text style={{ color: colors.accentGreenAlt, fontSize: 30, fontWeight: "800" }}>{completedWorkouts}</Text>
            <Text style={{ color: colors.textTertiary, fontSize: 16, marginLeft: 4 }}>/{workoutPlans.length} workouts</Text>
          </View>
          <ProgressBar
            percentage={getPercentage(completedWorkouts, workoutPlans.length)}
            color="#1eac50"
            height={8}
            showLabel={false}
          />
        </View>

        {/* Tab switch */}
        <View
          style={{
            flexDirection: "row",
            marginBottom: 22,
            backgroundColor: colors.glassCardAlt,
            borderRadius: 14,
            padding: 4,
            borderWidth: 1,
            borderColor: colors.glassBorderLight,
            ...cardShadow,
          }}
        >
          {[
            { key: "workouts", label: "Workout Plans" },
            { key: "exercises", label: "Exercise Library" },
          ].map((t) => (
            <TouchableOpacity
              key={t.key}
              onPress={() => setTab(t.key)}
              style={{
                flex: 1,
                padding: 12,
                borderRadius: 12,
                backgroundColor: tab === t.key ? "#4078e0" : "transparent",
                alignItems: "center",
              }}
            >
              <Text style={{ color: tab === t.key ? "#ffffff" : colors.textTertiary, fontWeight: "600", fontSize: 13 }}>
                {t.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* WORKOUT PLANS TAB */}
        {tab === "workouts" && (
          <>
            {workoutPlans.map((plan) => {
              const isDone = completedToday[`plan_${plan.id}`];
              return (
                <TouchableOpacity
                  key={plan.id}
                  onPress={() => setSelectedWorkout(plan)}
                  activeOpacity={0.7}
                  style={{
                    backgroundColor: colors.glassCardAlt,
                    borderRadius: 16,
                    padding: 18,
                    marginBottom: 12,
                    borderLeftWidth: 3,
                    borderLeftColor: plan.color,
                    opacity: isDone ? 0.6 : 1,
                    borderWidth: 1,
                    borderColor: colors.glassBorderLight,
                    ...cardShadow,
                  }}
                >
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                    <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
                      <View
                        style={{
                          width: 48,
                          height: 48,
                          borderRadius: 14,
                          backgroundColor: `${plan.color}12`,
                          justifyContent: "center",
                          alignItems: "center",
                          marginRight: 14,
                        }}
                      >
                        <Text style={{ fontSize: 24 }}>{plan.icon}</Text>
                      </View>
                      <View>
                        <Text style={{ color: colors.textPrimary, fontSize: 16, fontWeight: "700" }}>{plan.name}</Text>
                        <View style={{ flexDirection: "row", alignItems: "center", marginTop: 5, gap: 8 }}>
                          <View
                            style={{
                              backgroundColor: `${levelColors[plan.level]}15`,
                              borderRadius: 8,
                              paddingHorizontal: 8,
                              paddingVertical: 3,
                            }}
                          >
                            <Text style={{ color: levelColors[plan.level], fontSize: 10, fontWeight: "600" }}>
                              {levelLabels[plan.level]}
                            </Text>
                          </View>
                          <Text style={{ color: colors.textTertiary, fontSize: 11 }}>{plan.duration}</Text>
                          <Text style={{ color: colors.textTertiary, fontSize: 11 }}>{plan.exercises.length} ex</Text>
                        </View>
                      </View>
                    </View>

                    <TouchableOpacity
                      onPress={(e) => { e.stopPropagation(); toggleWorkoutDone(plan.id); }}
                      style={{
                        width: 38,
                        height: 38,
                        borderRadius: 12,
                        backgroundColor: isDone ? "#1eac50" : colors.glassCard,
                        justifyContent: "center",
                        alignItems: "center",
                        borderWidth: isDone ? 0 : 1,
                        borderColor: colors.glassBorderStrong,
                      }}
                    >
                      <Text style={{ color: isDone ? "#0a0a0f" : colors.textTertiary, fontSize: 16, fontWeight: "700" }}>
                        {isDone ? "\u2713" : ""}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              );
            })}
          </>
        )}

        {/* EXERCISE LIBRARY TAB */}
        {tab === "exercises" && (
          <>
            {/* Level filter */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 18 }}>
              {[
                { key: "all", label: "All Levels" },
                { key: "beginner", label: "Beginner" },
                { key: "intermediate", label: "Intermediate" },
                { key: "advanced", label: "Advanced" },
              ].map((f) => (
                <TouchableOpacity
                  key={f.key}
                  onPress={() => setLevelFilter(f.key)}
                  style={{
                    backgroundColor: levelFilter === f.key ? "#4078e0" : colors.glassChip,
                    paddingHorizontal: 16,
                    paddingVertical: 9,
                    borderRadius: 22,
                    marginRight: 8,
                    borderWidth: levelFilter === f.key ? 0 : 1,
                    borderColor: levelFilter === f.key ? "transparent" : colors.glassChipBorder,
                  }}
                >
                  <Text style={{ color: levelFilter === f.key ? "#ffffff" : colors.textSecondary, fontSize: 12, fontWeight: "600" }}>
                    {f.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Category cards */}
            {exerciseData.map((cat) => {
              const filtered = levelFilter === "all"
                ? cat.exercises
                : cat.exercises.filter((e) => e.level === levelFilter);
              if (filtered.length === 0) return null;

              return (
                <TouchableOpacity
                  key={cat.id}
                  onPress={() => setSelectedCategory(cat)}
                  style={{
                    backgroundColor: colors.glassCardAlt,
                    borderRadius: 16,
                    padding: 18,
                    marginBottom: 12,
                    borderLeftWidth: 3,
                    borderLeftColor: cat.color,
                    flexDirection: "row",
                    alignItems: "center",
                    borderWidth: 1,
                    borderColor: colors.glassBorderLight,
                    ...cardShadow,
                  }}
                >
                  <View
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 14,
                      backgroundColor: `${cat.color}12`,
                      justifyContent: "center",
                      alignItems: "center",
                      marginRight: 16,
                    }}
                  >
                    <Text style={{ fontSize: 26 }}>{cat.icon}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: colors.textPrimary, fontSize: 17, fontWeight: "700" }}>{cat.name}</Text>
                    <Text style={{ color: colors.textTertiary, fontSize: 12, marginTop: 3 }}>
                      {filtered.length} exercises
                    </Text>
                  </View>
                  <Text style={{ color: colors.accentBlue, fontSize: 20, fontWeight: "300" }}>{"\u{203A}"}</Text>
                </TouchableOpacity>
              );
            })}
          </>
        )}
      </ScrollView>

      {/* WORKOUT DETAIL MODAL */}
      <Modal visible={!!selectedWorkout} animationType="slide" transparent>
        <View style={{ flex: 1, backgroundColor: colors.modalOverlayDark }}>
          <View
            style={{
              flex: 1,
              marginTop: 60,
              backgroundColor: colors.background,
              borderTopLeftRadius: 28,
              borderTopRightRadius: 28,
              padding: 24,
            }}
          >
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
              <View>
                <Text style={{ color: colors.textPrimary, fontSize: 22, fontWeight: "800" }}>
                  {selectedWorkout?.icon} {selectedWorkout?.name}
                </Text>
                <Text style={{ color: colors.textTertiary, fontSize: 12, marginTop: 4 }}>
                  {selectedWorkout?.duration} | {selectedWorkout?.exercises.length} exercises
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setSelectedWorkout(null)}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 12,
                  backgroundColor: isDark ? "#e0555515" : "#e0555535",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Text style={{ color: colors.accentRed, fontSize: 18 }}>{"\u2715"}</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {selectedWorkout?.exercises.map((ex, index) => {
                const key = `${selectedWorkout.id}_${index}`;
                const isDone = completedToday[key];
                return (
                  <TouchableOpacity
                    key={index}
                    onPress={() => toggleExerciseDone(selectedWorkout.id, index)}
                    style={{
                      backgroundColor: isDone ? "#1eac5008" : colors.glassCardAlt,
                      borderRadius: 14,
                      padding: 16,
                      marginBottom: 10,
                      flexDirection: "row",
                      alignItems: "center",
                      borderWidth: 1,
                      borderColor: isDone ? (isDark ? "#1eac5025" : "#1eac5045") : colors.glassBorderLight,
                      ...cardShadow,
                    }}
                  >
                    <View
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: 12,
                        backgroundColor: isDone ? "#1eac50" : colors.glassCard,
                        justifyContent: "center",
                        alignItems: "center",
                        marginRight: 14,
                      }}
                    >
                      <Text style={{ color: isDone ? "#0a0a0f" : colors.textTertiary, fontWeight: "700", fontSize: 13 }}>
                        {isDone ? "\u2713" : index + 1}
                      </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: isDone ? colors.accentGreenAlt : colors.textPrimary, fontSize: 15, fontWeight: "600", textDecorationLine: isDone ? "line-through" : "none" }}>
                        {ex.name}
                      </Text>
                      <Text style={{ color: colors.textTertiary, fontSize: 12, marginTop: 3 }}>
                        {ex.sets} sets x {ex.reps} | Rest: {ex.rest}
                      </Text>
                    </View>
                    {exerciseVideos[ex.name] && (
                      <TouchableOpacity
                        onPress={(e) => { e.stopPropagation(); setVideoExercise(ex.name); }}
                        style={{
                          width: 34,
                          height: 34,
                          borderRadius: 17,
                          backgroundColor: "#e0555520",
                          justifyContent: "center",
                          alignItems: "center",
                          marginLeft: 8,
                        }}
                      >
                        <Text style={{ color: "#e05555", fontSize: 14 }}>{"\u25B6"}</Text>
                      </TouchableOpacity>
                    )}
                  </TouchableOpacity>
                );
              })}

              {/* Mark entire workout done */}
              <TouchableOpacity
                onPress={() => { toggleWorkoutDone(selectedWorkout.id); setSelectedWorkout(null); }}
                style={{
                  backgroundColor: completedToday[`plan_${selectedWorkout?.id}`] ? "#e05555" : "#1eac50",
                  borderRadius: 16,
                  padding: 18,
                  alignItems: "center",
                  marginTop: 12,
                  marginBottom: 30,
                }}
              >
                <Text style={{ color: completedToday[`plan_${selectedWorkout?.id}`] ? "#ffffff" : "#0a0a0f", fontWeight: "700", fontSize: 16 }}>
                  {completedToday[`plan_${selectedWorkout?.id}`] ? "Mark as Incomplete" : "\u2713 Complete Workout"}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* CATEGORY DETAIL MODAL */}
      <Modal visible={!!selectedCategory} animationType="slide" transparent>
        <View style={{ flex: 1, backgroundColor: colors.modalOverlayDark }}>
          <View
            style={{
              flex: 1,
              marginTop: 60,
              backgroundColor: colors.background,
              borderTopLeftRadius: 28,
              borderTopRightRadius: 28,
              padding: 24,
            }}
          >
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
              <Text style={{ color: colors.textPrimary, fontSize: 22, fontWeight: "800" }}>
                {selectedCategory?.icon} {selectedCategory?.name}
              </Text>
              <TouchableOpacity
                onPress={() => setSelectedCategory(null)}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 12,
                  backgroundColor: isDark ? "#e0555515" : "#e0555535",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Text style={{ color: colors.accentRed, fontSize: 18 }}>{"\u2715"}</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {["beginner", "intermediate", "advanced"].map((level) => {
                const exercises = (selectedCategory?.exercises || []).filter((e) =>
                  levelFilter === "all" ? e.level === level : e.level === levelFilter && e.level === level
                );
                if (exercises.length === 0) return null;

                return (
                  <View key={level} style={{ marginBottom: 22 }}>
                    <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
                      <View
                        style={{
                          backgroundColor: `${levelColors[level]}15`,
                          borderRadius: 10,
                          paddingHorizontal: 12,
                          paddingVertical: 5,
                        }}
                      >
                        <Text style={{ color: levelColors[level], fontSize: 12, fontWeight: "700" }}>
                          {levelLabels[level]}
                        </Text>
                      </View>
                    </View>
                    {exercises.map((ex, idx) => (
                      <View
                        key={idx}
                        style={{
                          backgroundColor: colors.glassCardAlt,
                          borderRadius: 14,
                          padding: 16,
                          marginBottom: 10,
                          borderWidth: 1,
                          borderColor: colors.glassBorderLight,
                          ...cardShadow,
                        }}
                      >
                        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                          <Text style={{ color: colors.textPrimary, fontSize: 15, fontWeight: "600", flex: 1 }}>{ex.name}</Text>
                          {exerciseVideos[ex.name] && (
                            <TouchableOpacity
                              onPress={() => setVideoExercise(ex.name)}
                              style={{
                                width: 36,
                                height: 36,
                                borderRadius: 18,
                                backgroundColor: "#e0555520",
                                justifyContent: "center",
                                alignItems: "center",
                                marginLeft: 10,
                              }}
                            >
                              <Text style={{ color: "#e05555", fontSize: 16 }}>{"\u25B6"}</Text>
                            </TouchableOpacity>
                          )}
                        </View>
                        <View style={{ flexDirection: "row", marginTop: 8, gap: 12 }}>
                          <View style={{ backgroundColor: "#4078e012", borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 }}>
                            <Text style={{ color: colors.accentBlue, fontSize: 12 }}>{ex.sets} sets</Text>
                          </View>
                          <View style={{ backgroundColor: "#4078e012", borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 }}>
                            <Text style={{ color: colors.accentBlue, fontSize: 12 }}>{ex.reps} reps</Text>
                          </View>
                          <View style={{ backgroundColor: "#e0a82012", borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 }}>
                            <Text style={{ color: colors.accentYellow, fontSize: 12 }}>Rest: {ex.rest}</Text>
                          </View>
                        </View>
                        <Text style={{ color: colors.textTertiary, fontSize: 12, marginTop: 8, fontStyle: "italic" }}>
                          {"\u{1F4A1}"} {ex.tip}
                        </Text>
                      </View>
                    ))}
                  </View>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* VIDEO PLAYER MODAL */}
      <Modal
        visible={!!videoExercise}
        animationType="fade"
        transparent
        onRequestClose={() => {
          if (videoRef.current) videoRef.current.stopAsync();
          setVideoExercise(null);
        }}
      >
        <View style={{ flex: 1, backgroundColor: "#000000ee", justifyContent: "center", alignItems: "center" }}>
          <View style={{ width: Dimensions.get("window").width, height: Dimensions.get("window").height * 0.5, backgroundColor: "#000", borderRadius: 20, overflow: "hidden" }}>
            {/* Header */}
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingTop: 14, paddingBottom: 10 }}>
              <Text style={{ color: "#ffffff", fontSize: 17, fontWeight: "700", flex: 1 }}>
                {videoExercise}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  if (videoRef.current) videoRef.current.stopAsync();
                  setVideoExercise(null);
                }}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  backgroundColor: "#ffffff20",
                  justifyContent: "center",
                  alignItems: "center",
                  marginLeft: 12,
                }}
              >
                <Text style={{ color: "#ffffff", fontSize: 18 }}>{"\u2715"}</Text>
              </TouchableOpacity>
            </View>

            {/* Video */}
            <View style={{ flex: 1 }}>
              {videoExercise && exerciseVideos[videoExercise] && (
                <Video
                  ref={videoRef}
                  source={exerciseVideos[videoExercise]}
                  style={{ flex: 1 }}
                  resizeMode={ResizeMode.CONTAIN}
                  shouldPlay
                  useNativeControls
                  isLooping
                />
              )}
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default ExercisesScreen;
