import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Platform,
  StatusBar,
  Modal,
  Animated,
  Share,
  Linking,
  Switch,
  Alert,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { BlurView } from "expo-blur";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useAuth } from "../context/domains/AuthContext";
import { useProfile } from "../context/domains/ProfileContext";
import { useTabVisibility } from "../context/domains/TabVisibilityContext";
import { useTheme } from "../context/ThemeContext";
import { useToast } from "../context/ToastContext";
import DashboardScreen from "./DashboardScreen";
import HabitsScreen from "./HabitsScreen";
import DebtsScreen from "./DebtsScreen";
import ExercisesScreen from "./ExercisesScreen";
import FinanceScreen from "./FinanceScreen";
import GoalsScreen from "./GoalsScreen";

const tabs = [
  { key: "dashboard", label: "Dashboard", icon: "grid-outline", iconActive: "grid", color: "#c09460" },
  { key: "habits", label: "Habits", icon: "flame-outline", iconActive: "flame", color: "#e05555" },
  { key: "finance", label: "Finance", icon: "cash-outline", iconActive: "cash", color: "#2bb883" },
  { key: "goals", label: "Goals", icon: "trophy-outline", iconActive: "trophy", color: "#e0a820" },
  { key: "workout", label: "Workout", icon: "barbell-outline", iconActive: "barbell", color: "#e06612" },
  { key: "debts", label: "Debts", icon: "wallet-outline", iconActive: "wallet", color: "#5494e0" },
];

const ALWAYS_ON = new Set(["dashboard", "habits"]);

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const DRAWER_WIDTH = SCREEN_WIDTH * 0.78;

const formatTime12 = (time) => {
  const h24 = parseInt(time.split(":")[0]) || 0;
  const m = time.split(":")[1] || "00";
  const period = h24 >= 12 ? "PM" : "AM";
  const h12 = h24 === 0 ? 12 : h24 > 12 ? h24 - 12 : h24;
  return `${h12}:${m} ${period}`;
};

