import React, { useEffect, useState, useMemo, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  Platform,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { useAuth } from "../context/domains/AuthContext";
import { useSleep } from "../context/domains/SleepContext";
import { useTheme } from "../context/ThemeContext";
import DateTimePicker from "@react-native-community/datetimepicker";

const SLEEP_PURPLE = "#9370db";

const qualityOptions = [
  { key: "poor", label: "Poor", color: "#e05555" },
  { key: "fair", label: "Fair", color: "#e0a820" },
  { key: "good", label: "Good", color: "#2bb883" },
  { key: "excellent", label: "Excellent", color: "#6a94c8" },
];

const getQualityInfo = (key) =>
  qualityOptions.find((q) => q.key === key) || qualityOptions[0];

const formatTime = (dateOrString) => {
  if (!dateOrString) return "--:--";
  const d = typeof dateOrString === "string" ? new Date(dateOrString) : dateOrString;
  if (isNaN(d.getTime())) {
    // Handle HH:MM:SS or HH:MM string format
    const parts = String(dateOrString).split(":");
    if (parts.length >= 2) {
      const h = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10);
      const ampm = h >= 12 ? "PM" : "AM";
      const h12 = h % 12 || 12;
      return `${h12}:${String(m).padStart(2, "0")} ${ampm}`;
    }
    return "--:--";
  }
  const h = d.getHours();
  const m = d.getMinutes();
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${h12}:${String(m).padStart(2, "0")} ${ampm}`;
};

const formatDateShort = (dateStr) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return `${days[d.getDay()]}, ${months[d.getMonth()]} ${d.getDate()}`;
};

const getYesterday = () => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split("T")[0];
};

const SleepScreen = ({ navigation }) => {
  const { user } = useAuth();
  const {
    sleepLogs,
    sleepSummary,
    sleepAnalytics,
    loadSleep,
    addSleepLog,
    removeSleepLog,
    loadAnalytics,
  } = useSleep();
  const { colors, isDark, glassShadow } = useTheme();

  const [refreshing, setRefreshing] = useState(false);
  const [addModal, setAddModal] = useState(false);

  // Form state
  const [sleepDate, setSleepDate] = useState(getYesterday());
  const [bedtime, setBedtime] = useState(() => {
    const d = new Date();
    d.setHours(22, 0, 0, 0);
    return d;
  });
  const [wakeTime, setWakeTime] = useState(() => {
    const d = new Date();
    d.setHours(6, 0, 0, 0);
    return d;
  });
  const [quality, setQuality] = useState("good");
  const [notes, setNotes] = useState("");

  // Android picker visibility
  const [showBedtimePicker, setShowBedtimePicker] = useState(false);
  const [showWakeTimePicker, setShowWakeTimePicker] = useState(false);

  useEffect(() => {
    if (user?.id) {
      loadSleep(user.id);
      loadAnalytics(user.id);
    }
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([loadSleep(user.id), loadAnalytics(user.id)]);
    setRefreshing(false);
  }, [user?.id, loadSleep, loadAnalytics]);

  const todayLog = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];
    const yesterday = getYesterday();
    return sleepLogs.find(
      (log) => log.sleep_date === today || log.sleep_date === yesterday
    );
  }, [sleepLogs]);

  const recentLogs = useMemo(() => {
    return [...sleepLogs]
      .sort((a, b) => new Date(b.sleep_date) - new Date(a.sleep_date))
      .slice(0, 7);
  }, [sleepLogs]);

  const chartDays = useMemo(() => {
    if (sleepAnalytics?.days?.length) {
      return sleepAnalytics.days;
    }
    return [];
  }, [sleepAnalytics]);

  const maxChartHours = useMemo(() => {
    const maxFromData = Math.max(...chartDays.map((d) => d.hours || 0), 0);
    return Math.max(maxFromData, 10);
  }, [chartDays]);

  const resetForm = () => {
    setSleepDate(getYesterday());
    const bed = new Date();
    bed.setHours(22, 0, 0, 0);
    setBedtime(bed);
    const wake = new Date();
    wake.setHours(6, 0, 0, 0);
    setWakeTime(wake);
    setQuality("good");
    setNotes("");
  };

  const handleAdd = async () => {
    const bedHour = bedtime.getHours();
    const bedMin = bedtime.getMinutes();
    const wakeHour = wakeTime.getHours();
    const wakeMin = wakeTime.getMinutes();

    const bedtimeStr = `${String(bedHour).padStart(2, "0")}:${String(bedMin).padStart(2, "0")}:00`;
    const wakeTimeStr = `${String(wakeHour).padStart(2, "0")}:${String(wakeMin).padStart(2, "0")}:00`;

    await addSleepLog({
      profile_id: user.id,
      sleep_date: sleepDate,
      bedtime: bedtimeStr,
      wake_time: wakeTimeStr,
      quality,
      notes: notes.trim() || null,
    });

    resetForm();
    setAddModal(false);
    loadSleep(user.id);
    loadAnalytics(user.id);
  };

  const handleDelete = useCallback(
    (id, date) => {
      Alert.alert("Delete Sleep Log", `Remove log for ${formatDateShort(date)}?`, [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            await removeSleepLog(id);
            loadSleep(user.id);
            loadAnalytics(user.id);
          },
        },
      ]);
    },
    [removeSleepLog, loadSleep, loadAnalytics, user?.id]
  );

  const onBedtimeChange = (event, selectedDate) => {
    if (Platform.OS === "android") setShowBedtimePicker(false);
    if (selectedDate) setBedtime(selectedDate);
  };

  const onWakeTimeChange = (event, selectedDate) => {
    if (Platform.OS === "android") setShowWakeTimePicker(false);
    if (selectedDate) setWakeTime(selectedDate);
  };

  const renderRecentLog = useCallback(
    ({ item: log }) => {
      const qi = getQualityInfo(log.quality);
      return (
        <View
          style={{
            backgroundColor: colors.glassCard,
            borderRadius: 14,
            padding: 16,
            marginBottom: 10,
            borderWidth: 1,
            borderColor: colors.glassBorder,
            borderTopWidth: 1,
            borderTopColor: colors.glassHighlight,
            flexDirection: "row",
            alignItems: "center",
            ...glassShadow,
          }}
        >
          {/* Date */}
          <View style={{ width: 56, marginRight: 14 }}>
            <Text
              style={{
                color: colors.textSecondary,
                fontSize: 11,
                fontWeight: "600",
              }}
            >
              {formatDateShort(log.sleep_date)}
            </Text>
          </View>

          {/* Time range */}
          <View style={{ flex: 1 }}>
            <Text style={{ color: colors.textPrimary, fontSize: 14, fontWeight: "600" }}>
              {formatTime(log.bedtime)} {"\u2192"} {formatTime(log.wake_time)}
            </Text>
            <Text style={{ color: SLEEP_PURPLE, fontSize: 12, marginTop: 3, fontWeight: "500" }}>
              {log.duration_hours != null
                ? `${Number(log.duration_hours).toFixed(1)} hrs`
                : "--"}
            </Text>
          </View>

          {/* Quality badge */}
          <View
            style={{
              backgroundColor: `${qi.color}18`,
              borderRadius: 10,
              paddingHorizontal: 10,
              paddingVertical: 5,
              marginRight: 10,
            }}
          >
            <Text style={{ color: qi.color, fontSize: 11, fontWeight: "600" }}>
              {qi.label}
            </Text>
          </View>

          {/* Delete */}
          <TouchableOpacity
            onPress={() => handleDelete(log.id, log.sleep_date)}
            style={{ padding: 4 }}
          >
            <Ionicons name="trash-outline" size={16} color="#e0555550" />
          </TouchableOpacity>
        </View>
      );
    },
    [colors, isDark, glassShadow, handleDelete]
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={SLEEP_PURPLE}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* ============ TODAY'S SLEEP CARD ============ */}
        <View
          style={{
            backgroundColor: colors.glassCard,
            borderRadius: 20,
            padding: 22,
            marginBottom: 20,
            borderWidth: 1,
            borderColor: colors.glassBorder,
            borderTopWidth: 1,
            borderTopColor: colors.glassHighlight,
            ...glassShadow,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                backgroundColor: `${SLEEP_PURPLE}15`,
                justifyContent: "center",
                alignItems: "center",
                marginRight: 12,
              }}
            >
              <Ionicons name="moon" size={20} color={SLEEP_PURPLE} />
            </View>
            <View>
              <Text
                style={{
                  color: colors.textTertiary,
                  fontSize: 12,
                  letterSpacing: 0.5,
                }}
              >
                LAST NIGHT'S SLEEP
              </Text>
              <Text
                style={{
                  color: colors.textPrimary,
                  fontSize: 14,
                  fontWeight: "600",
                  marginTop: 2,
                }}
              >
                {todayLog
                  ? formatDateShort(todayLog.sleep_date)
                  : "No data yet"}
              </Text>
            </View>
          </View>

          {todayLog ? (
            <>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                {/* Bedtime -> Wake time */}
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      color: colors.textSecondary,
                      fontSize: 12,
                      marginBottom: 4,
                    }}
                  >
                    Bedtime {"\u2192"} Wake
                  </Text>
                  <Text
                    style={{
                      color: colors.textPrimary,
                      fontSize: 16,
                      fontWeight: "700",
                    }}
                  >
                    {formatTime(todayLog.bedtime)} {"\u2192"}{" "}
                    {formatTime(todayLog.wake_time)}
                  </Text>
                </View>

                {/* Duration */}
                <View style={{ alignItems: "center", marginHorizontal: 16 }}>
                  <Text
                    style={{
                      color: SLEEP_PURPLE,
                      fontSize: 32,
                      fontWeight: "800",
                    }}
                  >
                    {todayLog.duration_hours != null
                      ? Number(todayLog.duration_hours).toFixed(1)
                      : "--"}
                  </Text>
                  <Text
                    style={{
                      color: colors.textTertiary,
                      fontSize: 12,
                      marginTop: 2,
                    }}
                  >
                    hours
                  </Text>
                </View>

                {/* Quality badge */}
                {(() => {
                  const qi = getQualityInfo(todayLog.quality);
                  return (
                    <View
                      style={{
                        backgroundColor: `${qi.color}18`,
                        borderRadius: 12,
                        paddingHorizontal: 14,
                        paddingVertical: 8,
                        borderWidth: 1,
                        borderColor: `${qi.color}30`,
                      }}
                    >
                      <Text
                        style={{
                          color: qi.color,
                          fontSize: 13,
                          fontWeight: "700",
                          textTransform: "capitalize",
                        }}
                      >
                        {qi.label}
                      </Text>
                    </View>
                  );
                })()}
              </View>
            </>
          ) : (
            <View style={{ alignItems: "center", paddingVertical: 12 }}>
              <Text style={{ color: colors.textTertiary, fontSize: 13 }}>
                Tap + to log your sleep
              </Text>
            </View>
          )}
        </View>

        {/* ============ STATS ROW ============ */}
        <View
          style={{
            flexDirection: "row",
            gap: 10,
            marginBottom: 22,
          }}
        >
          {[
            {
              label: "Avg Duration",
              value: sleepSummary?.avgDuration
                ? `${Number(sleepSummary.avgDuration).toFixed(1)}h`
                : "--",
              icon: "time-outline",
              color: SLEEP_PURPLE,
            },
            {
              label: "Avg Quality",
              value: sleepSummary?.avgQuality
                ? sleepSummary.avgQuality.charAt(0).toUpperCase() +
                  sleepSummary.avgQuality.slice(1)
                : "--",
              icon: "star-outline",
              color: "#e0a820",
            },
            {
              label: "Total Logs",
              value:
                sleepSummary?.totalLogs != null
                  ? String(sleepSummary.totalLogs)
                  : "--",
              icon: "calendar-outline",
              color: "#6a94c8",
            },
          ].map((stat) => (
            <View
              key={stat.label}
              style={{
                flex: 1,
                backgroundColor: colors.glassCard,
                borderRadius: 14,
                padding: 14,
                alignItems: "center",
                borderWidth: 1,
                borderColor: colors.glassBorder,
                ...glassShadow,
              }}
            >
              <View
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 10,
                  backgroundColor: `${stat.color}12`,
                  justifyContent: "center",
                  alignItems: "center",
                  marginBottom: 8,
                }}
              >
                <Ionicons name={stat.icon} size={16} color={stat.color} />
              </View>
              <Text
                style={{
                  color: colors.textPrimary,
                  fontSize: 18,
                  fontWeight: "800",
                }}
              >
                {stat.value}
              </Text>
              <Text
                style={{
                  color: colors.textTertiary,
                  fontSize: 10,
                  marginTop: 3,
                }}
              >
                {stat.label}
              </Text>
            </View>
          ))}
        </View>

        {/* ============ WEEKLY CHART ============ */}
        <View
          style={{
            backgroundColor: colors.glassCard,
            borderRadius: 18,
            padding: 20,
            marginBottom: 22,
            borderWidth: 1,
            borderColor: colors.glassBorder,
            borderTopWidth: 1,
            borderTopColor: colors.glassHighlight,
            ...glassShadow,
          }}
        >
          <Text
            style={{
              color: colors.textPrimary,
              fontSize: 16,
              fontWeight: "700",
              marginBottom: 16,
            }}
          >
            Weekly Sleep
          </Text>

          {chartDays.length > 0 ? (
            <View style={{ height: 160 }}>
              {/* 8hr reference line */}
              <View
                style={{
                  position: "absolute",
                  left: 30,
                  right: 0,
                  bottom: 20 + (8 / maxChartHours) * 120,
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <View
                  style={{
                    flex: 1,
                    height: 1,
                    borderStyle: "dashed",
                    borderWidth: 0.5,
                    borderColor: colors.textTertiary,
                  }}
                />
                <Text
                  style={{
                    color: colors.textTertiary,
                    fontSize: 9,
                    marginLeft: 4,
                  }}
                >
                  8h
                </Text>
              </View>

              {/* Y-axis labels */}
              <View
                style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  bottom: 20,
                  width: 26,
                  justifyContent: "space-between",
                }}
              >
                <Text style={{ color: colors.textTertiary, fontSize: 9 }}>
                  {maxChartHours}h
                </Text>
                <Text style={{ color: colors.textTertiary, fontSize: 9 }}>
                  0h
                </Text>
              </View>

              {/* Bars */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "flex-end",
                  justifyContent: "space-around",
                  flex: 1,
                  marginLeft: 30,
                  paddingBottom: 20,
                }}
              >
                {chartDays.map((day, index) => {
                  const hours = day.hours || 0;
                  const barHeight = Math.max(
                    4,
                    (hours / maxChartHours) * 120
                  );
                  const qi = getQualityInfo(day.quality);
                  const barColor = day.quality ? qi.color : SLEEP_PURPLE;

                  return (
                    <View
                      key={index}
                      style={{ alignItems: "center", flex: 1 }}
                    >
                      {/* Hours label on top */}
                      <Text
                        style={{
                          color: colors.textTertiary,
                          fontSize: 9,
                          marginBottom: 4,
                          fontWeight: "600",
                        }}
                      >
                        {hours > 0 ? hours.toFixed(1) : ""}
                      </Text>

                      {/* Bar */}
                      <View
                        style={{
                          width: 24,
                          height: barHeight,
                          borderRadius: 6,
                          backgroundColor: hours > 0 ? barColor : colors.glassProgressTrack,
                          opacity: hours > 0 ? 0.85 : 0.3,
                        }}
                      />

                      {/* Day label */}
                      <Text
                        style={{
                          color: colors.textTertiary,
                          fontSize: 10,
                          marginTop: 6,
                          fontWeight: "500",
                        }}
                      >
                        {day.day || ""}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </View>
          ) : (
            <View style={{ alignItems: "center", paddingVertical: 30 }}>
              <Text style={{ color: colors.textTertiary, fontSize: 13 }}>
                No sleep data for the past week
              </Text>
            </View>
          )}
        </View>

        {/* ============ RECENT LOGS ============ */}
        <Text
          style={{
            color: colors.textPrimary,
            fontSize: 16,
            fontWeight: "700",
            marginBottom: 14,
          }}
        >
          Recent Logs
        </Text>

        {recentLogs.length > 0 ? (
          <FlatList
            data={recentLogs}
            keyExtractor={(item) => String(item.id)}
            renderItem={renderRecentLog}
            scrollEnabled={false}
            removeClippedSubviews={false}
          />
        ) : (
          <View
            style={{
              alignItems: "center",
              paddingVertical: 36,
              backgroundColor: colors.glassCard,
              borderRadius: 14,
              borderWidth: 1,
              borderColor: colors.glassBorder,
              ...glassShadow,
            }}
          >
            <Ionicons
              name="bed-outline"
              size={36}
              color={colors.textTertiary}
            />
            <Text
              style={{
                color: colors.textTertiary,
                marginTop: 10,
                fontSize: 13,
              }}
            >
              No sleep logs yet
            </Text>
          </View>
        )}
      </ScrollView>

      {/* ============ FLOATING ADD BUTTON ============ */}
      <TouchableOpacity
        onPress={() => setAddModal(true)}
        style={{
          position: "absolute",
          bottom: 20,
          right: 20,
          backgroundColor: SLEEP_PURPLE,
          width: 58,
          height: 58,
          borderRadius: 18,
          justifyContent: "center",
          alignItems: "center",
          elevation: 8,
          shadowColor: SLEEP_PURPLE,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
        }}
      >
        <Text
          style={{
            color: "#ffffff",
            fontSize: 28,
            fontWeight: "300",
            marginTop: -2,
          }}
        >
          +
        </Text>
      </TouchableOpacity>

      {/* ============ ADD SLEEP MODAL ============ */}
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
            {/* Drag handle */}
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
                marginBottom: 20,
              }}
            >
              Log Sleep
            </Text>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Sleep Date */}
              <Text
                style={{
                  color: colors.textSecondary,
                  fontSize: 12,
                  marginBottom: 8,
                  fontWeight: "600",
                }}
              >
                Sleep Date
              </Text>
              <TextInput
                value={sleepDate}
                onChangeText={setSleepDate}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={colors.textTertiary}
                style={{
                  backgroundColor: colors.glassInput,
                  color: colors.textPrimary,
                  borderRadius: 14,
                  padding: 16,
                  fontSize: 15,
                  marginBottom: 16,
                  borderWidth: 1,
                  borderColor: colors.glassBorder,
                }}
              />

              {/* Bedtime Picker */}
              <Text
                style={{
                  color: colors.textSecondary,
                  fontSize: 12,
                  marginBottom: 8,
                  fontWeight: "600",
                }}
              >
                Bedtime
              </Text>
              {Platform.OS === "ios" ? (
                <View
                  style={{
                    backgroundColor: colors.glassInput,
                    borderRadius: 14,
                    marginBottom: 16,
                    borderWidth: 1,
                    borderColor: colors.glassBorder,
                    overflow: "hidden",
                  }}
                >
                  <DateTimePicker
                    value={bedtime}
                    mode="time"
                    display="spinner"
                    onChange={onBedtimeChange}
                    textColor={colors.textPrimary}
                    style={{ height: 120 }}
                  />
                </View>
              ) : (
                <>
                  <TouchableOpacity
                    onPress={() => setShowBedtimePicker(true)}
                    style={{
                      backgroundColor: colors.glassInput,
                      borderRadius: 14,
                      padding: 16,
                      marginBottom: 16,
                      borderWidth: 1,
                      borderColor: colors.glassBorder,
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Text
                      style={{
                        color: colors.textPrimary,
                        fontSize: 15,
                      }}
                    >
                      {formatTime(bedtime)}
                    </Text>
                    <Ionicons
                      name="time-outline"
                      size={18}
                      color={SLEEP_PURPLE}
                    />
                  </TouchableOpacity>
                  {showBedtimePicker && (
                    <DateTimePicker
                      value={bedtime}
                      mode="time"
                      display="default"
                      onChange={onBedtimeChange}
                    />
                  )}
                </>
              )}

              {/* Wake Time Picker */}
              <Text
                style={{
                  color: colors.textSecondary,
                  fontSize: 12,
                  marginBottom: 8,
                  fontWeight: "600",
                }}
              >
                Wake Time
              </Text>
              {Platform.OS === "ios" ? (
                <View
                  style={{
                    backgroundColor: colors.glassInput,
                    borderRadius: 14,
                    marginBottom: 16,
                    borderWidth: 1,
                    borderColor: colors.glassBorder,
                    overflow: "hidden",
                  }}
                >
                  <DateTimePicker
                    value={wakeTime}
                    mode="time"
                    display="spinner"
                    onChange={onWakeTimeChange}
                    textColor={colors.textPrimary}
                    style={{ height: 120 }}
                  />
                </View>
              ) : (
                <>
                  <TouchableOpacity
                    onPress={() => setShowWakeTimePicker(true)}
                    style={{
                      backgroundColor: colors.glassInput,
                      borderRadius: 14,
                      padding: 16,
                      marginBottom: 16,
                      borderWidth: 1,
                      borderColor: colors.glassBorder,
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Text
                      style={{
                        color: colors.textPrimary,
                        fontSize: 15,
                      }}
                    >
                      {formatTime(wakeTime)}
                    </Text>
                    <Ionicons
                      name="time-outline"
                      size={18}
                      color={SLEEP_PURPLE}
                    />
                  </TouchableOpacity>
                  {showWakeTimePicker && (
                    <DateTimePicker
                      value={wakeTime}
                      mode="time"
                      display="default"
                      onChange={onWakeTimeChange}
                    />
                  )}
                </>
              )}

              {/* Quality Selector */}
              <Text
                style={{
                  color: colors.textSecondary,
                  fontSize: 12,
                  marginBottom: 10,
                  fontWeight: "600",
                }}
              >
                Quality
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  gap: 8,
                  marginBottom: 16,
                }}
              >
                {qualityOptions.map((opt) => (
                  <TouchableOpacity
                    key={opt.key}
                    onPress={() => setQuality(opt.key)}
                    style={{
                      flex: 1,
                      paddingVertical: 12,
                      borderRadius: 12,
                      backgroundColor:
                        quality === opt.key
                          ? `${opt.color}18`
                          : colors.glassInput,
                      alignItems: "center",
                      borderWidth: 1,
                      borderColor:
                        quality === opt.key
                          ? `${opt.color}30`
                          : colors.glassBorder,
                    }}
                  >
                    <Text
                      style={{
                        color:
                          quality === opt.key
                            ? opt.color
                            : colors.textSecondary,
                        fontSize: 12,
                        fontWeight: "600",
                      }}
                    >
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Notes */}
              <Text
                style={{
                  color: colors.textSecondary,
                  fontSize: 12,
                  marginBottom: 8,
                  fontWeight: "600",
                }}
              >
                Notes (optional)
              </Text>
              <TextInput
                value={notes}
                onChangeText={setNotes}
                placeholder="How did you sleep?"
                placeholderTextColor={colors.textTertiary}
                multiline
                numberOfLines={3}
                style={{
                  backgroundColor: colors.glassInput,
                  color: colors.textPrimary,
                  borderRadius: 14,
                  padding: 16,
                  fontSize: 15,
                  marginBottom: 16,
                  borderWidth: 1,
                  borderColor: colors.glassBorder,
                  minHeight: 80,
                  textAlignVertical: "top",
                }}
              />
            </ScrollView>

            {/* Buttons */}
            <View style={{ flexDirection: "row", gap: 12, marginTop: 8 }}>
              <TouchableOpacity
                onPress={() => {
                  resetForm();
                  setAddModal(false);
                }}
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
                onPress={handleAdd}
                style={{
                  flex: 1,
                  padding: 16,
                  borderRadius: 14,
                  backgroundColor: SLEEP_PURPLE,
                  alignItems: "center",
                }}
              >
                <Text style={{ color: "#ffffff", fontWeight: "600" }}>
                  Save Sleep
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default SleepScreen;
