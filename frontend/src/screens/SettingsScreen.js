import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  Animated,
  Platform,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useGlobal } from "../context/GlobalContext";
import { useTheme } from "../context/ThemeContext";
import { useToast } from "../context/ToastContext";
import useShake from "../hooks/useShake";
import {
  updateProfile as updateProfileAPI,
  changePassword as changePasswordAPI,
} from "../services/api";

const ACCENT_COLORS = [
  "#4078e0",
  "#2bb883",
  "#e05555",
  "#e0a820",
  "#e06612",
  "#a855f7",
];

const FONT_SIZES = ["small", "medium", "large"];

const TAB_OPTIONS = [
  { key: "dashboard", label: "Dashboard", icon: "grid" },
  { key: "habits", label: "Habits", icon: "flame" },
  { key: "finance", label: "Finance", icon: "cash" },
  { key: "goals", label: "Goals", icon: "trophy" },
  { key: "workout", label: "Workout", icon: "barbell" },
  { key: "debts", label: "Debts", icon: "wallet" },
];

const SettingsScreen = ({ navigation }) => {
  const {
    user,
    profile,
    loadProfile,
    tabVisibility,
    toggleTabVisibility,
  } = useGlobal();

  const {
    colors,
    isDark,
    toggleTheme,
    accentColor,
    setAccentColor,
    fontSize,
    setFontSize,
    defaultTab,
    setDefaultTab,
  } = useTheme();

  // Profile
  const [editingName, setEditingName] = useState(false);
  const [name, setName] = useState("");

  // Change Password
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);

  const { showToast } = useToast();
  const [nameError, setNameError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const { shakeAnim: nameShake, triggerShake: shakeNameField } = useShake();
  const { shakeAnim: passwordShake, triggerShake: shakePasswordField } = useShake();

  useEffect(() => {
    if (profile) {
      setName(profile.name || "");
    }
  }, [profile]);

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

  const handleChangePassword = async () => {
    setPasswordError("");
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("Please fill all password fields");
      shakePasswordField();
      return;
    }
    if (newPassword.length < 4) {
      setPasswordError("New password must be at least 4 characters");
      shakePasswordField();
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match");
      shakePasswordField();
      return;
    }
    setPasswordLoading(true);
    try {
      await changePasswordAPI(profile.email, currentPassword, newPassword);
      showToast("Password updated successfully", "success");
      setShowPasswordFields(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to change password";
      showToast(msg, "error");
    } finally {
      setPasswordLoading(false);
    }
  };

  const SectionHeader = ({ icon, title, color = "#4078e0" }) => (
    <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 14, marginTop: 8 }}>
      <View
        style={{
          width: 32,
          height: 32,
          borderRadius: 10,
          backgroundColor: `${color}15`,
          justifyContent: "center",
          alignItems: "center",
          marginRight: 10,
        }}
      >
        <Ionicons name={icon} size={16} color={color} />
      </View>
      <Text style={{ color: colors.textPrimary, fontSize: 17, fontWeight: "700", letterSpacing: 0.3 }}>
        {title}
      </Text>
    </View>
  );

  const SettingRow = ({ icon, iconColor, label, subtitle, onPress, right, borderBottom = true }) => (
    <TouchableOpacity
      activeOpacity={onPress ? 0.7 : 1}
      onPress={onPress}
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 14,
        borderBottomWidth: borderBottom ? 1 : 0,
        borderBottomColor: colors.glassBorderLight,
      }}
    >
      <View
        style={{
          width: 36,
          height: 36,
          borderRadius: 11,
          backgroundColor: `${iconColor}12`,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Ionicons name={icon} size={18} color={iconColor} />
      </View>
      <View style={{ flex: 1, marginLeft: 12 }}>
        <Text style={{ color: colors.textSubtitle, fontSize: 15, fontWeight: "600" }}>{label}</Text>
        {subtitle && (
          <Text style={{ color: colors.textTertiary, fontSize: 11, marginTop: 2 }}>{subtitle}</Text>
        )}
      </View>
      {right || (onPress && <Ionicons name="chevron-forward" size={16} color={colors.textTertiary} />)}
    </TouchableOpacity>
  );

  const Card = ({ children, style }) => (
    <View
      style={{
        backgroundColor: colors.glassCardAlt,
        borderRadius: 18,
        padding: 20,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: colors.glassBorderLight,
        ...style,
      }}
    >
      {children}
    </View>
  );

  const ComingSoonBadge = () => (
    <View
      style={{
        backgroundColor: `${colors.textTertiary}20`,
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 4,
      }}
    >
      <Text style={{ color: colors.textTertiary, fontSize: 10, fontWeight: "700" }}>SOON</Text>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
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
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: 12 }}>
            <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
          </TouchableOpacity>
          <View
            style={{
              width: 32,
              height: 32,
              borderRadius: 10,
              backgroundColor: "#2bb88318",
              justifyContent: "center",
              alignItems: "center",
              marginRight: 10,
            }}
          >
            <Ionicons name="settings" size={16} color="#2bb883" />
          </View>
          <Text style={{ color: colors.textPrimary, fontSize: 20, fontWeight: "800", letterSpacing: 0.5 }}>
            Settings
          </Text>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Profile Section ── */}
        <SectionHeader icon="person" title="Profile" color="#4078e0" />
        <Card>
          {/* Edit Name */}
          {editingName ? (
            <View style={{ paddingVertical: 8 }}>
              <Text style={{ color: colors.textSecondary, fontSize: 12, marginBottom: 8 }}>Display Name</Text>
              <Animated.View style={{ flexDirection: "row", alignItems: "center", gap: 10, transform: [{ translateX: nameShake }] }}>
                <TextInput
                  value={name}
                  onChangeText={(t) => { setName(t); setNameError(""); }}
                  style={{
                    flex: 1,
                    backgroundColor: colors.glassCard,
                    color: colors.textPrimary,
                    borderRadius: 12,
                    padding: 12,
                    fontSize: 15,
                    fontWeight: "600",
                    borderWidth: 1,
                    borderColor: nameError ? colors.accentRed : colors.glassBorderStrong,
                  }}
                  autoFocus
                />
                <TouchableOpacity
                  onPress={handleSaveName}
                  style={{ backgroundColor: "#4078e0", borderRadius: 10, padding: 10 }}
                >
                  <Ionicons name="checkmark" size={18} color="#ffffff" />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => { setName(profile?.name || ""); setEditingName(false); setNameError(""); }}
                  style={{ backgroundColor: colors.glassCard, borderRadius: 10, padding: 10, borderWidth: 1, borderColor: colors.glassBorder }}
                >
                  <Ionicons name="close" size={18} color={colors.textSecondary} />
                </TouchableOpacity>
              </Animated.View>
              {nameError ? <Text style={{ color: colors.accentRed, fontSize: 12, marginTop: 4, marginLeft: 4 }}>{nameError}</Text> : null}
            </View>
          ) : (
            <SettingRow
              icon="person-outline"
              iconColor="#4078e0"
              label="Edit Name"
              subtitle={profile?.name || "Tap to set"}
              onPress={() => setEditingName(true)}
            />
          )}

          {/* Change Password */}
          <SettingRow
            icon="lock-closed-outline"
            iconColor="#e06612"
            label="Change Password"
            subtitle={showPasswordFields ? "Fill in fields below" : "Update your password"}
            onPress={() => setShowPasswordFields(!showPasswordFields)}
            borderBottom={!showPasswordFields}
            right={
              <Ionicons
                name={showPasswordFields ? "chevron-up" : "chevron-forward"}
                size={16}
                color={colors.textTertiary}
              />
            }
          />
          {showPasswordFields && (
            <Animated.View style={{ paddingTop: 12, paddingBottom: 4, transform: [{ translateX: passwordShake }] }}>
              <TextInput
                placeholder="Current Password"
                placeholderTextColor={colors.textTertiary}
                secureTextEntry
                value={currentPassword}
                onChangeText={(t) => { setCurrentPassword(t); setPasswordError(""); }}
                style={{
                  backgroundColor: colors.glassCard,
                  color: colors.textPrimary,
                  borderRadius: 12,
                  padding: 12,
                  fontSize: 14,
                  marginBottom: 10,
                  borderWidth: 1,
                  borderColor: passwordError ? colors.accentRed : colors.glassBorderStrong,
                }}
              />
              <TextInput
                placeholder="New Password"
                placeholderTextColor={colors.textTertiary}
                secureTextEntry
                value={newPassword}
                onChangeText={(t) => { setNewPassword(t); setPasswordError(""); }}
                style={{
                  backgroundColor: colors.glassCard,
                  color: colors.textPrimary,
                  borderRadius: 12,
                  padding: 12,
                  fontSize: 14,
                  marginBottom: 10,
                  borderWidth: 1,
                  borderColor: passwordError ? colors.accentRed : colors.glassBorderStrong,
                }}
              />
              <TextInput
                placeholder="Confirm New Password"
                placeholderTextColor={colors.textTertiary}
                secureTextEntry
                value={confirmPassword}
                onChangeText={(t) => { setConfirmPassword(t); setPasswordError(""); }}
                style={{
                  backgroundColor: colors.glassCard,
                  color: colors.textPrimary,
                  borderRadius: 12,
                  padding: 12,
                  fontSize: 14,
                  marginBottom: 4,
                  borderWidth: 1,
                  borderColor: passwordError ? colors.accentRed : colors.glassBorderStrong,
                }}
              />
              {passwordError ? <Text style={{ color: colors.accentRed, fontSize: 12, marginTop: 2, marginBottom: 10, marginLeft: 4 }}>{passwordError}</Text> : <View style={{ height: 10 }} />}
              <View style={{ flexDirection: "row", gap: 10 }}>
                <TouchableOpacity
                  onPress={() => {
                    setShowPasswordFields(false);
                    setCurrentPassword("");
                    setNewPassword("");
                    setConfirmPassword("");
                  }}
                  style={{
                    flex: 1,
                    backgroundColor: colors.glassCard,
                    borderRadius: 12,
                    padding: 14,
                    alignItems: "center",
                    borderWidth: 1,
                    borderColor: colors.glassBorder,
                  }}
                >
                  <Text style={{ color: colors.textSecondary, fontWeight: "600" }}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleChangePassword}
                  disabled={passwordLoading}
                  style={{
                    flex: 1,
                    backgroundColor: "#e06612",
                    borderRadius: 12,
                    padding: 14,
                    alignItems: "center",
                    opacity: passwordLoading ? 0.6 : 1,
                  }}
                >
                  <Text style={{ color: "#ffffff", fontWeight: "700" }}>
                    {passwordLoading ? "Updating..." : "Update"}
                  </Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          )}
        </Card>

        {/* ── Appearance Section ── */}
        <SectionHeader icon="color-palette" title="Appearance" color="#c09460" />
        <Card>
          {/* Dark Mode */}
          <SettingRow
            icon={isDark ? "moon" : "sunny"}
            iconColor="#c09460"
            label="Dark Mode"
            subtitle={isDark ? "Dark theme active" : "Light theme active"}
            right={
              <Switch
                value={isDark}
                onValueChange={toggleTheme}
                trackColor={{ false: colors.switchTrackOff, true: "#c0946050" }}
                thumbColor={isDark ? "#c09460" : "#6b7280"}
              />
            }
          />

          {/* Accent Color */}
          <View style={{ paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.glassBorderLight }}>
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 16 }}>
              <View
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 11,
                  backgroundColor: `${accentColor}12`,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Ionicons name="color-fill-outline" size={18} color={accentColor} />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={{ color: colors.textSubtitle, fontSize: 15, fontWeight: "600" }}>Accent Color</Text>
                <Text style={{ color: colors.textTertiary, fontSize: 11, marginTop: 2 }}>Customize app highlight color</Text>
              </View>
            </View>
            <View style={{ flexDirection: "row", justifyContent: "center", gap: 10, marginTop: 2 }}>
              {ACCENT_COLORS.map((color) => {
                const isSelected = accentColor === color;
                return (
                  <TouchableOpacity
                    key={color}
                    onPress={() => setAccentColor(color)}
                    activeOpacity={0.7}
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 17,
                      borderWidth: isSelected ? 2.5 : 1.5,
                      borderColor: isSelected ? color : isDark ? "#2a2a2a" : "#d1d1d6",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <View
                      style={{
                        width: 22,
                        height: 22,
                        borderRadius: 11,
                        backgroundColor: color,
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      {isSelected && (
                        <Ionicons name="checkmark" size={12} color="#ffffff" />
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Font Size */}
          <View style={{ paddingVertical: 14 }}>
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 14 }}>
              <View
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 11,
                  backgroundColor: "#e0a82012",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Ionicons name="text-outline" size={18} color="#e0a820" />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={{ color: colors.textSubtitle, fontSize: 15, fontWeight: "600" }}>Font Size</Text>
                <Text style={{ color: colors.textTertiary, fontSize: 11, marginTop: 2 }}>Adjust text size</Text>
              </View>
            </View>
            <View style={{ flexDirection: "row", gap: 10, paddingLeft: 48 }}>
              {FONT_SIZES.map((size) => (
                <TouchableOpacity
                  key={size}
                  onPress={() => setFontSize(size)}
                  style={{
                    flex: 1,
                    paddingVertical: 10,
                    borderRadius: 12,
                    backgroundColor: fontSize === size ? "#4078e0" : colors.glassCard,
                    alignItems: "center",
                    borderWidth: 1,
                    borderColor: fontSize === size ? "#4078e0" : colors.glassBorderStrong,
                  }}
                >
                  <Text
                    style={{
                      color: fontSize === size ? "#ffffff" : colors.textSecondary,
                      fontSize: size === "small" ? 12 : size === "medium" ? 14 : 16,
                      fontWeight: "700",
                      textTransform: "capitalize",
                    }}
                  >
                    {size}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </Card>


        {/* ── App Preferences Section ── */}
        <SectionHeader icon="apps" title="App Preferences" color="#2bb883" />
        <Card>
          {/* Default Tab */}
          <View style={{ paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.glassBorderLight }}>
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 14 }}>
              <View
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 11,
                  backgroundColor: "#2bb88312",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Ionicons name="home-outline" size={18} color="#2bb883" />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={{ color: colors.textSubtitle, fontSize: 15, fontWeight: "600" }}>Default Tab</Text>
                <Text style={{ color: colors.textTertiary, fontSize: 11, marginTop: 2 }}>Which tab opens first</Text>
              </View>
            </View>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, paddingLeft: 48 }}>
              {TAB_OPTIONS.map((tab) => (
                <TouchableOpacity
                  key={tab.key}
                  onPress={() => setDefaultTab(tab.key)}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 6,
                    paddingHorizontal: 14,
                    paddingVertical: 8,
                    borderRadius: 12,
                    backgroundColor: defaultTab === tab.key ? "#2bb883" : colors.glassCard,
                    borderWidth: 1,
                    borderColor: defaultTab === tab.key ? "#2bb883" : colors.glassBorderStrong,
                  }}
                >
                  <Ionicons
                    name={tab.icon}
                    size={14}
                    color={defaultTab === tab.key ? "#ffffff" : colors.textTertiary}
                  />
                  <Text
                    style={{
                      color: defaultTab === tab.key ? "#ffffff" : colors.textSecondary,
                      fontSize: 12,
                      fontWeight: "700",
                    }}
                  >
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Tab Visibility */}
          <View style={{ paddingTop: 14 }}>
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
              <View
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 11,
                  backgroundColor: "#5494e012",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Ionicons name="eye-outline" size={18} color="#5494e0" />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={{ color: colors.textSubtitle, fontSize: 15, fontWeight: "600" }}>Tab Visibility</Text>
                <Text style={{ color: colors.textTertiary, fontSize: 11, marginTop: 2 }}>Show/hide tabs on home</Text>
              </View>
            </View>
            {[
              { key: "finance", label: "Finance", icon: "cash", color: "#2bb883" },
              { key: "goals", label: "Goals", icon: "trophy", color: "#e0a820" },
              { key: "workout", label: "Workout", icon: "barbell", color: "#e06612" },
              { key: "debts", label: "Debts", icon: "wallet", color: "#5494e0" },
            ].map((tab, idx, arr) => (
              <View
                key={tab.key}
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingVertical: 10,
                  paddingLeft: 48,
                  borderBottomWidth: idx < arr.length - 1 ? 1 : 0,
                  borderBottomColor: colors.glassBorderLight,
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                  <Ionicons name={tab.icon} size={16} color={tab.color} />
                  <Text style={{ color: colors.textSubtitle, fontSize: 14, fontWeight: "600" }}>{tab.label}</Text>
                </View>
                <Switch
                  value={tabVisibility[tab.key] !== false}
                  onValueChange={() => toggleTabVisibility(tab.key)}
                  trackColor={{ false: colors.switchTrackOff, true: `${tab.color}50` }}
                  thumbColor={tabVisibility[tab.key] !== false ? tab.color : "#6b7280"}
                />
              </View>
            ))}
          </View>
        </Card>



        {/* Footer */}
        <View style={{ alignItems: "center", paddingVertical: 20 }}>
          <Text style={{ color: colors.textTertiary, fontSize: 12 }}>HustleKit</Text>
          <Text style={{ color: colors.textDim, fontSize: 11, marginTop: 4 }}>Made with dedication</Text>
        </View>
      </ScrollView>
    </View>
  );
};

export default SettingsScreen;
