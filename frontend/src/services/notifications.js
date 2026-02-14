import { Platform } from "react-native";
import Constants from "expo-constants";

// Check if running in Expo Go (notifications not supported in Expo Go since SDK 53)
const isExpoGo = Constants.appOwnership === "expo";

let Notifications = null;

// Only load expo-notifications in dev builds / production, not Expo Go
if (!isExpoGo) {
  try {
    Notifications = require("expo-notifications");
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });
  } catch (e) {
    console.log("expo-notifications not available");
  }
}

export async function requestNotificationPermissions() {
  if (!Notifications) return false;

  try {
    const { status: existing } = await Notifications.getPermissionsAsync();
    let finalStatus = existing;

    if (existing !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") return false;

    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("daily-reminder", {
        name: "Daily Reminder",
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#4078e0",
      });
    }

    return true;
  } catch (e) {
    console.log("Notification permissions error:", e.message);
    return false;
  }
}

export async function scheduleDailyReminder(hour, minute) {
  if (!Notifications) return;

  try {
    await cancelAllReminders();

    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Time to Hustle!",
        body: "Don't break your streak! Complete your habits today.",
        sound: true,
        ...(Platform.OS === "android" && { channelId: "daily-reminder" }),
      },
      trigger: {
        type: "daily",
        hour,
        minute,
        repeats: true,
      },
    });
  } catch (e) {
    console.log("Schedule notification error:", e.message);
  }
}

export async function cancelAllReminders() {
  if (!Notifications) return;

  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (e) {
    console.log("Cancel notifications error:", e.message);
  }
}
