import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Animated,
  ActivityIndicator,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from "react-native";
import { loginUser, signupUser, googleLogin } from "../services/api";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import { useToast } from "../context/ToastContext";
import useShake from "../hooks/useShake";
import {
  GoogleSignin,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import Constants from "expo-constants";

const LoginScreen = ({ onLogin }) => {
  const { colors } = useTheme();
  const { showToast } = useToast();

  const [isSignup, setIsSignup] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [googleLoading, setGoogleLoading] = useState(false);

  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const { shakeAnim: nameShake, triggerShake: shakeNameField } = useShake();
  const { shakeAnim: emailShake, triggerShake: shakeEmailField } = useShake();
  const { shakeAnim: passwordShake, triggerShake: shakePasswordField } = useShake();

  useEffect(() => {
    GoogleSignin.configure({
      webClientId: Constants.expoConfig?.extra?.googleWebClientId,
    });
  }, []);

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      await GoogleSignin.hasPlayServices();
      await GoogleSignin.signIn();
      const { idToken } = await GoogleSignin.getTokens();
      const res = await googleLogin(idToken);
      onLogin(res.data.data);
    } catch (err) {
      if (err.code === statusCodes.SIGN_IN_CANCELLED) {
        // User cancelled — do nothing
      } else if (err.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        showToast("Google Play Services not available", "error");
      } else if (err.response?.data?.message) {
        showToast(err.response.data.message, "error");
      } else if (err.message === "Network Error") {
        showToast("Could not connect to server", "error");
      } else {
        showToast("Google sign-in failed. Please try again.", "error");
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleSubmit = async () => {
    let hasError = false;
    setNameError(""); setEmailError(""); setPasswordError("");

    if (!email.trim()) {
      setEmailError("Email is required");
      shakeEmailField();
      hasError = true;
    }
    if (!password.trim()) {
      setPasswordError("Password is required");
      shakePasswordField();
      hasError = true;
    }
    if (isSignup && !name.trim()) {
      setNameError("Name is required");
      shakeNameField();
      hasError = true;
    }
    if (hasError) return;

    setLoading(true);
    try {
      let res;
      if (isSignup) {
        res = await signupUser({ name: name.trim(), email: email.trim().toLowerCase(), password });
      } else {
        res = await loginUser({ email: email.trim().toLowerCase(), password });
      }
      onLogin(res.data.data);
    } catch (err) {
      const raw = err.response?.data?.message;
      let msg;
      if (typeof raw === "string") msg = raw;
      else if (err.message === "Network Error") msg = "Could not connect to server. Please check your internet or make sure the backend is running.";
      else msg = "Something went wrong. Please try again.";
      showToast(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={{ flex: 1, justifyContent: "center", padding: 28 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Logo / Branding */}
        <View style={{ alignItems: "center", marginBottom: 48 }}>
          <View
            style={{
              width: 80,
              height: 80,
              borderRadius: 24,
              backgroundColor: "#4078e012",
              justifyContent: "center",
              alignItems: "center",
              borderWidth: 1,
              borderColor: "#4078e025",
              marginBottom: 16,
            }}
          >
            <Text style={{ fontSize: 40 }}>{"\u{1F525}"}</Text>
          </View>
          <Text style={{ color: colors.textPrimary, fontSize: 34, fontWeight: "900", letterSpacing: 1 }}>
            HustleKit
          </Text>
          <Text style={{ color: colors.textTertiary, fontSize: 14, marginTop: 8, letterSpacing: 0.5 }}>
            Track. Grind. Level Up.
          </Text>
        </View>

        {/* Form card */}
        <View
          style={{
            backgroundColor: colors.glassCardAlt,
            borderRadius: 24,
            padding: 28,
            borderWidth: 1,
            borderColor: colors.glassBorder,
          }}
        >
          <Text style={{ color: colors.textPrimary, fontSize: 22, fontWeight: "700", marginBottom: 6, textAlign: "center" }}>
            {isSignup ? "Create Account" : "Welcome Back"}
          </Text>
          <Text style={{ color: colors.textTertiary, fontSize: 13, marginBottom: 28, textAlign: "center" }}>
            {isSignup ? "Sign up to start your journey" : "Log in to continue hustling"}
          </Text>

          {isSignup && (
            <Animated.View style={{ marginBottom: 16, transform: [{ translateX: nameShake }] }}>
              <Text style={{ color: colors.textSecondary, fontSize: 12, marginBottom: 8, fontWeight: "500" }}>Full Name</Text>
              <TextInput
                value={name}
                onChangeText={(t) => { setName(t); setNameError(""); }}
                placeholder="e.g. Amit Kumar"
                placeholderTextColor={colors.textDim}
                style={{
                  backgroundColor: colors.glassCard,
                  color: colors.textPrimary,
                  borderRadius: 14,
                  padding: 16,
                  fontSize: 15,
                  borderWidth: 1,
                  borderColor: nameError ? colors.accentRed : colors.glassBorder,
                }}
              />
              {nameError ? <Text style={{ color: colors.accentRed, fontSize: 12, marginTop: 4, marginLeft: 4 }}>{nameError}</Text> : null}
            </Animated.View>
          )}

          <Animated.View style={{ marginBottom: 16, transform: [{ translateX: emailShake }] }}>
            <Text style={{ color: colors.textSecondary, fontSize: 12, marginBottom: 8, fontWeight: "500" }}>Email</Text>
            <TextInput
              value={email}
              onChangeText={(t) => { setEmail(t); setEmailError(""); }}
              placeholder="e.g. amit@example.com"
              placeholderTextColor={colors.textDim}
              keyboardType="email-address"
              autoCapitalize="none"
              style={{
                backgroundColor: colors.glassCard,
                color: colors.textPrimary,
                borderRadius: 14,
                padding: 16,
                fontSize: 15,
                borderWidth: 1,
                borderColor: emailError ? colors.accentRed : colors.glassBorder,
              }}
            />
            {emailError ? <Text style={{ color: colors.accentRed, fontSize: 12, marginTop: 4, marginLeft: 4 }}>{emailError}</Text> : null}
          </Animated.View>

          <Animated.View style={{ marginBottom: 28, transform: [{ translateX: passwordShake }] }}>
            <Text style={{ color: colors.textSecondary, fontSize: 12, marginBottom: 8, fontWeight: "500" }}>Password</Text>
            <View style={{ position: "relative" }}>
              <TextInput
                value={password}
                onChangeText={(t) => { setPassword(t); setPasswordError(""); }}
                placeholder="Enter password"
                placeholderTextColor={colors.textDim}
                secureTextEntry={!showPassword}
                style={{
                  backgroundColor: colors.glassCard,
                  color: colors.textPrimary,
                  borderRadius: 14,
                  padding: 16,
                  paddingRight: 52,
                  fontSize: 15,
                  borderWidth: 1,
                  borderColor: passwordError ? colors.accentRed : colors.glassBorder,
                }}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: 16,
                  top: 0,
                  bottom: 0,
                  justifyContent: "center",
                }}
              >
                <Ionicons
                  name={showPassword ? "eye-off" : "eye"}
                  size={22}
                  color={colors.textTertiary}
                />
              </TouchableOpacity>
            </View>
            {passwordError ? <Text style={{ color: colors.accentRed, fontSize: 12, marginTop: 4, marginLeft: 4 }}>{passwordError}</Text> : null}
          </Animated.View>

          {/* Submit button */}
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={loading}
            style={{
              backgroundColor: "#4078e0",
              borderRadius: 16,
              padding: 18,
              alignItems: "center",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={{ color: "#ffffff", fontWeight: "700", fontSize: 16, letterSpacing: 0.5 }}>
                {isSignup ? "Sign Up" : "Log In"}
              </Text>
            )}
          </TouchableOpacity>

          {/* Or divider */}
          <View style={{ flexDirection: "row", alignItems: "center", marginTop: 24 }}>
            <View style={{ flex: 1, height: 1, backgroundColor: colors.glassBorder }} />
            <Text style={{ color: colors.textTertiary, fontSize: 13, marginHorizontal: 14 }}>or</Text>
            <View style={{ flex: 1, height: 1, backgroundColor: colors.glassBorder }} />
          </View>

          {/* Google Sign-In button */}
          <TouchableOpacity
            onPress={handleGoogleSignIn}
            disabled={googleLoading}
            style={{
              backgroundColor: colors.glassCard,
              borderRadius: 16,
              padding: 16,
              alignItems: "center",
              flexDirection: "row",
              justifyContent: "center",
              marginTop: 16,
              borderWidth: 1,
              borderColor: colors.glassBorder,
              opacity: googleLoading ? 0.7 : 1,
            }}
          >
            {googleLoading ? (
              <ActivityIndicator color={colors.textSecondary} />
            ) : (
              <>
                <Text style={{ fontSize: 20, marginRight: 10 }}>G</Text>
                <Text style={{ color: colors.textPrimary, fontWeight: "600", fontSize: 15 }}>
                  Continue with Google
                </Text>
              </>
            )}
          </TouchableOpacity>

          {/* Toggle signup/login */}
          <TouchableOpacity
            onPress={() => { setIsSignup(!isSignup); setName(""); setEmail(""); setPassword(""); }}
            style={{ marginTop: 24, alignItems: "center" }}
          >
            <Text style={{ color: colors.textTertiary, fontSize: 14 }}>
              {isSignup ? "Already have an account? " : "Don't have an account? "}
              <Text style={{ color: "#4078e0", fontWeight: "600" }}>
                {isSignup ? "Log In" : "Sign Up"}
              </Text>
            </Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <Text style={{ color: colors.textDim, fontSize: 11, textAlign: "center", marginTop: 36 }}>
          HustleKit v1.0.0
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;
