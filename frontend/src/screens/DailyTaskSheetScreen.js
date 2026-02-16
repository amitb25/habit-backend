import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Platform,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useProfile } from "../context/domains/ProfileContext";
import { useTheme } from "../context/ThemeContext";
import DailyTaskSheet from "../components/DailyTaskSheet";

const DailyTaskSheetScreen = ({ navigation }) => {
  const { profile } = useProfile();
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
              Task Sheet
            </Text>
          </View>
        </View>
      </View>

      {/* Content */}
      <View style={{ flex: 1, padding: 16 }}>
        <DailyTaskSheet />
      </View>

    </View>
  );
};

export default DailyTaskSheetScreen;
