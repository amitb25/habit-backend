import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Platform,
  StatusBar,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useGlobal } from "../context/GlobalContext";
import { useTheme } from "../context/ThemeContext";
import DailyTaskSheet from "../components/DailyTaskSheet";

const DailyTaskSheetScreen = ({ navigation }) => {
  const { profile } = useGlobal();
  const { colors, isDark, cardShadow } = useTheme();

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
          borderBottomColor: colors.borderLight,
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
                source={{ uri: profile.avatar_url }}
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 19,
                  marginRight: 10,
                  borderWidth: 1,
                  borderColor: "#84643830",
                }}
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
              Task Sheet
            </Text>
          </View>
        </View>
      </View>

      {/* Content */}
      <View style={{ flex: 1, padding: 16 }}>
        <DailyTaskSheet />
      </View>

      {/* Floating Bottom Bar */}
      <View
        style={{
          position: "absolute",
          bottom: Platform.OS === "ios" ? 28 : 14,
          left: 0,
          right: 0,
          alignItems: "center",
        }}
        pointerEvents="box-none"
      >
        <View
          style={{
            backgroundColor: colors.floatingBarBg,
            borderRadius: 24,
            paddingVertical: 10,
            paddingHorizontal: 40,
            borderWidth: 1,
            borderColor: colors.borderStrong,
          }}
        >
          <TouchableOpacity
            onPress={() => navigation.navigate("HomeMain")}
            activeOpacity={0.8}
          >
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: 14,
                backgroundColor: colors.floatingButtonBg,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Ionicons name="home" size={22} color={colors.textPrimary} />
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default DailyTaskSheetScreen;
