import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Animated,
  RefreshControl,
  ActivityIndicator,
  Platform,
  StatusBar,
  Switch,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { useAuth } from "../context/domains/AuthContext";
import { useProfile } from "../context/domains/ProfileContext";
import { useHabits } from "../context/domains/HabitsContext";
import { useDebts } from "../context/domains/DebtsContext";
import { useTabVisibility } from "../context/domains/TabVisibilityContext";
import { useTheme } from "../context/ThemeContext";
import { useToast } from "../context/ToastContext";
import useShake from "../hooks/useShake";
import { updateProfile as updateProfileAPI } from "../services/api";
import { formatINR, getPercentage } from "../utils/helpers";
import AchievementBadges from "../components/AchievementBadges";

const ProfileScreen = ({ navigation }) => {
  const { user, onLogout } = useAuth();
  const { profile, loadProfile, saveManifestation, uploadAvatar, updateNotificationSettings } = useProfile();
  const { habits, loadHabits } = useHabits();
  const { debts, debtSummary, loadDebts } = useDebts();
  const { tabVisibility, toggleTabVisibility } = useTabVisibility();

  const { colors, isDark, toggleTheme } = useTheme();
  const { showToast } = useToast();
  const [nameError, setNameError] = useState("");
  const { shakeAnim: nameShake, triggerShake: shakeNameField } = useShake();

  const [refreshing, setRefreshing] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [name, setName] = useState("");
  const [editingMantra, setEditingMantra] = useState(false);
  const [mantra, setMantra] = useState("");
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [reminderTime, setReminderTime] = useState("08:00");

  useEffect(() => {
    loadAll();
  }, []);

  useEffect(() => {
    if (profile) {
      setName(profile.name || "");
      setMantra(profile.manifestation || "");
      setNotificationsEnabled(profile.notifications_enabled ?? true);
      setReminderTime(profile.reminder_time || "08:00");
    }
  }, [profile]);

  const loadAll = async () => {
    await Promise.all([
      loadProfile(user.id),
      loadHabits(user.id),
      loadDebts(user.id),
    ]);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAll();
    setRefreshing(false);
  };

  const handleSaveName = async () => {
    setNameError("");
    if (!name.trim()) {
      setNameError("Name cannot be empty");
      shakeNameField();
      return;
    }
    try {
      await updateProfileAPI(user.id, { name: name.trim() });
      await loadProfile(user.id);
      setEditingName(false);
    } catch (err) {
      showToast("Failed to update name", "error");
    }
  };

  const handleSaveMantra = async () => {
    await saveManifestation(user.id, mantra.trim());
    setEditingMantra(false);
  };

  const handlePickAvatar = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      showToast("Please allow access to your photo library", "warning");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
      base64: true,
    });

    if (!result.canceled && result.assets[0].base64) {
      // Check base64 size (~75% of actual file size)
      const sizeInBytes = result.assets[0].base64.length * 0.75;
      const sizeInMB = sizeInBytes / (1024 * 1024);
      if (sizeInMB > 5) {
        showToast(`Image is ${sizeInMB.toFixed(1)} MB. Max 5 MB allowed.`, "warning");
        return;
      }
      setAvatarLoading(true);
      try {
        await uploadAvatar(user.id, result.assets[0].base64);
      } catch (err) {
        // Error already shown via GlobalContext alert
      } finally {
        setAvatarLoading(false);
      }
    }
  };

  // Stats
  const totalCompletions = habits.reduce((sum, h) => sum + h.total_completions, 0);
  const bestStreak = habits.length > 0 ? Math.max(...habits.map((h) => h.longest_streak)) : 0;
  const overallDebtPercent = getPercentage(debtSummary.total_paid, debtSummary.total_debt);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header - same style as WeeklyReport */}
      <View
        style={{
          paddingTop: Platform.OS === "ios" ? 54 : (StatusBar.currentHeight || 24) + 10,
          backgroundColor: colors.background,
          paddingHorizontal: 20,
          paddingBottom: 14,
          borderBottomWidth: 1,
          borderBottomColor: colors.glassBorderLight,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: 12 }}>
              <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
            </TouchableOpacity>
            {profile?.avatar_url ? (
              <Image
                source={profile.avatar_url}
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 19,
                  marginRight: 10,
                  borderWidth: 1,
                  borderColor: "#84643830",
                }}
                contentFit="cover"
                transition={200}
              />
            ) : (
              <View
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
                }}
              >
                <Ionicons name="person" size={18} color="#c09460" />
              </View>
            )}
            <Text style={{ color: colors.textPrimary, fontSize: 20, fontWeight: "800", letterSpacing: 0.5 }}>
              Profile
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => {}}
            activeOpacity={0.7}
            style={{
              width: 38,
              height: 38,
              borderRadius: 12,
              backgroundColor: colors.glassBorder,
              justifyContent: "center",
              alignItems: "center",
              borderWidth: 1,
              borderColor: colors.glassBorderLight,
            }}
          >
            <Ionicons name="notifications-outline" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#4078e0" />}
    >
      {/* Profile Card */}
      <View
        style={{
          backgroundColor: colors.glassCard,
          borderRadius: 24,
          padding: 28,
          marginBottom: 24,
          alignItems: "center",
          borderWidth: 1,
          borderColor: "#4078e015",
        }}
      >
        <TouchableOpacity onPress={handlePickAvatar} activeOpacity={0.7}>
          <View
            style={{
              width: 84,
              height: 84,
              borderRadius: 28,
              backgroundColor: "#4078e012",
              justifyContent: "center",
              alignItems: "center",
              marginBottom: 18,
              borderWidth: 2,
              borderColor: "#4078e025",
              overflow: "hidden",
            }}
          >
            {avatarLoading ? (
              <ActivityIndicator size="large" color="#4078e0" />
            ) : profile?.avatar_url ? (
              <Image
                source={profile.avatar_url}
                style={{ width: 84, height: 84 }}
                contentFit="cover"
                transition={200}
              />
            ) : (
              <Ionicons name="person" size={38} color="#4078e0" />
            )}
          </View>
          <View
            style={{
              position: "absolute",
              bottom: 16,
              right: -4,
              width: 28,
              height: 28,
              borderRadius: 14,
              backgroundColor: "#4078e0",
              justifyContent: "center",
              alignItems: "center",
              borderWidth: 2,
              borderColor: colors.glassCard,
            }}
          >
            <Ionicons name="camera" size={14} color="#ffffff" />
          </View>
        </TouchableOpacity>
        <Text style={{ color: colors.textDim, fontSize: 10, marginTop: 2 }}>Max 5 MB</Text>

        {editingName ? (
          <View>
            <Animated.View style={{ flexDirection: "row", alignItems: "center", gap: 10, transform: [{ translateX: nameShake }] }}>
              <TextInput
                value={name}
                onChangeText={(t) => { setName(t); setNameError(""); }}
                style={{
                  backgroundColor: colors.glassCardAlt,
                  color: colors.textPrimary,
                  borderRadius: 12,
                  padding: 12,
                  fontSize: 18,
                  fontWeight: "700",
                  textAlign: "center",
                  minWidth: 150,
                  borderWidth: 1,
                  borderColor: nameError ? colors.accentRed : colors.glassBorderStrong,
                }}
                autoFocus
              />
              <TouchableOpacity onPress={handleSaveName} style={{ backgroundColor: "#4078e0", borderRadius: 10, padding: 10 }}>
                <Text style={{ color: "#ffffff", fontWeight: "700" }}>{"\u2713"}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => { setName(profile?.name || ""); setEditingName(false); setNameError(""); }} style={{ backgroundColor: "#e05555", borderRadius: 10, padding: 10 }}>
                <Text style={{ color: "#ffffff", fontWeight: "700" }}>{"\u2717"}</Text>
              </TouchableOpacity>
            </Animated.View>
            {nameError ? <Text style={{ color: colors.accentRed, fontSize: 12, marginTop: 4, textAlign: "center" }}>{nameError}</Text> : null}
          </View>
        ) : (
          <TouchableOpacity onPress={() => setEditingName(true)}>
            <Text style={{ color: colors.textPrimary, fontSize: 24, fontWeight: "800" }}>{profile?.name || "Amit"}</Text>
            <Text style={{ color: colors.textTertiary, fontSize: 11, textAlign: "center", marginTop: 4 }}>Tap to edit name</Text>
          </TouchableOpacity>
        )}

        <Text style={{ color: colors.textSecondary, fontSize: 13, marginTop: 8 }}>{profile?.email}</Text>
      </View>

      {/* Manifestation */}
      <View
        style={{
          backgroundColor: colors.glassCard,
          borderRadius: 18,
          padding: 22,
          marginBottom: 24,
          borderWidth: 1,
          borderColor: "#c0946020",
        }}
      >
        <Text style={{ color: "#c09460", fontSize: 14, fontWeight: "600", marginBottom: 12 }}>
          {"\u2728"} Daily Manifestation
        </Text>

        {editingMantra ? (
          <View>
            <TextInput
              value={mantra}
              onChangeText={setMantra}
              multiline
              style={{
                color: colors.textPrimary,
                fontSize: 15,
                backgroundColor: colors.glassCardAlt,
                borderRadius: 12,
                padding: 14,
                minHeight: 80,
                textAlignVertical: "top",
                borderWidth: 1,
                borderColor: colors.glassBorder,
              }}
              placeholderTextColor={colors.textTertiary}
              placeholder="Write your daily affirmation..."
            />
            <View style={{ flexDirection: "row", justifyContent: "flex-end", marginTop: 12, gap: 10 }}>
              <TouchableOpacity
                onPress={() => { setMantra(profile?.manifestation || ""); setEditingMantra(false); }}
                style={{ paddingHorizontal: 18, paddingVertical: 10, borderRadius: 10, backgroundColor: colors.glassCard, borderWidth: 1, borderColor: colors.glassBorder }}
              >
                <Text style={{ color: colors.textSecondary }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSaveMantra}
                style={{ paddingHorizontal: 18, paddingVertical: 10, borderRadius: 10, backgroundColor: "#c09460" }}
              >
                <Text style={{ color: "#0a0a0f", fontWeight: "600" }}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <TouchableOpacity onPress={() => setEditingMantra(true)}>
            <Text style={{ color: colors.textSubtitle, fontSize: 15, fontStyle: "italic", lineHeight: 22 }}>
              "{profile?.manifestation || 'Tap to set your daily affirmation...'}"
            </Text>
            <Text style={{ color: colors.textTertiary, fontSize: 11, marginTop: 8 }}>Tap to edit</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Lifetime Stats */}
      <Text style={{ color: colors.textPrimary, fontSize: 18, fontWeight: "700", marginBottom: 14, letterSpacing: 0.3 }}>
        {"\u{1F4CA}"} Lifetime Stats
      </Text>

      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12, marginBottom: 28 }}>
        {[
          { label: "Level", value: profile?.level || 1, color: "#e0a820", icon: "\u{1F31F}" },
          { label: "Total XP", value: profile?.xp || 0, color: "#e0a820", icon: "\u26A1" },
          { label: "Total Habits", value: habits.length, color: "#4078e0", icon: "\u{1F4CB}" },
          { label: "Total Check-ins", value: totalCompletions, color: "#4078e0", icon: "\u2705" },
          { label: "Best Streak", value: bestStreak, color: "#e0a820", icon: "\u{1F525}" },
          { label: "App Streak", value: profile?.app_streak || 0, color: "#e05555", icon: "\u{1F525}" },
          { label: "Debt Cleared", value: `${overallDebtPercent}%`, color: "#e0a820", icon: "\u{1F4B0}" },
          { label: "Debts Paid Off", value: debts.filter((d) => d.is_cleared).length, color: "#2bb883", icon: "\u{1F389}" },
        ].map((stat) => (
          <View
            key={stat.label}
            style={{
              backgroundColor: colors.glassCardAlt,
              borderRadius: 16,
              padding: 18,
              width: "47%",
              alignItems: "center",
              borderWidth: 1,
              borderColor: colors.glassBorderLight,
            }}
          >
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                backgroundColor: `${stat.color}12`,
                justifyContent: "center",
                alignItems: "center",
                marginBottom: 8,
              }}
            >
              <Text style={{ fontSize: 20 }}>{stat.icon}</Text>
            </View>
            <Text style={{ color: stat.color, fontSize: 24, fontWeight: "800" }}>{stat.value}</Text>
            <Text style={{ color: colors.textTertiary, fontSize: 11, marginTop: 4 }}>{stat.label}</Text>
          </View>
        ))}
      </View>

      {/* XP Progress Bar */}
      <View
        style={{
          backgroundColor: colors.glassCard,
          borderRadius: 18,
          padding: 22,
          marginBottom: 24,
          borderWidth: 1,
          borderColor: "#e0a82020",
        }}
      >
        <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 10 }}>
          <Text style={{ color: "#e0a820", fontSize: 14, fontWeight: "600" }}>
            Level {profile?.level || 1} Progress
          </Text>
          <Text style={{ color: "#e0a82090", fontSize: 13 }}>
            {(profile?.xp || 0) % 100}/100 XP
          </Text>
        </View>
        <View style={{ height: 8, backgroundColor: colors.glassBorder, borderRadius: 4 }}>
          <View
            style={{
              height: 8,
              width: `${(profile?.xp || 0) % 100}%`,
              backgroundColor: "#e0a820",
              borderRadius: 4,
            }}
          />
        </View>
      </View>

      {/* Achievement Badges */}
      <View style={{ marginBottom: 28 }}>
        <AchievementBadges habits={habits} debts={debts} />
      </View>


      {/* App info */}
      <View style={{ alignItems: "center", paddingVertical: 24 }}>
        <Text style={{ color: colors.textTertiary, fontSize: 12 }}>LifeStack</Text>
        <Text style={{ color: colors.textDim, fontSize: 11, marginTop: 4 }}>v1.0.0</Text>
      </View>
    </ScrollView>
    </View>
  );
};

export default ProfileScreen;
