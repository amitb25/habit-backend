import React, { useState, useEffect, useCallback, memo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Animated,
  Platform,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import {
  savePin,
  verifyPin,
  authenticateBiometric,
  saveLockSettings,
  clearLockSettings,
} from "../services/appLock";
import useShake from "../hooks/useShake";

const PIN_LENGTH = 4;

// Memoized number button — prevents re-render of all buttons on every keystroke
const NumButton = memo(({ digit, onPress, colors }) => (
  <TouchableOpacity
    onPress={() => onPress(digit)}
    activeOpacity={0.5}
    style={{
      width: 70,
      height: 70,
      borderRadius: 35,
      backgroundColor: colors.glassCardElevated,
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 1,
      borderColor: colors.glassBorderLight,
    }}
  >
    <Text style={{ color: colors.textPrimary, fontSize: 28, fontWeight: "500" }}>
      {digit}
    </Text>
  </TouchableOpacity>
));

/**
 * Full-screen PIN modal — all PIN state lives here, not in parent.
 *
 * Props:
 *   visible        - show/hide
 *   mode           - "setup" | "change" | "verify-disable"
 *   lockType       - current lock type for saveLockSettings
 *   biometricAvail - device has biometric
 *   biometricLabel - "Fingerprint" | "Face ID"
 *   onSuccess      - called after successful operation: ({ action, lockType })
 *   onCancel       - called on close/cancel
 */
const PinModal = ({
  visible,
  mode,
  lockType,
  biometricAvail,
  biometricLabel,
  onSuccess,
  onCancel,
}) => {
  const { colors, isDark } = useTheme();
  const { shakeAnim, triggerShake } = useShake();

  // All PIN state is local to this component
  const [pin, setPin] = useState("");
  const [step, setStep] = useState(1);
  const [firstPin, setFirstPin] = useState("");
  const [error, setError] = useState("");

  // Reset state when modal opens
  useEffect(() => {
    if (visible) {
      setPin("");
      setStep(1);
      setFirstPin("");
      setError("");
    }
  }, [visible]);

  // Auto-submit when 4 digits entered
  useEffect(() => {
    if (pin.length === PIN_LENGTH && visible) {
      const timer = setTimeout(() => processPin(pin), 150);
      return () => clearTimeout(timer);
    }
  }, [pin]);

  const processPin = async (entered) => {
    if (mode === "setup") {
      if (step === 1) {
        setFirstPin(entered);
        setPin("");
        setStep(2);
        setError("");
      } else {
        if (entered !== firstPin) {
          setError("PINs don't match. Try again.");
          triggerShake();
          setPin("");
          setStep(1);
          setFirstPin("");
        } else {
          await savePin(entered);
          await saveLockSettings({ enabled: true, type: lockType });
          onSuccess({ action: "enabled" });
        }
      }
    } else if (mode === "verify-disable") {
      const valid = await verifyPin(entered);
      if (valid) {
        await clearLockSettings();
        onSuccess({ action: "disabled" });
      } else {
        setError("Wrong PIN");
        triggerShake();
        setPin("");
      }
    } else if (mode === "change") {
      if (step === 1) {
        const valid = await verifyPin(entered);
        if (valid) {
          setPin("");
          setStep(2);
          setError("");
        } else {
          setError("Wrong current PIN");
          triggerShake();
          setPin("");
        }
      } else if (step === 2) {
        setFirstPin(entered);
        setPin("");
        setStep(3);
        setError("");
      } else {
        if (entered !== firstPin) {
          setError("PINs don't match. Try again.");
          triggerShake();
          setPin("");
          setStep(2);
          setFirstPin("");
        } else {
          await savePin(entered);
          onSuccess({ action: "changed" });
        }
      }
    }
  };

  const handleBiometricVerify = async () => {
    const success = await authenticateBiometric();
    if (!success) return;

    if (mode === "verify-disable") {
      await clearLockSettings();
      onSuccess({ action: "disabled" });
    } else if (mode === "change" && step === 1) {
      setPin("");
      setStep(2);
      setError("");
    }
  };

  const addDigit = useCallback((d) => {
    setPin((p) => (p.length < PIN_LENGTH ? p + d : p));
    setError("");
  }, []);

  const removeDigit = useCallback(() => {
    setPin((p) => p.slice(0, -1));
  }, []);

  const getTitle = () => {
    if (mode === "setup") return step === 1 ? "Set a 4-digit PIN" : "Confirm your PIN";
    if (mode === "verify-disable") return "Enter current PIN";
    if (mode === "change") {
      if (step === 1) return "Enter current PIN";
      if (step === 2) return "Enter new PIN";
      return "Confirm new PIN";
    }
    return "Enter PIN";
  };

  const getSubtitle = () => {
    if (mode === "setup") return step === 1 ? "Choose a secure 4-digit PIN" : "Re-enter to confirm";
    if (mode === "verify-disable") return "Verify to disable app lock";
    if (mode === "change") {
      if (step === 1) return "Verify your identity";
      if (step === 2) return "Choose a new 4-digit PIN";
      return "Re-enter to confirm";
    }
    return "";
  };

  const totalSteps = mode === "setup" ? [1, 2] : mode === "change" ? [1, 2, 3] : null;
  const showBioButton =
    biometricAvail &&
    lockType !== "pin" &&
    (mode === "verify-disable" || (mode === "change" && step === 1));

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onCancel}>
      <View
        style={{
          flex: 1,
          backgroundColor: colors.background,
          paddingTop: Platform.OS === "ios" ? 60 : (StatusBar.currentHeight || 24) + 20,
        }}
      >
        {/* Top Bar */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            paddingHorizontal: 20,
            marginBottom: 10,
          }}
        >
          <TouchableOpacity onPress={onCancel} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name="close" size={24} color={colors.textSecondary} />
          </TouchableOpacity>

          {totalSteps && (
            <View style={{ flexDirection: "row", gap: 6 }}>
              {totalSteps.map((s) => (
                <View
                  key={s}
                  style={{
                    width: s === step ? 20 : 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: s <= step ? "#e05555" : isDark ? "#2a2a2a" : "#d1d1d6",
                  }}
                />
              ))}
            </View>
          )}

          <View style={{ width: 24 }} />
        </View>

        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingBottom: 40 }}>
          {/* Lock Icon */}
          <View
            style={{
              width: 64,
              height: 64,
              borderRadius: 32,
              backgroundColor: "#e0555512",
              justifyContent: "center",
              alignItems: "center",
              marginBottom: 20,
              borderWidth: 1.5,
              borderColor: "#e0555520",
            }}
          >
            <Ionicons
              name={mode === "verify-disable" ? "lock-open" : "lock-closed"}
              size={28}
              color="#e05555"
            />
          </View>

          {/* Title */}
          <Text
            style={{
              color: colors.textPrimary,
              fontSize: 22,
              fontWeight: "800",
              marginBottom: 6,
              letterSpacing: 0.3,
            }}
          >
            {getTitle()}
          </Text>
          <Text style={{ color: colors.textTertiary, fontSize: 13, marginBottom: 28 }}>
            {getSubtitle()}
          </Text>

          {/* PIN Dots */}
          <Animated.View
            style={{
              flexDirection: "row",
              gap: 20,
              marginBottom: 12,
              transform: [{ translateX: shakeAnim }],
            }}
          >
            {[0, 1, 2, 3].map((i) => {
              const filled = i < pin.length;
              return (
                <View
                  key={i}
                  style={{
                    width: filled ? 18 : 16,
                    height: filled ? 18 : 16,
                    borderRadius: 9,
                    backgroundColor: filled ? "#e05555" : "transparent",
                    borderWidth: filled ? 0 : 2,
                    borderColor: isDark ? "#3a3a3a" : "#c7c7cc",
                    transform: [{ scale: filled ? 1.1 : 1 }],
                  }}
                />
              );
            })}
          </Animated.View>

          {/* Error */}
          <View style={{ height: 28, justifyContent: "center" }}>
            {error ? (
              <Text style={{ color: "#e05555", fontSize: 13, fontWeight: "600" }}>{error}</Text>
            ) : null}
          </View>

          {/* Number Pad */}
          <View style={{ alignItems: "center", gap: 14, marginTop: 8 }}>
            {[[1, 2, 3], [4, 5, 6], [7, 8, 9]].map((row, ri) => (
              <View key={ri} style={{ flexDirection: "row", gap: 22 }}>
                {row.map((d) => (
                  <NumButton key={d} digit={String(d)} onPress={addDigit} colors={colors} />
                ))}
              </View>
            ))}

            {/* Bottom row: bio / 0 / backspace */}
            <View style={{ flexDirection: "row", gap: 22 }}>
              {showBioButton ? (
                <TouchableOpacity
                  onPress={handleBiometricVerify}
                  activeOpacity={0.5}
                  style={{
                    width: 70,
                    height: 70,
                    borderRadius: 35,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Ionicons
                    name={biometricLabel === "Face ID" ? "scan-outline" : "finger-print-outline"}
                    size={28}
                    color="#e05555"
                  />
                </TouchableOpacity>
              ) : (
                <View style={{ width: 70, height: 70 }} />
              )}

              <NumButton digit="0" onPress={addDigit} colors={colors} />

              <TouchableOpacity
                onPress={removeDigit}
                activeOpacity={0.5}
                disabled={pin.length === 0}
                style={{
                  width: 70,
                  height: 70,
                  borderRadius: 35,
                  justifyContent: "center",
                  alignItems: "center",
                  opacity: pin.length === 0 ? 0.3 : 1,
                }}
              >
                <Ionicons name="backspace-outline" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default memo(PinModal);
