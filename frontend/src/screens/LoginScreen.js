import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from "react-native";
import { loginUser, signupUser } from "../services/api";

const LoginScreen = ({ onLogin }) => {
  const [isSignup, setIsSignup] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Error", "Email and password are required");
      return;
    }
    if (isSignup && !name.trim()) {
      Alert.alert("Error", "Name is required");
      return;
    }

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
      const msg = err.response?.data?.message || "Something went wrong";
      Alert.alert("Error", msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#0a0a0f" }}
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
              backgroundColor: "#4f8cff12",
              justifyContent: "center",
              alignItems: "center",
              borderWidth: 1,
              borderColor: "#4f8cff25",
              marginBottom: 16,
            }}
          >
            <Text style={{ fontSize: 40 }}>{"\u{1F525}"}</Text>
          </View>
          <Text style={{ color: "#ffffff", fontSize: 34, fontWeight: "900", letterSpacing: 1 }}>
            HustleKit
          </Text>
          <Text style={{ color: "#6b7280", fontSize: 14, marginTop: 8, letterSpacing: 0.5 }}>
            Track. Grind. Level Up.
          </Text>
        </View>

        {/* Form card */}
        <View
          style={{
            backgroundColor: "#12121a",
            borderRadius: 24,
            padding: 28,
            borderWidth: 1,
            borderColor: "#ffffff08",
          }}
        >
          <Text style={{ color: "#ffffff", fontSize: 22, fontWeight: "700", marginBottom: 6, textAlign: "center" }}>
            {isSignup ? "Create Account" : "Welcome Back"}
          </Text>
          <Text style={{ color: "#6b7280", fontSize: 13, marginBottom: 28, textAlign: "center" }}>
            {isSignup ? "Sign up to start your journey" : "Log in to continue hustling"}
          </Text>

          {isSignup && (
            <View style={{ marginBottom: 16 }}>
              <Text style={{ color: "#9ca3af", fontSize: 12, marginBottom: 8, fontWeight: "500" }}>Full Name</Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="e.g. Amit Kumar"
                placeholderTextColor="#4b5563"
                style={{
                  backgroundColor: "#1a1a2e",
                  color: "#ffffff",
                  borderRadius: 14,
                  padding: 16,
                  fontSize: 15,
                  borderWidth: 1,
                  borderColor: "#ffffff08",
                }}
              />
            </View>
          )}

          <View style={{ marginBottom: 16 }}>
            <Text style={{ color: "#9ca3af", fontSize: 12, marginBottom: 8, fontWeight: "500" }}>Email</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="e.g. amit@example.com"
              placeholderTextColor="#4b5563"
              keyboardType="email-address"
              autoCapitalize="none"
              style={{
                backgroundColor: "#1a1a2e",
                color: "#ffffff",
                borderRadius: 14,
                padding: 16,
                fontSize: 15,
                borderWidth: 1,
                borderColor: "#ffffff08",
              }}
            />
          </View>

          <View style={{ marginBottom: 28 }}>
            <Text style={{ color: "#9ca3af", fontSize: 12, marginBottom: 8, fontWeight: "500" }}>Password</Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="Enter password"
              placeholderTextColor="#4b5563"
              secureTextEntry
              style={{
                backgroundColor: "#1a1a2e",
                color: "#ffffff",
                borderRadius: 14,
                padding: 16,
                fontSize: 15,
                borderWidth: 1,
                borderColor: "#ffffff08",
              }}
            />
          </View>

          {/* Submit button */}
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={loading}
            style={{
              backgroundColor: "#4f8cff",
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

          {/* Toggle signup/login */}
          <TouchableOpacity
            onPress={() => { setIsSignup(!isSignup); setName(""); setEmail(""); setPassword(""); }}
            style={{ marginTop: 24, alignItems: "center" }}
          >
            <Text style={{ color: "#6b7280", fontSize: 14 }}>
              {isSignup ? "Already have an account? " : "Don't have an account? "}
              <Text style={{ color: "#4f8cff", fontWeight: "600" }}>
                {isSignup ? "Log In" : "Sign Up"}
              </Text>
            </Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <Text style={{ color: "#4b5563", fontSize: 11, textAlign: "center", marginTop: 36 }}>
          HustleKit v1.0.0
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;