const HomeScreen = ({ navigation }) => {
  const { user, onLogout } = useAuth();
  const { profile, updateNotificationSettings } = useProfile();
  const { tabVisibility } = useTabVisibility();
  const { colors, isDark, toggleTheme } = useTheme();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [menuVisible, setMenuVisible] = useState(false);
  const menuAnim = useRef(new Animated.Value(0)).current;

  // Reminder state
  const [notificationsEnabled, setNotificationsEnabled] = useState(profile?.notifications_enabled ?? true);
  const [reminderTime, setReminderTime] = useState(profile?.reminder_time || "08:00");
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [reminderExpanded, setReminderExpanded] = useState(false);

  useEffect(() => {
    if (profile) {
      setNotificationsEnabled(profile.notifications_enabled ?? true);
      setReminderTime(profile.reminder_time || "08:00");
    }
  }, [profile]);

  const pickerDate = (() => {
    const [h, m] = (reminderTime || "08:00").split(":").map(Number);
    const d = new Date();
    d.setHours(h || 0, m || 0, 0, 0);
    return d;
  })();

  const openMenu = () => {
    setMenuVisible(true);
    Animated.spring(menuAnim, {
      toValue: 1,
      useNativeDriver: true,
      damping: 22,
      stiffness: 220,
    }).start();
  };

  const closeMenu = (callback) => {
    Animated.timing(menuAnim, {
      toValue: 0,
      duration: 220,
      useNativeDriver: true,
    }).start(() => {
      setMenuVisible(false);
      if (callback) callback();
    });
  };

  const handleShare = async () => {
    closeMenu(async () => {
      try {
        await Share.share({
          message: "Check out LifeStack - Build Your Empire! 🚀",
        });
      } catch (_) {}
    });
  };

  const handleRateUs = () => {
    closeMenu(() => {
      const storeUrl = Platform.OS === "ios"
        ? "https://apps.apple.com"
        : "https://play.google.com/store";
      Linking.openURL(storeUrl).catch(() =>
        showToast("Couldn't open the store", "error")
      );
    });
  };

  const handleLogout = () => {
    closeMenu(() => {
      Alert.alert("Logout", "Are you sure you want to sign out?", [
        { text: "Cancel", style: "cancel" },
        { text: "Logout", style: "destructive", onPress: onLogout },
      ]);
    });
  };

  const visibleTabs = useMemo(
    () => tabs.filter((t) => ALWAYS_ON.has(t.key) || tabVisibility[t.key] !== false),
    [tabVisibility]
  );

  // Auto-switch to dashboard if current tab gets hidden
  useEffect(() => {
    if (!visibleTabs.some((t) => t.key === activeTab)) setActiveTab("dashboard");
  }, [visibleTabs, activeTab]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header + Tabs */}
      <View
        style={{
          paddingTop: Platform.OS === "ios" ? 54 : (StatusBar.currentHeight || 24) + 10,
          backgroundColor: colors.background,
        }}
      >
        {/* App Header */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            paddingHorizontal: 20,
            marginBottom: 16,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <TouchableOpacity
              onPress={openMenu}
              activeOpacity={0.7}
              style={{
                width: 38,
                height: 38,
                borderRadius: 12,
                backgroundColor: colors.glassChip,
                justifyContent: "center",
                alignItems: "center",
                marginRight: 8,
                borderWidth: 1,
                borderColor: colors.glassChipBorder,
              }}
            >
              <Ionicons name="menu" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => navigation.navigate("Profile")}
              activeOpacity={0.7}
              style={{
                width: 38,
                height: 38,
                borderRadius: 19,
                backgroundColor: "#84643820",
                justifyContent: "center",
                alignItems: "center",
                marginRight: 10,
                borderWidth: 1,
                borderColor: "#84643830",
                overflow: "hidden",
              }}
            >
              {profile?.avatar_url ? (
                <Image
                  source={profile.avatar_url}
                  style={{ width: 38, height: 38 }}
                  contentFit="cover"
                  transition={200}
                />
              ) : (
                <Ionicons name="person" size={18} color="#c09460" />
              )}
            </TouchableOpacity>
            <Text style={{ color: colors.textPrimary, fontSize: 20, fontWeight: "800", letterSpacing: 0.5 }}>
              <Text style={{ color: colors.textSecondary, fontWeight: "600" }}>Hi, </Text>{profile?.name?.split(" ")[0] || "Hey"}
            </Text>
          </View>

          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <TouchableOpacity
              onPress={() => navigation.navigate("DailyTaskSheet")}
              activeOpacity={0.7}
              style={{
                width: 38,
                height: 38,
                borderRadius: 12,
                backgroundColor: "#4078e012",
                justifyContent: "center",
                alignItems: "center",
                borderWidth: 1,
                borderColor: "#4078e025",
              }}
            >
              <Ionicons name="today" size={18} color="#4078e0" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {}}
              activeOpacity={0.7}
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
              <Ionicons name="notifications-outline" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Top Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 2 }}
          style={{ marginBottom: 2 }}
        >
          {visibleTabs.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                onPress={() => setActiveTab(tab.key)}
                activeOpacity={0.7}
                style={{
                  marginRight: 8,
                  paddingHorizontal: 16,
                  paddingVertical: 9,
                  borderRadius: 24,
                  backgroundColor: isActive ? `${tab.color}18` : colors.glassChip,
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 6,
                  borderWidth: 1,
                  borderColor: isActive ? `${tab.color}30` : colors.glassChipBorder,
                }}
              >
                <Ionicons
                  name={isActive ? tab.iconActive : tab.icon}
                  size={14}
                  color={isActive ? tab.color : colors.textTertiary}
                />
                <Text
                  style={{
                    color: isActive ? tab.color : colors.tabInactiveText,
                    fontSize: 13,
                    fontWeight: isActive ? "700" : "500",
                  }}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Divider */}
        <View style={{ height: 1, backgroundColor: colors.glassBorderLight, marginTop: 10 }} />
      </View>

      {/* Content */}
      <View style={{ flex: 1 }}>
        {activeTab === "dashboard" && <DashboardScreen navigation={navigation} onSwitchTab={setActiveTab} />}
        {activeTab === "habits" && <HabitsScreen navigation={navigation} />}
        {activeTab === "finance" && <FinanceScreen />}
        {activeTab === "goals" && <GoalsScreen navigation={navigation} />}
        {activeTab === "workout" && <ExercisesScreen />}
        {activeTab === "debts" && <DebtsScreen navigation={navigation} />}
      </View>

      {/* Hamburger Menu - Left Drawer */}
      <Modal
        visible={menuVisible}
        transparent
        animationType="none"
        statusBarTranslucent
        onRequestClose={() => closeMenu()}
      >
        <View style={{ flex: 1, flexDirection: "row" }}>
          {/* Drawer Panel */}
          <Animated.View
            style={{
              width: DRAWER_WIDTH,
              overflow: "hidden",
              transform: [{
                translateX: menuAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-DRAWER_WIDTH, 0],
                }),
              }],
            }}
          >
            <BlurView
              intensity={colors.blurIntensity + 20}
              tint={colors.blurTint}
              style={{
                flex: 1,
                paddingTop: Platform.OS === "ios" ? 60 : (StatusBar.currentHeight || 24) + 16,
                paddingBottom: Platform.OS === "ios" ? 40 : 24,
              }}
            >
              <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: colors.glassDrawer }} />

            <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
              {/* Profile Section */}
              <View style={{ paddingHorizontal: 20, paddingBottom: 20, flexDirection: "row", alignItems: "center" }}>
                <View style={{
                  width: 48, height: 48, borderRadius: 24,
                  backgroundColor: "#84643820",
                  justifyContent: "center", alignItems: "center",
                  borderWidth: 1, borderColor: "#84643830", overflow: "hidden",
                }}>
                  {profile?.avatar_url ? (
                    <Image source={profile.avatar_url} style={{ width: 48, height: 48 }} contentFit="cover" transition={200} />
                  ) : (
                    <Ionicons name="person" size={22} color="#c09460" />
                  )}
                </View>
                <View style={{ marginLeft: 12, flex: 1 }}>
                  <Text style={{ color: colors.textPrimary, fontSize: 17, fontWeight: "700" }}>
                    {profile?.name || "User"}
                  </Text>
                  <Text style={{ color: colors.textTertiary, fontSize: 12, marginTop: 2 }}>
                    {profile?.email || ""}
                  </Text>
                </View>
              </View>

              {/* Divider */}
              <View style={{ height: 1, backgroundColor: colors.borderDivider, marginHorizontal: 20, marginBottom: 8 }} />

              {/* Dark Mode Toggle */}
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={toggleTheme}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingHorizontal: 20,
                  paddingVertical: 13,
                }}
              >
                <View style={{
                  width: 38, height: 38, borderRadius: 10,
                  backgroundColor: "#c0946018",
                  justifyContent: "center", alignItems: "center",
                }}>
                  <Ionicons name={isDark ? "moon" : "sunny"} size={18} color="#c09460" />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={{ color: colors.textPrimary, fontSize: 14, fontWeight: "600" }}>Dark Mode</Text>
                  <Text style={{ color: colors.textTertiary, fontSize: 11, marginTop: 1 }}>Toggle appearance</Text>
                </View>
                <Switch
                  value={isDark}
                  onValueChange={toggleTheme}
                  trackColor={{ false: colors.switchTrackOff, true: "#c09460" }}
                  thumbColor="#ffffff"
                />
              </TouchableOpacity>

              {/* Settings */}
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => closeMenu(() => navigation.navigate("Settings"))}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingHorizontal: 20,
                  paddingVertical: 13,
                }}
              >
                <View style={{
                  width: 38, height: 38, borderRadius: 10,
                  backgroundColor: "#2bb88318",
                  justifyContent: "center", alignItems: "center",
                }}>
                  <Ionicons name="settings-outline" size={18} color="#2bb883" />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={{ color: colors.textPrimary, fontSize: 14, fontWeight: "600" }}>Settings</Text>
                  <Text style={{ color: colors.textTertiary, fontSize: 11, marginTop: 1 }}>Notifications & preferences</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={colors.textTertiary} />
              </TouchableOpacity>

              {/* Reminders */}
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setReminderExpanded(!reminderExpanded)}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingHorizontal: 20,
                  paddingVertical: 13,
                }}
              >
                <View style={{
                  width: 38, height: 38, borderRadius: 10,
                  backgroundColor: "#4078e018",
                  justifyContent: "center", alignItems: "center",
                }}>
                  <Ionicons name="notifications-outline" size={18} color="#4078e0" />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={{ color: colors.textPrimary, fontSize: 14, fontWeight: "600" }}>Daily Reminder</Text>
                  <Text style={{ color: colors.textTertiary, fontSize: 11, marginTop: 1 }}>
                    {notificationsEnabled ? `Active at ${formatTime12(reminderTime)}` : "Disabled"}
                  </Text>
                </View>
                <Switch
                  value={notificationsEnabled}
                  onValueChange={(val) => {
                    setNotificationsEnabled(val);
                    updateNotificationSettings(user.id, val, reminderTime);
                  }}
                  trackColor={{ false: colors.switchTrackOff, true: "#4078e050" }}
                  thumbColor={notificationsEnabled ? "#4078e0" : "#6b7280"}
                />
              </TouchableOpacity>

              {/* Reminder time picker (expanded) */}
              {notificationsEnabled && reminderExpanded && (
                <View style={{ paddingHorizontal: 20, paddingBottom: 10, paddingLeft: 70 }}>
                  <Text style={{ color: colors.textSecondary, fontSize: 12, marginBottom: 10 }}>Reminder Time</Text>
                  <TouchableOpacity
                    onPress={() => setShowTimePicker(true)}
                    activeOpacity={0.7}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      backgroundColor: colors.glassChip,
                      borderRadius: 12,
                      borderWidth: 1,
                      borderColor: colors.glassChipBorder,
                      paddingHorizontal: 14,
                      paddingVertical: 10,
                      gap: 8,
                      alignSelf: "flex-start",
                    }}
                  >
                    <Ionicons name="time-outline" size={18} color="#4078e0" />
                    <Text style={{ color: colors.textPrimary, fontSize: 18, fontWeight: "800", letterSpacing: 1 }}>
                      {formatTime12(reminderTime)}
                    </Text>
                    <Ionicons name="chevron-down" size={14} color={colors.textTertiary} />
                  </TouchableOpacity>

                  {showTimePicker && (
                    <View style={{ marginTop: 10 }}>
                      <DateTimePicker
                        value={pickerDate}
                        mode="time"
                        display={Platform.OS === "ios" ? "spinner" : "spinner"}
                        is24Hour={false}
                        themeVariant={isDark ? "dark" : "light"}
                        onChange={(event, selectedDate) => {
                          if (Platform.OS === "android") setShowTimePicker(false);
                          if (event.type === "dismissed") return;
                          if (selectedDate) {
                            const h = selectedDate.getHours();
                            const m = selectedDate.getMinutes();
                            const timeStr = String(h).padStart(2, "0") + ":" + String(m).padStart(2, "0");
                            setReminderTime(timeStr);
                            if (Platform.OS === "android") {
                              updateNotificationSettings(user.id, true, timeStr);
                            }
                          }
                        }}
                      />
                      {Platform.OS === "ios" && (
                        <View style={{ flexDirection: "row", justifyContent: "flex-end", gap: 8, marginTop: 6 }}>
                          <TouchableOpacity
                            onPress={() => setShowTimePicker(false)}
                            style={{
                              paddingHorizontal: 14,
                              paddingVertical: 8,
                              borderRadius: 10,
                              backgroundColor: colors.glassChip,
                              borderWidth: 1,
                              borderColor: colors.glassChipBorder,
                            }}
                          >
                            <Text style={{ color: colors.textSecondary, fontWeight: "600", fontSize: 12 }}>Cancel</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={() => {
                              setShowTimePicker(false);
                              updateNotificationSettings(user.id, true, reminderTime);
                              showToast(`Reminder set for ${formatTime12(reminderTime)}`, "success");
                            }}
                            style={{
                              paddingHorizontal: 14,
                              paddingVertical: 8,
                              borderRadius: 10,
                              backgroundColor: "#4078e0",
                            }}
                          >
                            <Text style={{ color: "#ffffff", fontWeight: "700", fontSize: 12 }}>Save</Text>
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>
                  )}
                </View>
              )}

              {/* Statistics */}
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => closeMenu(() => navigation.navigate("WeeklyReport"))}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingHorizontal: 20,
                  paddingVertical: 13,
                }}
              >
                <View style={{
                  width: 38, height: 38, borderRadius: 10,
                  backgroundColor: "#e0661218",
                  justifyContent: "center", alignItems: "center",
                }}>
                  <Ionicons name="bar-chart-outline" size={18} color="#e06612" />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={{ color: colors.textPrimary, fontSize: 14, fontWeight: "600" }}>Statistics</Text>
                  <Text style={{ color: colors.textTertiary, fontSize: 11, marginTop: 1 }}>Overall lifetime stats</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={colors.textTertiary} />
              </TouchableOpacity>

              {/* Divider */}
              <View style={{ height: 1, backgroundColor: colors.borderDivider, marginHorizontal: 20, marginVertical: 8 }} />

              {/* Share App */}
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={handleShare}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingHorizontal: 20,
                  paddingVertical: 13,
                }}
              >
                <View style={{
                  width: 38, height: 38, borderRadius: 10,
                  backgroundColor: "#30a5d818",
                  justifyContent: "center", alignItems: "center",
                }}>
                  <Ionicons name="share-social-outline" size={18} color="#30a5d8" />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={{ color: colors.textPrimary, fontSize: 14, fontWeight: "600" }}>Share App</Text>
                  <Text style={{ color: colors.textTertiary, fontSize: 11, marginTop: 1 }}>Tell your friends</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={colors.textTertiary} />
              </TouchableOpacity>

              {/* Rate Us */}
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={handleRateUs}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingHorizontal: 20,
                  paddingVertical: 13,
                }}
              >
                <View style={{
                  width: 38, height: 38, borderRadius: 10,
                  backgroundColor: "#e0a82018",
                  justifyContent: "center", alignItems: "center",
                }}>
                  <Ionicons name="star-outline" size={18} color="#e0a820" />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={{ color: colors.textPrimary, fontSize: 14, fontWeight: "600" }}>Rate Us</Text>
                  <Text style={{ color: colors.textTertiary, fontSize: 11, marginTop: 1 }}>Rate on store</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={colors.textTertiary} />
              </TouchableOpacity>

              {/* Help / FAQ */}
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => closeMenu(() => showToast("Help section coming soon!", "info"))}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingHorizontal: 20,
                  paddingVertical: 13,
                }}
              >
                <View style={{
                  width: 38, height: 38, borderRadius: 10,
                  backgroundColor: "#1eac5018",
                  justifyContent: "center", alignItems: "center",
                }}>
                  <Ionicons name="help-circle-outline" size={18} color="#1eac50" />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={{ color: colors.textPrimary, fontSize: 14, fontWeight: "600" }}>Help / FAQ</Text>
                  <Text style={{ color: colors.textTertiary, fontSize: 11, marginTop: 1 }}>Guide for new users</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={colors.textTertiary} />
              </TouchableOpacity>

              {/* About */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingHorizontal: 20,
                  paddingVertical: 13,
                }}
              >
                <View style={{
                  width: 38, height: 38, borderRadius: 10,
                  backgroundColor: "#9698b818",
                  justifyContent: "center", alignItems: "center",
                }}>
                  <Ionicons name="information-circle-outline" size={18} color="#9698b8" />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={{ color: colors.textPrimary, fontSize: 14, fontWeight: "600" }}>About</Text>
                  <Text style={{ color: colors.textTertiary, fontSize: 11, marginTop: 1 }}>v1.0.0</Text>
                </View>
              </View>

              {/* Divider */}
              <View style={{ height: 1, backgroundColor: colors.borderDivider, marginHorizontal: 20, marginVertical: 8 }} />

              {/* Logout */}
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={handleLogout}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingHorizontal: 20,
                  paddingVertical: 13,
                }}
              >
                <View style={{
                  width: 38, height: 38, borderRadius: 10,
                  backgroundColor: "#e0555518",
                  justifyContent: "center", alignItems: "center",
                }}>
                  <Ionicons name="log-out-outline" size={18} color="#e05555" />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={{ color: "#e05555", fontSize: 14, fontWeight: "600" }}>Logout</Text>
                  <Text style={{ color: colors.textTertiary, fontSize: 11, marginTop: 1 }}>Sign out</Text>
                </View>
              </TouchableOpacity>
            </ScrollView>
            </BlurView>
          </Animated.View>

          {/* Overlay (right side, tap to close) */}
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => closeMenu()}
            style={{ flex: 1 }}
          >
            <Animated.View
              style={{
                flex: 1,
                backgroundColor: colors.modalOverlay,
                opacity: menuAnim,
              }}
            />
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};

export default HomeScreen;
