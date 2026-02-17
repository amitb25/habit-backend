import * as SecureStore from "expo-secure-store";
import * as LocalAuthentication from "expo-local-authentication";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Keys
const PIN_KEY = "hustlekit_pin";
const LOCK_ENABLED_KEY = "@hustlekit_lock_enabled";
const LOCK_TYPE_KEY = "@hustlekit_lock_type"; // "pin" | "biometric" | "both"

// ── PIN Functions (SecureStore - encrypted) ──

export async function savePin(pin) {
  await SecureStore.setItemAsync(PIN_KEY, pin);
}

export async function getPin() {
  return await SecureStore.getItemAsync(PIN_KEY);
}

export async function removePin() {
  await SecureStore.deleteItemAsync(PIN_KEY);
}

export async function verifyPin(input) {
  const stored = await getPin();
  return stored === input;
}

// ── Biometric Functions ──

export async function isBiometricAvailable() {
  const compatible = await LocalAuthentication.hasHardwareAsync();
  if (!compatible) return false;
  const enrolled = await LocalAuthentication.isEnrolledAsync();
  return enrolled;
}

export async function getBiometricType() {
  const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
  const hasFinger = types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT);
  const hasFace = types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION);
  const hasIris = types.includes(LocalAuthentication.AuthenticationType.IRIS);

  // Fingerprint priority (most Android phones), Face ID only for iPhone-style
  if (hasFinger) return "fingerprint";
  if (hasFace) return "face";
  if (hasIris) return "iris";
  return null;
}

export async function authenticateBiometric() {
  const result = await LocalAuthentication.authenticateAsync({
    promptMessage: "Unlock LifeStack",
    cancelLabel: "Use PIN",
    disableDeviceFallback: true,
  });
  return result.success;
}

// ── Lock Settings (AsyncStorage - non-sensitive) ──

export async function getLockSettings() {
  const [enabled, type] = await Promise.all([
    AsyncStorage.getItem(LOCK_ENABLED_KEY),
    AsyncStorage.getItem(LOCK_TYPE_KEY),
  ]);
  return {
    enabled: enabled === "true",
    type: type || "pin",
  };
}

export async function saveLockSettings({ enabled, type }) {
  await Promise.all([
    AsyncStorage.setItem(LOCK_ENABLED_KEY, String(enabled)),
    AsyncStorage.setItem(LOCK_TYPE_KEY, type || "pin"),
  ]);
}

export async function clearLockSettings() {
  await Promise.all([
    AsyncStorage.removeItem(LOCK_ENABLED_KEY),
    AsyncStorage.removeItem(LOCK_TYPE_KEY),
    removePin(),
  ]);
}
