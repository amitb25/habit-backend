import React, { useEffect } from "react";
import { View, Text, Modal, TouchableOpacity } from "react-native";
import { BlurView } from "expo-blur";
import { useTheme } from '../context/ThemeContext';

const LevelUpModal = ({ visible, level, onDismiss }) => {
  const { colors } = useTheme();

  useEffect(() => {
    if (visible) {
      const timer = setTimeout(onDismiss, 3000);
      return () => clearTimeout(timer);
    }
  }, [visible]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onDismiss}>
      <TouchableOpacity
        activeOpacity={1}
        onPress={onDismiss}
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <BlurView
          intensity={60}
          tint={colors.blurTint}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
          }}
        />
        <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)" }} />
        <View
          style={{
            backgroundColor: colors.glassCardElevated,
            borderRadius: 28,
            padding: 40,
            alignItems: "center",
            borderWidth: 2,
            borderColor: "#e0a820",
            width: "80%",
            shadowColor: "#e0a820",
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.4,
            shadowRadius: 30,
            elevation: 20,
          }}
        >
          <Text style={{ fontSize: 60, marginBottom: 12 }}>{"\u{1F31F}"}</Text>
          <Text
            style={{
              color: "#e0a820",
              fontSize: 28,
              fontWeight: "900",
              letterSpacing: 1,
              marginBottom: 8,
            }}
          >
            LEVEL UP!
          </Text>
          <View
            style={{
              backgroundColor: "#e0a82015",
              borderRadius: 20,
              paddingHorizontal: 28,
              paddingVertical: 12,
              marginBottom: 12,
            }}
          >
            <Text
              style={{
                color: "#fde68a",
                fontSize: 48,
                fontWeight: "900",
              }}
            >
              {level}
            </Text>
          </View>
          <Text style={{ color: colors.textSecondary, fontSize: 14, textAlign: "center" }}>
            Keep grinding! You're unstoppable.
          </Text>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

export default LevelUpModal;
