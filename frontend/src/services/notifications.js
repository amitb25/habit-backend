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

// ─── Notification Channels (Android) ───────────────────────────
const CHANNELS = {
  water: { id: "water-reminder", name: "Water Reminders", color: "#1e90ff" },
  sleep: { id: "sleep-reminder", name: "Sleep Reminders", color: "#9370db" },
  habit: { id: "habit-reminder", name: "Habit Reminders", color: "#e05555" },
  dailyTask: { id: "daily-task-reminder", name: "Daily Task Reminders", color: "#4078e0" },
};

// ─── Permissions ───────────────────────────────────────────────
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

    // Create Android notification channels
    if (Platform.OS === "android") {
      for (const ch of Object.values(CHANNELS)) {
        await Notifications.setNotificationChannelAsync(ch.id, {
          name: ch.name,
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: ch.color,
        });
      }
      // Legacy channel
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

// ─── Cancel Helpers ────────────────────────────────────────────
export async function cancelAllReminders() {
  if (!Notifications) return;
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (e) {
    console.log("Cancel notifications error:", e.message);
  }
}

async function cancelByIdentifierPrefix(prefix) {
  if (!Notifications) return;
  try {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    for (const notif of scheduled) {
      if (notif.identifier?.startsWith(prefix)) {
        await Notifications.cancelScheduledNotificationAsync(notif.identifier);
      }
    }
  } catch (e) {
    console.log("Cancel by prefix error:", e.message);
  }
}

// ─── Water Reminders ───────────────────────────────────────────
// Schedules reminders every N hours between 9 AM and 9 PM
export async function scheduleWaterReminders(intervalHrs = 2) {
  if (!Notifications) return;
  try {
    await cancelByIdentifierPrefix("water-");

    const startHour = 9;
    const endHour = 21;
    let idx = 0;

    for (let h = startHour; h <= endHour; h += intervalHrs) {
      await Notifications.scheduleNotificationAsync({
        identifier: `water-${idx}`,
        content: {
          title: "Hydration Time",
          body: "Time to drink a glass of water!",
          sound: true,
          ...(Platform.OS === "android" && { channelId: CHANNELS.water.id }),
        },
        trigger: {
          type: "daily",
          hour: h,
          minute: 0,
          repeats: true,
        },
      });
      idx++;
    }
  } catch (e) {
    console.log("Water reminder error:", e.message);
  }
}

// ─── Sleep Bedtime Reminder ────────────────────────────────────
export async function scheduleSleepReminder(bedtimeStr = "22:00") {
  if (!Notifications) return;
  try {
    await cancelByIdentifierPrefix("sleep-");

    const [h, m] = bedtimeStr.split(":").map(Number);
    // Remind 30 minutes before bedtime
    let reminderH = h;
    let reminderM = (m || 0) - 30;
    if (reminderM < 0) {
      reminderM += 60;
      reminderH -= 1;
      if (reminderH < 0) reminderH = 23;
    }

    await Notifications.scheduleNotificationAsync({
      identifier: "sleep-bedtime",
      content: {
        title: "Bedtime Soon",
        body: `Your bedtime is in 30 minutes. Start winding down!`,
        sound: true,
        ...(Platform.OS === "android" && { channelId: CHANNELS.sleep.id }),
      },
      trigger: {
        type: "daily",
        hour: reminderH,
        minute: reminderM,
        repeats: true,
      },
    });
  } catch (e) {
    console.log("Sleep reminder error:", e.message);
  }
}

// ─── Habit Reminder ────────────────────────────────────────────
export async function scheduleHabitReminder(timeStr = "08:00") {
  if (!Notifications) return;
  try {
    await cancelByIdentifierPrefix("habit-");

    const [h, m] = timeStr.split(":").map(Number);

    await Notifications.scheduleNotificationAsync({
      identifier: "habit-daily",
      content: {
        title: "Time to Hustle!",
        body: "Don't break your streak! Complete your habits today.",
        sound: true,
        ...(Platform.OS === "android" && { channelId: CHANNELS.habit.id }),
      },
      trigger: {
        type: "daily",
        hour: h,
        minute: m || 0,
        repeats: true,
      },
    });
  } catch (e) {
    console.log("Habit reminder error:", e.message);
  }
}

// ─── Daily Task Reminder ───────────────────────────────────────
export async function scheduleDailyTaskReminder(timeStr = "09:00") {
  if (!Notifications) return;
  try {
    await cancelByIdentifierPrefix("dailytask-");

    const [h, m] = timeStr.split(":").map(Number);

    await Notifications.scheduleNotificationAsync({
      identifier: "dailytask-daily",
      content: {
        title: "Daily Tasks Waiting",
        body: "Check your daily task sheet and stay productive!",
        sound: true,
        ...(Platform.OS === "android" && { channelId: CHANNELS.dailyTask.id }),
      },
      trigger: {
        type: "daily",
        hour: h,
        minute: m || 0,
        repeats: true,
      },
    });
  } catch (e) {
    console.log("Daily task reminder error:", e.message);
  }
}

// ─── Legacy: Schedule Daily Reminder ───────────────────────────
export async function scheduleDailyReminder(hour, minute) {
  if (!Notifications) return;
  try {
    await scheduleHabitReminder(`${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`);
  } catch (e) {
    console.log("Schedule notification error:", e.message);
  }
}

// ─── Reschedule All Based on Preferences ───────────────────────
export async function rescheduleAll(prefs) {
  if (!Notifications) return;

  try {
    await cancelAllReminders();

    if (prefs.water_enabled) {
      await scheduleWaterReminders(prefs.water_interval_hrs || 2);
    }
    if (prefs.sleep_enabled) {
      await scheduleSleepReminder(prefs.sleep_bedtime || "22:00");
    }
    if (prefs.habit_enabled) {
      await scheduleHabitReminder(prefs.habit_time || "08:00");
    }
    if (prefs.daily_task_enabled) {
      await scheduleDailyTaskReminder(prefs.daily_task_time || "09:00");
    }
  } catch (e) {
    console.log("Reschedule all error:", e.message);
  }
}
