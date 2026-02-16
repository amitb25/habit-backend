import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Animated,
  Image,
  ActivityIndicator,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  StatusBar,
} from "react-native";
import { loginUser, signupUser, googleLogin } from "../services/api";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import { useToast } from "../context/ToastContext";
import useShake from "../hooks/useShake";
import Constants from "expo-constants";
import Svg, { Path, G, Defs, ClipPath, Rect } from "react-native-svg";

// Google Sign-In requires native build — gracefully disable in Expo Go
let GoogleSignin = null;
let statusCodes = {};
try {
  const gsi = require("@react-native-google-signin/google-signin");
  GoogleSignin = gsi.GoogleSignin;
  statusCodes = gsi.statusCodes;
} catch (e) {
  // Native module not available (Expo Go) — Google Sign-In will be disabled
}

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
    if (GoogleSignin) {
      GoogleSignin.configure({
        webClientId: Constants.expoConfig?.extra?.googleWebClientId,
      });
    }
  }, []);

  const handleGoogleSignIn = async () => {
    if (!GoogleSignin) {
      showToast("Google Sign-In not available in Expo Go. Use a development build.", "error");
      return;
    }
    setGoogleLoading(true);
    try {
      await GoogleSignin.hasPlayServices();
      // Clear previous session so account picker always shows
      try { await GoogleSignin.signOut(); } catch (_) {}
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
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "center",
          padding: 28,
          paddingTop: (StatusBar.currentHeight || 44) + 16,
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Logo / Branding */}
        <View style={{ alignItems: "center", marginBottom: 48 }}>
          <Image
            source={require("../../assets/logo.png")}
            style={{ width: 220, height: 100 }}
            resizeMode="contain"
          />
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
            activeOpacity={0.7}
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
                <Svg width={20} height={20} viewBox="0 0 16 16" style={{ marginRight: 10 }}>
                  <G clipPath="url(#googleClip)">
                    <Path d="M8 3.167c1.18 0 2.237.406 3.07 1.2l2.284-2.284C11.967.793 10.157 0 8 0 4.873 0 2.17 1.793.854 4.407L3.514 6.47C4.143 4.573 5.913 3.167 8 3.167z" fill="#EA4335" />
                    <Path d="M15.66 8.183c0-.523-.05-1.03-.127-1.516H8v3.006h4.313c-.193.987-.753 1.827-1.593 2.394l2.577 2L14.8 12.673c1.504-1.393 2.36-3.453 2.36-5.88-.003.003-.5.39.5-.61z" fill="#4285F4" />
                    <Path d="M3.51 9.53a4.84 4.84 0 01-.253-1.53c0-.533.09-1.047.253-1.53L.85 4.407A8.004 8.004 0 000 8c0 1.293.307 2.513.853 3.593L3.51 9.53z" fill="#FBBC05" />
                    <Path d="M8 16c2.16 0 3.977-.71 5.297-1.937l-2.577-2c-.717.483-1.64.767-2.72.767-2.087 0-3.857-1.407-4.49-3.303L.85 11.59C2.17 14.207 4.873 16 8 16z" fill="#34A853" />
                  </G>
                  <Defs>
                    <ClipPath id="googleClip">
                      <Rect width={16} height={16} fill="white" />
                    </ClipPath>
                  </Defs>
                </Svg>
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
          LifeStack v1.0.0
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;
