import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  Image,
  Platform,
  StatusBar,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import {
  verifyPin,
  authenticateBiometric,
  isBiometricAvailable,
  getBiometricType,
  getLockSettings,
} from "../services/appLock";
import useShake from "../hooks/useShake";

const { width } = Dimensions.get("window");
const PIN_LENGTH = 4;
const MAX_ATTEMPTS = 3;
const COOLDOWN_SECONDS = 30;

const AppLockScreen = ({ onUnlock }) => {
  const { colors, isDark } = useTheme();
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [cooldown, setCooldown] = useState(0);
  const [lockType, setLockType] = useState("pin");
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricType, setBiometricType] = useState(null);
  const { shakeAnim, triggerShake } = useShake();
  const cooldownRef = useRef(null);
  const dotsAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    initLock();
    return () => {
      if (cooldownRef.current) clearInterval(cooldownRef.current);
    };
  }, []);

  const initLock = async () => {
    const settings = await getLockSettings();
    setLockType(settings.type);

    const bioAvail = await isBiometricAvailable();
    setBiometricAvailable(bioAvail);

    if (bioAvail) {
      const type = await getBiometricType();
      setBiometricType(type);

      // Auto-prompt biometric if type includes biometric
      if (settings.type === "biometric" || settings.type === "both") {
        handleBiometric();
      }
    }
  };

  const handleBiometric = async () => {
    const success = await authenticateBiometric();
    if (success) {
      onUnlock();
    }
  };

  const startCooldown = useCallback(() => {
    setCooldown(COOLDOWN_SECONDS);
    cooldownRef.current = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(cooldownRef.current);
          setAttempts(0);
          setError("");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  const handlePinInput = useCallback(
    async (digit) => {
      if (cooldown > 0) return;

      const newPin = pin + digit;
      setPin(newPin);
      setError("");

      if (newPin.length === PIN_LENGTH) {
        const valid = await verifyPin(newPin);
        if (valid) {
          onUnlock();
        } else {
          const newAttempts = attempts + 1;
          setAttempts(newAttempts);
          triggerShake();

          // Pulse animation on dots
          Animated.sequence([
            Animated.timing(dotsAnim, {
              toValue: 0.3,
              duration: 100,
              useNativeDriver: true,
            }),
            Animated.timing(dotsAnim, {
              toValue: 1,
              duration: 100,
              useNativeDriver: true,
            }),
          ]).start();

          if (newAttempts >= MAX_ATTEMPTS) {
            setError(`Too many attempts. Try again in ${COOLDOWN_SECONDS}s`);
            startCooldown();
          } else {
            setError(
              `Wrong PIN. ${MAX_ATTEMPTS - newAttempts} attempt${MAX_ATTEMPTS - newAttempts > 1 ? "s" : ""} left`
            );
          }
          setPin("");
        }
      }
    },
    [pin, cooldown, attempts, onUnlock, triggerShake, startCooldown, dotsAnim]
  );

  const handleBackspace = useCallback(() => {
    if (cooldown > 0) return;
    setPin((prev) => prev.slice(0, -1));
    setError("");
  }, [cooldown]);

  const showBiometricButton =
    biometricAvailable && (lockType === "biometric" || lockType === "both");

  const getBiometricIcon = () => {
    if (biometricType === "face") return "scan-outline";
    return "finger-print-outline";
  };

  const NumberButton = ({ digit, onPress, disabled }) => (
    <TouchableOpacity
      activeOpacity={0.6}
      onPress={() => onPress(digit)}
      disabled={disabled}
      style={{
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: colors.glassCardElevated,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 1,
        borderColor: colors.glassBorderLight,
        opacity: disabled ? 0.3 : 1,
      }}
    >
      <Text
        style={{
          color: colors.textPrimary,
          fontSize: 28,
          fontWeight: "600",
        }}
      >
        {digit}
      </Text>
    </TouchableOpacity>
  );

  const isDisabled = cooldown > 0;

  return (
    <View
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: colors.background,
        zIndex: 9999,
        justifyContent: "center",
        alignItems: "center",
        paddingTop: Platform.OS === "ios" ? 60 : (StatusBar.currentHeight || 24) + 20,
      }}
    >
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={colors.background}
      />

      {/* Logo */}
      <Image
        source={require("../../assets/logo.png")}
        style={{ width: 120, height: 54, marginBottom: 30 }}
        resizeMode="contain"
      />

      {/* Title */}
      <Text
        style={{
          color: colors.textPrimary,
          fontSize: 20,
          fontWeight: "700",
          marginBottom: 8,
        }}
      >
        {lockType === "biometric" ? "Unlock LifeStack" : "Enter your PIN"}
      </Text>

      {lockType === "biometric" && !error ? (
        <Text
          style={{
            color: colors.textSecondary,
            fontSize: 14,
            marginBottom: 30,
          }}
        >
          Use {biometricType === "face" ? "Face ID" : "fingerprint"} to unlock
        </Text>
      ) : (
        <>
          {/* PIN Dots */}
          <Animated.View
            style={{
              flexDirection: "row",
              gap: 16,
              marginVertical: 24,
              transform: [{ translateX: shakeAnim }],
              opacity: dotsAnim,
            }}
          >
            {Array.from({ length: PIN_LENGTH }).map((_, i) => (
              <View
                key={i}
                style={{
                  width: 16,
                  height: 16,
                  borderRadius: 8,
                  backgroundColor:
                    i < pin.length
                      ? "#4078e0"
                      : isDark
                        ? "#2a2a2a"
                        : "#d1d1d6",
                  borderWidth: i < pin.length ? 0 : 1.5,
                  borderColor: isDark ? "#3a3a3a" : "#c7c7cc",
                }}
              />
            ))}
          </Animated.View>

          {/* Error / Cooldown Message */}
          <View style={{ height: 22, marginBottom: 16 }}>
            {cooldown > 0 ? (
              <Text
                style={{ color: "#e05555", fontSize: 13, fontWeight: "600" }}
              >
                Try again in {cooldown}s
              </Text>
            ) : error ? (
              <Text
                style={{ color: "#e05555", fontSize: 13, fontWeight: "600" }}
              >
                {error}
              </Text>
            ) : null}
          </View>

          {/* Number Pad */}
          <View style={{ alignItems: "center", gap: 14 }}>
            {/* Row 1 */}
            <View style={{ flexDirection: "row", gap: 20 }}>
              <NumberButton digit="1" onPress={handlePinInput} disabled={isDisabled} />
              <NumberButton digit="2" onPress={handlePinInput} disabled={isDisabled} />
              <NumberButton digit="3" onPress={handlePinInput} disabled={isDisabled} />
            </View>
            {/* Row 2 */}
            <View style={{ flexDirection: "row", gap: 20 }}>
              <NumberButton digit="4" onPress={handlePinInput} disabled={isDisabled} />
              <NumberButton digit="5" onPress={handlePinInput} disabled={isDisabled} />
              <NumberButton digit="6" onPress={handlePinInput} disabled={isDisabled} />
            </View>
            {/* Row 3 */}
            <View style={{ flexDirection: "row", gap: 20 }}>
              <NumberButton digit="7" onPress={handlePinInput} disabled={isDisabled} />
              <NumberButton digit="8" onPress={handlePinInput} disabled={isDisabled} />
              <NumberButton digit="9" onPress={handlePinInput} disabled={isDisabled} />
            </View>
            {/* Row 4 */}
            <View style={{ flexDirection: "row", gap: 20 }}>
              {/* Biometric / Empty */}
              {showBiometricButton ? (
                <TouchableOpacity
                  activeOpacity={0.6}
                  onPress={handleBiometric}
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius: 36,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Ionicons
                    name={getBiometricIcon()}
                    size={30}
                    color="#4078e0"
                  />
                </TouchableOpacity>
              ) : (
                <View style={{ width: 72, height: 72 }} />
              )}

              <NumberButton digit="0" onPress={handlePinInput} disabled={isDisabled} />

              {/* Backspace */}
              <TouchableOpacity
                activeOpacity={0.6}
                onPress={handleBackspace}
                disabled={isDisabled || pin.length === 0}
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: 36,
                  justifyContent: "center",
                  alignItems: "center",
                  opacity: isDisabled || pin.length === 0 ? 0.3 : 1,
                }}
              >
                <Ionicons
                  name="backspace-outline"
                  size={26}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
            </View>
          </View>
        </>
      )}

      {/* Biometric-only: big fingerprint button */}
      {lockType === "biometric" && (
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleBiometric}
          style={{
            marginTop: 30,
            width: 80,
            height: 80,
            borderRadius: 40,
            backgroundColor: "#4078e015",
            justifyContent: "center",
            alignItems: "center",
            borderWidth: 2,
            borderColor: "#4078e030",
          }}
        >
          <Ionicons name={getBiometricIcon()} size={40} color="#4078e0" />
        </TouchableOpacity>
      )}
    </View>
  );
};

export default AppLockScreen;
