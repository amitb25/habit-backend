import React, { useEffect, useRef } from "react";
import { Animated, Text, TouchableOpacity, View, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import { useToast } from "../context/ToastContext";

const ICON_MAP = {
  error: "close-circle",
  success: "checkmark-circle",
  warning: "warning",
  info: "information-circle",
};

const Toast = () => {
  const { colors } = useTheme();
  const { toast, hideToast } = useToast();
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  const accentMap = {
    error: colors.accentRed,
    success: colors.accentGreen,
    warning: colors.accentYellow,
    info: colors.accentBlue,
  };

  useEffect(() => {
    if (toast) {
      translateY.setValue(-100);
      opacity.setValue(0);
      Animated.parallel([
        Animated.spring(translateY, { toValue: 0, useNativeDriver: true, tension: 80, friction: 12 }),
        Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateY, { toValue: -100, duration: 200, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start();
    }
  }, [toast?.key]);

  if (!toast) return null;

  const accent = accentMap[toast.type] || accentMap.info;
  const icon = ICON_MAP[toast.type] || ICON_MAP.info;
  const topInset = Platform.OS === "ios" ? 50 : 36;

  return (
    <Animated.View
      style={{
        position: "absolute",
        top: topInset,
        left: 16,
        right: 16,
        zIndex: 9999,
        transform: [{ translateY }],
        opacity,
      }}
    >
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={hideToast}
        style={{
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: colors.glassCard,
          borderRadius: 14,
          borderWidth: 1,
          borderColor: colors.glassBorder,
          overflow: "hidden",
        }}
      >
        <View style={{ width: 3, alignSelf: "stretch", backgroundColor: accent }} />
        <View style={{ flexDirection: "row", alignItems: "center", flex: 1, padding: 14, paddingLeft: 12 }}>
          <Ionicons name={icon} size={20} color={accent} style={{ marginRight: 10 }} />
          <Text style={{ color: colors.textPrimary, fontSize: 14, fontWeight: "500", flex: 1 }}>
            {toast.message}
          </Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default Toast;
