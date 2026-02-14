// Format currency in INR
export const formatINR = (amount) => {
  const num = Number(amount);
  if (isNaN(num)) return "0";
  return num.toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
};

// Calculate percentage
export const getPercentage = (paid, total) => {
  if (!total || total === 0) return 0;
  return Math.min(100, Math.round((paid / total) * 100));
};

// Category display labels
export const categoryLabels = {
  dsa: "DSA Practice",
  react_native: "React Native",
  job_application: "Job Applications",
  english: "English Practice",
  other: "Other",
};

// Category colors
export const categoryColors = {
  dsa: "#4078e0",
  react_native: "#c09460",
  job_application: "#c09460",
  english: "#4078e0",
  other: "#e05555",
};

// Get greeting based on time
export const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 17) return "Good Afternoon";
  return "Good Evening";
};

// Format date to readable format
export const formatDate = (dateStr) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

// ─── Daily Tasks ─────────────────────────────

// Task category labels
export const taskCategoryLabels = {
  dsa: "DSA",
  react_native: "React Native",
  job_hunt: "Job Hunt",
  personal: "Personal",
  health: "Health",
  other: "Other",
};

// Task category colors
export const taskCategoryColors = {
  dsa: "#4078e0",
  react_native: "#c09460",
  job_hunt: "#d88c0a",
  personal: "#2bb883",
  health: "#e05555",
  other: "#6b7280",
};

// Priority config (label, color, icon)
export const priorityConfig = {
  high: { label: "High", color: "#d43c3c", bg: "#d43c3c18" },
  medium: { label: "Med", color: "#d88c0a", bg: "#d88c0a18" },
  low: { label: "Low", color: "#1eac50", bg: "#1eac5018" },
};

// Format task time: "09:00" -> "9:00 AM", "14:30" -> "2:30 PM"
export const formatTaskTime = (time) => {
  if (!time) return "";
  const [h, m] = time.split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 || 12;
  return `${hour12}:${m.toString().padStart(2, "0")} ${suffix}`;
};

// Convert Date object to YYYY-MM-DD string
export const toDateString = (date) => {
  const d = date instanceof Date ? date : new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// Format date header: "Today", "Yesterday", "Tomorrow", or "Sat, 15 Feb"
export const formatDateHeader = (dateStr) => {
  const today = toDateString(new Date());
  const yesterday = toDateString(new Date(Date.now() - 86400000));
  const tomorrow = toDateString(new Date(Date.now() + 86400000));

  if (dateStr === today) return "Today";
  if (dateStr === yesterday) return "Yesterday";
  if (dateStr === tomorrow) return "Tomorrow";

  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
};
