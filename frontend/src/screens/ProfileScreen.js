import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Image,
  ActivityIndicator,
  Platform,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useGlobal } from "../context/GlobalContext";
import { updateProfile as updateProfileAPI } from "../services/api";
import { formatINR, getPercentage } from "../utils/helpers";
import AchievementBadges from "../components/AchievementBadges";

const ProfileScreen = ({ navigation }) => {
  const {
    user,
    onLogout,
    profile,
    habits,
    debts,
    debtSummary,
    loadProfile,
    loadHabits,
    loadDebts,
    loadInterviews,
    interviews,
    saveManifestation,
    uploadAvatar,
  } = useGlobal();

  const [refreshing, setRefreshing] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [name, setName] = useState("");
  const [editingMantra, setEditingMantra] = useState(false);
  const [mantra, setMantra] = useState("");
  const [avatarLoading, setAvatarLoading] = useState(false);

  useEffect(() => {
    loadAll();
  }, []);

  useEffect(() => {
    if (profile) {
      setName(profile.name || "");
      setMantra(profile.manifestation || "");
    }
  }, [profile]);

  const loadAll = async () => {
    await Promise.all([
      loadProfile(user.id),
      loadHabits(user.id),
      loadDebts(user.id),
      loadInterviews(user.id),
    ]);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAll();
    setRefreshing(false);
  };

  const handleSaveName = async () => {
    if (!name.trim()) {
      Alert.alert("Error", "Name cannot be empty");
      return;
    }
    try {
      await updateProfileAPI(user.id, { name: name.trim() });
      await loadProfile(user.id);
      setEditingName(false);
    } catch (err) {
      Alert.alert("Error", "Failed to update name");
    }
  };

  const handleSaveMantra = async () => {
    await saveManifestation(user.id, mantra.trim());
    setEditingMantra(false);
  };

  const handlePickAvatar = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission needed", "Please allow access to your photo library.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
      base64: true,
    });

    if (!result.canceled && result.assets[0].base64) {
      setAvatarLoading(true);
      await uploadAvatar(user.id, result.assets[0].base64);
      setAvatarLoading(false);
    }
  };

  // Stats
  const totalCompletions = habits.reduce((sum, h) => sum + h.total_completions, 0);
  const bestStreak = habits.length > 0 ? Math.max(...habits.map((h) => h.longest_streak)) : 0;
  const overallDebtPercent = getPercentage(debtSummary.total_paid, debtSummary.total_debt);

  return (
    <View style={{ flex: 1, backgroundColor: "#0a0a0f" }}>
      {/* Header - same style as WeeklyReport */}
      <View
        style={{
          paddingTop: Platform.OS === "ios" ? 54 : (StatusBar.currentHeight || 24) + 10,
          backgroundColor: "#0a0a0f",
          paddingHorizontal: 20,
          paddingBottom: 14,
          borderBottomWidth: 1,
          borderBottomColor: "#ffffff06",
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
              <Ionicons name="arrow-back" size={22} color="#ffffff" />
            </TouchableOpacity>
            {profile?.avatar_url ? (
              <Image
                source={{ uri: profile.avatar_url }}
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 19,
                  marginRight: 10,
                  borderWidth: 1,
                  borderColor: "#7c3aed30",
                }}
              />
            ) : (
              <View
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 19,
                  backgroundColor: "#7c3aed20",
                  justifyContent: "center",
                  alignItems: "center",
                  marginRight: 10,
                  borderWidth: 1,
                  borderColor: "#7c3aed30",
                }}
              >
                <Ionicons name="person" size={18} color="#a78bfa" />
              </View>
            )}
            <Text style={{ color: "#ffffff", fontSize: 20, fontWeight: "800", letterSpacing: 0.5 }}>
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
              backgroundColor: "#ffffff08",
              justifyContent: "center",
              alignItems: "center",
              borderWidth: 1,
              borderColor: "#ffffff06",
            }}
          >
            <Ionicons name="notifications-outline" size={20} color="#9ca3af" />
          </TouchableOpacity>
        </View>
      </View>

    <ScrollView
      style={{ flex: 1, backgroundColor: "#0a0a0f" }}
      contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#4f8cff" />}
    >
      {/* Profile Card */}
      <View
        style={{
          backgroundColor: "#1a1a2e",
          borderRadius: 24,
          padding: 28,
          marginBottom: 24,
          alignItems: "center",
          borderWidth: 1,
          borderColor: "#4f8cff15",
        }}
      >
        <TouchableOpacity onPress={handlePickAvatar} activeOpacity={0.7}>
          <View
            style={{
              width: 84,
              height: 84,
              borderRadius: 28,
              backgroundColor: "#4f8cff12",
              justifyContent: "center",
              alignItems: "center",
              marginBottom: 18,
              borderWidth: 2,
              borderColor: "#4f8cff25",
              overflow: "hidden",
            }}
          >
            {avatarLoading ? (
              <ActivityIndicator size="large" color="#4f8cff" />
            ) : profile?.avatar_url ? (
              <Image
                source={{ uri: profile.avatar_url }}
                style={{ width: 84, height: 84 }}
              />
            ) : (
              <Ionicons name="person" size={38} color="#4f8cff" />
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
              backgroundColor: "#4f8cff",
              justifyContent: "center",
              alignItems: "center",
              borderWidth: 2,
              borderColor: "#1a1a2e",
            }}
          >
            <Ionicons name="camera" size={14} color="#ffffff" />
          </View>
        </TouchableOpacity>

        {editingName ? (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <TextInput
              value={name}
              onChangeText={setName}
              style={{
                backgroundColor: "#12121a",
                color: "#ffffff",
                borderRadius: 12,
                padding: 12,
                fontSize: 18,
                fontWeight: "700",
                textAlign: "center",
                minWidth: 150,
                borderWidth: 1,
                borderColor: "#ffffff10",
              }}
              autoFocus
            />
            <TouchableOpacity onPress={handleSaveName} style={{ backgroundColor: "#4f8cff", borderRadius: 10, padding: 10 }}>
              <Text style={{ color: "#ffffff", fontWeight: "700" }}>{"\u2713"}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => { setName(profile?.name || ""); setEditingName(false); }} style={{ backgroundColor: "#f87171", borderRadius: 10, padding: 10 }}>
              <Text style={{ color: "#ffffff", fontWeight: "700" }}>{"\u2717"}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity onPress={() => setEditingName(true)}>
            <Text style={{ color: "#ffffff", fontSize: 24, fontWeight: "800" }}>{profile?.name || "Amit"}</Text>
            <Text style={{ color: "#6b7280", fontSize: 11, textAlign: "center", marginTop: 4 }}>Tap to edit name</Text>
          </TouchableOpacity>
        )}

        <Text style={{ color: "#9ca3af", fontSize: 13, marginTop: 8 }}>{profile?.email}</Text>
      </View>

      {/* Manifestation */}
      <View
        style={{
          backgroundColor: "#1a1a2e",
          borderRadius: 18,
          padding: 22,
          marginBottom: 24,
          borderWidth: 1,
          borderColor: "#a78bfa20",
        }}
      >
        <Text style={{ color: "#a78bfa", fontSize: 14, fontWeight: "600", marginBottom: 12 }}>
          {"\u2728"} Daily Manifestation
        </Text>

        {editingMantra ? (
          <View>
            <TextInput
              value={mantra}
              onChangeText={setMantra}
              multiline
              style={{
                color: "#ffffff",
                fontSize: 15,
                backgroundColor: "#12121a",
                borderRadius: 12,
                padding: 14,
                minHeight: 80,
                textAlignVertical: "top",
                borderWidth: 1,
                borderColor: "#ffffff08",
              }}
              placeholderTextColor="#6b7280"
              placeholder="Write your daily affirmation..."
            />
            <View style={{ flexDirection: "row", justifyContent: "flex-end", marginTop: 12, gap: 10 }}>
              <TouchableOpacity
                onPress={() => { setMantra(profile?.manifestation || ""); setEditingMantra(false); }}
                style={{ paddingHorizontal: 18, paddingVertical: 10, borderRadius: 10, backgroundColor: "#1a1a2e", borderWidth: 1, borderColor: "#ffffff08" }}
              >
                <Text style={{ color: "#9ca3af" }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSaveMantra}
                style={{ paddingHorizontal: 18, paddingVertical: 10, borderRadius: 10, backgroundColor: "#a78bfa" }}
              >
                <Text style={{ color: "#0a0a0f", fontWeight: "600" }}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <TouchableOpacity onPress={() => setEditingMantra(true)}>
            <Text style={{ color: "#e5e7eb", fontSize: 15, fontStyle: "italic", lineHeight: 22 }}>
              "{profile?.manifestation || 'Tap to set your daily affirmation...'}"
            </Text>
            <Text style={{ color: "#6b7280", fontSize: 11, marginTop: 8 }}>Tap to edit</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Lifetime Stats */}
      <Text style={{ color: "#ffffff", fontSize: 18, fontWeight: "700", marginBottom: 14, letterSpacing: 0.3 }}>
        {"\u{1F4CA}"} Lifetime Stats
      </Text>

      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12, marginBottom: 28 }}>
        {[
          { label: "Total Habits", value: habits.length, color: "#4f8cff", icon: "\u{1F4CB}" },
          { label: "Total Check-ins", value: totalCompletions, color: "#4f8cff", icon: "\u2705" },
          { label: "Best Streak", value: bestStreak, color: "#fbbf24", icon: "\u{1F525}" },
          { label: "Debt Cleared", value: `${overallDebtPercent}%`, color: "#fbbf24", icon: "\u{1F4B0}" },
          { label: "Active Debts", value: debts.filter((d) => !d.is_cleared).length, color: "#f87171", icon: "\u{1F4B8}" },
          { label: "Debts Paid Off", value: debts.filter((d) => d.is_cleared).length, color: "#34d399", icon: "\u{1F389}" },
        ].map((stat) => (
          <View
            key={stat.label}
            style={{
              backgroundColor: "#12121a",
              borderRadius: 16,
              padding: 18,
              width: "47%",
              alignItems: "center",
              borderWidth: 1,
              borderColor: "#ffffff06",
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
            <Text style={{ color: "#6b7280", fontSize: 11, marginTop: 4 }}>{stat.label}</Text>
          </View>
        ))}
      </View>

      {/* Achievement Badges */}
      <View style={{ marginBottom: 28 }}>
        <AchievementBadges habits={habits} debts={debts} interviews={interviews} />
      </View>

      {/* Logout */}
      <TouchableOpacity
        onPress={() =>
          Alert.alert("Logout", "Are you sure you want to logout?", [
            { text: "Cancel", style: "cancel" },
            { text: "Logout", style: "destructive", onPress: onLogout },
          ])
        }
        style={{
          backgroundColor: "#f8717115",
          borderRadius: 16,
          padding: 18,
          alignItems: "center",
          marginBottom: 16,
          borderWidth: 1,
          borderColor: "#f8717125",
        }}
      >
        <Text style={{ color: "#f87171", fontSize: 16, fontWeight: "700" }}>
          {"\u{1F6AA}"} Logout
        </Text>
      </TouchableOpacity>

      {/* App info */}
      <View style={{ alignItems: "center", paddingVertical: 24 }}>
        <Text style={{ color: "#6b7280", fontSize: 12 }}>HustleKit</Text>
        <Text style={{ color: "#4b5563", fontSize: 11, marginTop: 4 }}>v1.0.0</Text>
      </View>
    </ScrollView>
    </View>
  );
};

export default ProfileScreen;
