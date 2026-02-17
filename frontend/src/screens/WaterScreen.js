import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  RefreshControl,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import Svg, { Circle } from "react-native-svg";
import { BlurView } from "expo-blur";
import { useAuth } from "../context/domains/AuthContext";
import { useWater } from "../context/domains/WaterContext";
import { useTheme } from "../context/ThemeContext";

const GLASS_ML = 250;
const SCREEN_WIDTH = Dimensions.get("window").width;

const WaterScreen = () => {
  const { user } = useAuth();
  const {
    todayWater,
    waterAnalytics,
    loadWater,
    addGlass,
    removeGlass,
    updateGoal,
    loadAnalytics,
  } = useWater();
  const { colors, isDark, glassShadow, cardShadow } = useTheme();

  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [goalModalVisible, setGoalModalVisible] = useState(false);
  const [goalInput, setGoalInput] = useState("");

  const glasses = todayWater?.glasses ?? 0;
  const goal = todayWater?.goal ?? 8;

  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        await Promise.all([loadWater(user.id), loadAnalytics(user.id)]);
      } catch (e) {
        console.log("Failed to load water data:", e.message);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([loadWater(user.id), loadAnalytics(user.id)]);
    setRefreshing(false);
  }, [user.id, loadWater, loadAnalytics]);

  const handleAddGlass = useCallback(async () => {
    await addGlass(user.id);
  }, [user.id, addGlass]);

  const handleRemoveGlass = useCallback(async () => {
    if (glasses > 0) {
      await removeGlass(user.id);
    }
  }, [user.id, glasses, removeGlass]);

  const handleUpdateGoal = useCallback(async () => {
    const parsed = parseInt(goalInput, 10);
    if (parsed > 0 && parsed <= 30) {
      await updateGoal(user.id, parsed);
      setGoalModalVisible(false);
      setGoalInput("");
    }
  }, [user.id, goalInput, updateGoal]);

  const openGoalModal = useCallback(() => {
    setGoalInput(String(goal));
    setGoalModalVisible(true);
  }, [goal]);

  // Progress ring calculations
  const RING_SIZE = 200;
  const STROKE_WIDTH = 14;
  const RADIUS = (RING_SIZE - STROKE_WIDTH) / 2;
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
  const progress = useMemo(() => Math.min(glasses / goal, 1), [glasses, goal]);
  const strokeDashoffset = CIRCUMFERENCE * (1 - progress);

  // Stats
  const todayMl = glasses * GLASS_ML;
  const goalMl = goal * GLASS_ML;
  const remainingMl = Math.max(goalMl - todayMl, 0);
  const remainingGlasses = Math.max(goal - glasses, 0);

  // Weekly chart
  const days = waterAnalytics?.days ?? [];
  const maxGlasses = useMemo(() => {
    if (!days.length) return 8;
    return Math.max(...days.map((d) => Math.max(d.glasses, d.goal)), 1);
  }, [days]);

  const WATER_PRIMARY = "#1e90ff";
  const WATER_LIGHT = "#87cefa";

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.background,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator size="large" color={WATER_PRIMARY} />
        <Text
          style={{
            color: colors.textTertiary,
            marginTop: 12,
            fontSize: 14,
          }}
        >
          Loading water data...
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={WATER_PRIMARY}
          />
        }
      >
        {/* ===== Circular Progress Ring ===== */}
        <View
          style={{
            backgroundColor: colors.glassCard,
            borderRadius: 24,
            padding: 28,
            marginBottom: 20,
            alignItems: "center",
            borderWidth: 1,
            borderColor: colors.glassBorder,
            ...cardShadow,
          }}
        >
          <View style={{ position: "relative", width: RING_SIZE, height: RING_SIZE }}>
            <Svg width={RING_SIZE} height={RING_SIZE}>
              {/* Background track */}
              <Circle
                cx={RING_SIZE / 2}
                cy={RING_SIZE / 2}
                r={RADIUS}
                stroke={colors.glassProgressTrack}
                strokeWidth={STROKE_WIDTH}
                fill="none"
              />
              {/* Progress arc */}
              <Circle
                cx={RING_SIZE / 2}
                cy={RING_SIZE / 2}
                r={RADIUS}
                stroke={WATER_PRIMARY}
                strokeWidth={STROKE_WIDTH}
                fill="none"
                strokeLinecap="round"
                strokeDasharray={CIRCUMFERENCE}
                strokeDashoffset={strokeDashoffset}
                transform={`rotate(-90, ${RING_SIZE / 2}, ${RING_SIZE / 2})`}
              />
            </Svg>
            {/* Center text */}
            <View
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  color: colors.textPrimary,
                  fontSize: 42,
                  fontWeight: "800",
                  lineHeight: 48,
                }}
              >
                {glasses}
              </Text>
              <Text
                style={{
                  color: colors.textTertiary,
                  fontSize: 13,
                  fontWeight: "500",
                }}
              >
                of {goal} glasses
              </Text>
            </View>
          </View>

          <Text
            style={{
              color: colors.textTertiary,
              fontSize: 12,
              marginTop: 14,
            }}
          >
            {GLASS_ML}ml per glass
          </Text>

          {glasses >= goal && (
            <View
              style={{
                backgroundColor: isDark ? "rgba(30,144,255,0.12)" : "rgba(30,144,255,0.08)",
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 20,
                marginTop: 12,
              }}
            >
              <Text
                style={{
                  color: WATER_PRIMARY,
                  fontSize: 13,
                  fontWeight: "600",
                }}
              >
                Goal reached!
              </Text>
            </View>
          )}
        </View>

        {/* ===== Add / Remove Buttons ===== */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            gap: 32,
            marginBottom: 20,
          }}
        >
          {/* Remove button */}
          <TouchableOpacity
            onPress={handleRemoveGlass}
            activeOpacity={0.7}
            style={{
              width: 64,
              height: 64,
              borderRadius: 32,
              backgroundColor: glasses > 0
                ? (isDark ? "rgba(30,144,255,0.12)" : "rgba(30,144,255,0.08)")
                : (isDark ? colors.glassChip : colors.chipInactiveBg),
              justifyContent: "center",
              alignItems: "center",
              borderWidth: 1,
              borderColor: glasses > 0 ? "rgba(30,144,255,0.25)" : colors.glassBorder,
            }}
          >
            <Text
              style={{
                color: glasses > 0 ? WATER_PRIMARY : colors.textTertiary,
                fontSize: 32,
                fontWeight: "300",
                marginTop: -2,
              }}
            >
              -
            </Text>
          </TouchableOpacity>

          {/* Add button */}
          <TouchableOpacity
            onPress={handleAddGlass}
            activeOpacity={0.7}
            style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: WATER_PRIMARY,
              justifyContent: "center",
              alignItems: "center",
              shadowColor: WATER_PRIMARY,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.35,
              shadowRadius: 12,
              elevation: 8,
            }}
          >
            <Text
              style={{
                color: "#ffffff",
                fontSize: 38,
                fontWeight: "300",
                marginTop: -2,
              }}
            >
              +
            </Text>
          </TouchableOpacity>

          {/* Spacer to balance the layout (remove button is smaller) */}
          <View style={{ width: 64 }} />
        </View>

        {/* ===== Stats Row ===== */}
        <View
          style={{
            backgroundColor: colors.glassCard,
            borderRadius: 18,
            padding: 18,
            marginBottom: 20,
            flexDirection: "row",
            justifyContent: "space-around",
            borderWidth: 1,
            borderColor: colors.glassBorder,
            ...cardShadow,
          }}
        >
          <View style={{ alignItems: "center", flex: 1 }}>
            <Text
              style={{
                color: WATER_PRIMARY,
                fontSize: 24,
                fontWeight: "800",
              }}
            >
              {todayMl}
            </Text>
            <Text
              style={{
                color: colors.textTertiary,
                fontSize: 11,
                marginTop: 3,
              }}
            >
              ml today
            </Text>
          </View>
          <View
            style={{
              width: 1,
              backgroundColor: colors.glassBorderStrong,
              marginVertical: 4,
            }}
          />
          <View style={{ alignItems: "center", flex: 1 }}>
            <Text
              style={{
                color: colors.textPrimary,
                fontSize: 24,
                fontWeight: "800",
              }}
            >
              {goalMl}
            </Text>
            <Text
              style={{
                color: colors.textTertiary,
                fontSize: 11,
                marginTop: 3,
              }}
            >
              ml goal
            </Text>
          </View>
          <View
            style={{
              width: 1,
              backgroundColor: colors.glassBorderStrong,
              marginVertical: 4,
            }}
          />
          <View style={{ alignItems: "center", flex: 1 }}>
            <Text
              style={{
                color: remainingGlasses > 0 ? WATER_LIGHT : colors.accentGreen,
                fontSize: 24,
                fontWeight: "800",
              }}
            >
              {remainingMl}
            </Text>
            <Text
              style={{
                color: colors.textTertiary,
                fontSize: 11,
                marginTop: 3,
              }}
            >
              ml left
            </Text>
          </View>
        </View>

        {/* ===== Weekly Chart ===== */}
        <View
          style={{
            backgroundColor: colors.glassCard,
            borderRadius: 18,
            padding: 20,
            marginBottom: 20,
            borderWidth: 1,
            borderColor: colors.glassBorder,
            ...cardShadow,
          }}
        >
          <Text
            style={{
              color: colors.textPrimary,
              fontSize: 16,
              fontWeight: "700",
              marginBottom: 6,
            }}
          >
            Weekly Overview
          </Text>
          {waterAnalytics?.totalGlasses != null && (
            <Text
              style={{
                color: colors.textTertiary,
                fontSize: 12,
                marginBottom: 18,
              }}
            >
              {waterAnalytics.totalGlasses} glasses total | avg{" "}
              {waterAnalytics.avgGlasses?.toFixed(1)} / day
            </Text>
          )}

          {days.length > 0 ? (
            <View
              style={{
                flexDirection: "row",
                alignItems: "flex-end",
                justifyContent: "space-between",
                height: 140,
              }}
            >
              {days.map((day, index) => {
                const barHeight = maxGlasses > 0
                  ? (day.glasses / maxGlasses) * 110
                  : 0;
                const goalLineHeight = maxGlasses > 0
                  ? (day.goal / maxGlasses) * 110
                  : 0;
                const isToday = index === days.length - 1;
                const metGoal = day.glasses >= day.goal;

                return (
                  <View
                    key={day.date || index}
                    style={{
                      flex: 1,
                      alignItems: "center",
                      marginHorizontal: 2,
                    }}
                  >
                    {/* Glasses count above bar */}
                    <Text
                      style={{
                        color: isToday ? WATER_PRIMARY : colors.textTertiary,
                        fontSize: 10,
                        fontWeight: "600",
                        marginBottom: 4,
                      }}
                    >
                      {day.glasses}
                    </Text>

                    {/* Bar container */}
                    <View
                      style={{
                        width: "70%",
                        height: 110,
                        justifyContent: "flex-end",
                        alignItems: "center",
                        position: "relative",
                      }}
                    >
                      {/* Goal line indicator */}
                      <View
                        style={{
                          position: "absolute",
                          bottom: goalLineHeight,
                          left: -2,
                          right: -2,
                          height: 1.5,
                          backgroundColor: isDark
                            ? "rgba(135,206,250,0.25)"
                            : "rgba(30,144,255,0.2)",
                          borderRadius: 1,
                        }}
                      />

                      {/* Bar */}
                      <View
                        style={{
                          width: "100%",
                          height: Math.max(barHeight, 3),
                          borderRadius: 6,
                          backgroundColor: metGoal
                            ? WATER_PRIMARY
                            : isToday
                            ? WATER_LIGHT
                            : isDark
                            ? "rgba(30,144,255,0.3)"
                            : "rgba(30,144,255,0.2)",
                        }}
                      />
                    </View>

                    {/* Day label */}
                    <Text
                      style={{
                        color: isToday ? WATER_PRIMARY : colors.textTertiary,
                        fontSize: 11,
                        fontWeight: isToday ? "700" : "500",
                        marginTop: 6,
                      }}
                    >
                      {day.day}
                    </Text>
                  </View>
                );
              })}
            </View>
          ) : (
            <View style={{ alignItems: "center", paddingVertical: 30 }}>
              <Text style={{ color: colors.textTertiary, fontSize: 13 }}>
                No data yet. Start tracking!
              </Text>
            </View>
          )}
        </View>

        {/* ===== Goal Setter ===== */}
        <TouchableOpacity
          onPress={openGoalModal}
          activeOpacity={0.7}
          style={{
            backgroundColor: colors.glassCard,
            borderRadius: 18,
            padding: 20,
            marginBottom: 20,
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            borderWidth: 1,
            borderColor: colors.glassBorder,
            ...cardShadow,
          }}
        >
          <View>
            <Text
              style={{
                color: colors.textPrimary,
                fontSize: 15,
                fontWeight: "600",
              }}
            >
              Daily Goal
            </Text>
            <Text
              style={{
                color: colors.textTertiary,
                fontSize: 12,
                marginTop: 4,
              }}
            >
              {goal} glasses ({goalMl}ml)
            </Text>
          </View>
          <View
            style={{
              backgroundColor: isDark
                ? "rgba(30,144,255,0.12)"
                : "rgba(30,144,255,0.08)",
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 20,
              borderWidth: 1,
              borderColor: "rgba(30,144,255,0.2)",
            }}
          >
            <Text
              style={{
                color: WATER_PRIMARY,
                fontSize: 13,
                fontWeight: "600",
              }}
            >
              Change
            </Text>
          </View>
        </TouchableOpacity>
      </ScrollView>

      {/* ===== Goal Modal ===== */}
      <Modal visible={goalModalVisible} animationType="slide" transparent>
        <View style={{ flex: 1, justifyContent: "flex-end" }}>
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => setGoalModalVisible(false)}
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
              <View
                style={{
                  width: 40,
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: colors.borderHandle,
                }}
              />
            </View>

            <Text
              style={{
                color: colors.textPrimary,
                fontSize: 22,
                fontWeight: "700",
                marginBottom: 8,
              }}
            >
              Set Daily Goal
            </Text>
            <Text
              style={{
                color: colors.textTertiary,
                fontSize: 13,
                marginBottom: 24,
              }}
            >
              How many glasses of water ({GLASS_ML}ml each) do you want to drink daily?
            </Text>

            <TextInput
              value={goalInput}
              onChangeText={setGoalInput}
              placeholder="e.g. 8"
              placeholderTextColor={colors.textTertiary}
              keyboardType="number-pad"
              maxLength={2}
              style={{
                backgroundColor: colors.glassInput,
                color: colors.textPrimary,
                borderRadius: 14,
                padding: 16,
                fontSize: 20,
                fontWeight: "700",
                textAlign: "center",
                borderWidth: 1,
                borderColor: colors.glassBorder,
                marginBottom: 12,
              }}
            />

            {goalInput && parseInt(goalInput, 10) > 0 && (
              <Text
                style={{
                  color: colors.textTertiary,
                  fontSize: 12,
                  textAlign: "center",
                  marginBottom: 16,
                }}
              >
                = {parseInt(goalInput, 10) * GLASS_ML}ml per day
              </Text>
            )}

            {/* Quick select */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "center",
                gap: 10,
                marginBottom: 28,
              }}
            >
              {[6, 8, 10, 12].map((num) => (
                <TouchableOpacity
                  key={num}
                  onPress={() => setGoalInput(String(num))}
                  style={{
                    backgroundColor:
                      goalInput === String(num)
                        ? WATER_PRIMARY
                        : colors.glassChip,
                    paddingHorizontal: 18,
                    paddingVertical: 10,
                    borderRadius: 22,
                    borderWidth: goalInput === String(num) ? 0 : 1,
                    borderColor:
                      goalInput === String(num)
                        ? "transparent"
                        : colors.glassChipBorder,
                  }}
                >
                  <Text
                    style={{
                      color:
                        goalInput === String(num)
                          ? "#ffffff"
                          : colors.textSecondary,
                      fontSize: 14,
                      fontWeight: "600",
                    }}
                  >
                    {num}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={{ flexDirection: "row", gap: 12 }}>
              <TouchableOpacity
                onPress={() => setGoalModalVisible(false)}
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
                <Text
                  style={{
                    color: colors.textSecondary,
                    fontWeight: "600",
                  }}
                >
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleUpdateGoal}
                style={{
                  flex: 1,
                  padding: 16,
                  borderRadius: 14,
                  backgroundColor: WATER_PRIMARY,
                  alignItems: "center",
                }}
              >
                <Text style={{ color: "#ffffff", fontWeight: "600" }}>
                  Save
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default WaterScreen;
