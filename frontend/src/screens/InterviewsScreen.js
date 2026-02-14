import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  Animated,
  RefreshControl,
} from "react-native";
import { useGlobal } from "../context/GlobalContext";
import { useTheme } from "../context/ThemeContext";
import useShake from "../hooks/useShake";
import { formatDate } from "../utils/helpers";

const statusFlow = [
  { key: "applied", label: "Applied", color: "#4078e0", icon: "\u{1F4E9}" },
  { key: "phone_screen", label: "Phone Screen", color: "#c09460", icon: "\u{1F4DE}" },
  { key: "technical", label: "Technical", color: "#c09460", icon: "\u{1F4BB}" },
  { key: "hr_round", label: "HR Round", color: "#4078e0", icon: "\u{1F91D}" },
  { key: "offer", label: "Offer", color: "#1eac50", icon: "\u{1F389}" },
  { key: "rejected", label: "Rejected", color: "#e05555", icon: "\u{274C}" },
  { key: "ghosted", label: "Ghosted", color: "#6b7280", icon: "\u{1F47B}" },
];

const getStatusInfo = (status) => statusFlow.find((s) => s.key === status) || statusFlow[0];

const InterviewsScreen = () => {
  const { colors } = useTheme();
  const {
    user,
    interviews,
    interviewSummary,
    loadInterviews,
    addInterview,
    editInterview,
    removeInterview,
  } = useGlobal();

  const [refreshing, setRefreshing] = useState(false);
  const [addModal, setAddModal] = useState(false);
  const [statusModal, setStatusModal] = useState(null);
  const [filter, setFilter] = useState("all");

  // Form
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [salary, setSalary] = useState("");
  const [notes, setNotes] = useState("");
  const [companyError, setCompanyError] = useState("");
  const [roleError, setRoleError] = useState("");
  const { shakeAnim: companyShake, triggerShake: shakeCompany } = useShake();
  const { shakeAnim: roleShake, triggerShake: shakeRole } = useShake();

  useEffect(() => {
    loadInterviews(user.id);
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadInterviews(user.id);
    setRefreshing(false);
  };

  const handleAdd = async () => {
    let hasError = false;
    setCompanyError(""); setRoleError("");
    if (!company.trim()) {
      setCompanyError("Company is required");
      shakeCompany();
      hasError = true;
    }
    if (!role.trim()) {
      setRoleError("Role is required");
      shakeRole();
      hasError = true;
    }
    if (hasError) return;
    await addInterview({
      profile_id: user.id,
      company: company.trim(),
      role: role.trim(),
      salary: salary.trim() || null,
      notes: notes.trim() || null,
    });
    setCompany("");
    setRole("");
    setSalary("");
    setNotes("");
    setAddModal(false);
    loadInterviews(user.id);
  };

  const handleStatusChange = async (id, newStatus) => {
    await editInterview(id, { status: newStatus });
    setStatusModal(null);
    loadInterviews(user.id);
  };

  const handleDelete = (id, name) => {
    Alert.alert("Delete", `Remove "${name}" application?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => removeInterview(id) },
    ]);
  };

  const filteredInterviews =
    filter === "all"
      ? interviews
      : filter === "active"
      ? interviews.filter((i) => ["applied", "phone_screen", "technical", "hr_round"].includes(i.status))
      : interviews.filter((i) => i.status === filter);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#4078e0" />}
      >
        {/* Summary cards */}
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 22 }}>
          {[
            { label: "Total", value: interviewSummary.total, color: "#4078e0", icon: "\u{1F4BC}" },
            { label: "In Progress", value: interviewSummary.in_progress, color: "#c09460", icon: "\u{23F3}" },
            { label: "Offers", value: interviewSummary.offers, color: "#1eac50", icon: "\u{1F389}" },
            { label: "Rejected", value: interviewSummary.rejected, color: "#e05555", icon: "\u{274C}" },
          ].map((s) => (
            <View
              key={s.label}
              style={{
                backgroundColor: colors.glassCard,
                borderRadius: 14,
                padding: 16,
                width: "47%",
                alignItems: "center",
                borderWidth: 1,
                borderColor: colors.glassBorder,
              }}
            >
              <View
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 12,
                  backgroundColor: `${s.color}12`,
                  justifyContent: "center",
                  alignItems: "center",
                  marginBottom: 8,
                }}
              >
                <Text style={{ fontSize: 18 }}>{s.icon}</Text>
              </View>
              <Text style={{ color: s.color, fontSize: 26, fontWeight: "800" }}>{s.value}</Text>
              <Text style={{ color: colors.textTertiary, fontSize: 11, marginTop: 3 }}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 18 }}>
          {[
            { key: "all", label: "All" },
            { key: "active", label: "Active" },
            ...statusFlow,
          ].map((f) => (
            <TouchableOpacity
              key={f.key}
              onPress={() => setFilter(f.key)}
              style={{
                backgroundColor: filter === f.key ? "#4078e0" : colors.glassChip,
                paddingHorizontal: 16,
                paddingVertical: 9,
                borderRadius: 22,
                marginRight: 8,
                borderWidth: filter === f.key ? 0 : 1,
                borderColor: filter === f.key ? "transparent" : colors.glassChipBorder,
              }}
            >
              <Text style={{ color: filter === f.key ? "#ffffff" : colors.textSecondary, fontSize: 12, fontWeight: "600" }}>
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Interview cards */}
        {filteredInterviews.length === 0 ? (
          <View style={{ alignItems: "center", paddingVertical: 48 }}>
            <Text style={{ fontSize: 44 }}>{"\u{1F4BC}"}</Text>
            <Text style={{ color: colors.textTertiary, marginTop: 12 }}>No applications yet</Text>
          </View>
        ) : (
          filteredInterviews.map((item) => {
            const info = getStatusInfo(item.status);
            return (
              <View
                key={item.id}
                style={{
                  backgroundColor: colors.glassCardAlt,
                  borderRadius: 16,
                  padding: 18,
                  marginBottom: 12,
                  borderLeftWidth: 3,
                  borderLeftColor: info.color,
                  borderWidth: 1,
                  borderColor: colors.glassBorderLight,
                }}
              >
                {/* Header */}
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: colors.textPrimary, fontSize: 16, fontWeight: "700" }}>{item.company}</Text>
                    <Text style={{ color: colors.textSecondary, fontSize: 13, marginTop: 2 }}>{item.role}</Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => setStatusModal(item)}
                    style={{
                      backgroundColor: `${info.color}15`,
                      borderRadius: 12,
                      paddingHorizontal: 14,
                      paddingVertical: 7,
                      flexDirection: "row",
                      alignItems: "center",
                      borderWidth: 1,
                      borderColor: `${info.color}20`,
                    }}
                  >
                    <Text style={{ fontSize: 14 }}>{info.icon} </Text>
                    <Text style={{ color: info.color, fontSize: 12, fontWeight: "600" }}>{info.label}</Text>
                  </TouchableOpacity>
                </View>

                {/* Details */}
                <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 14 }}>
                  {item.salary && (
                    <Text style={{ color: "#4078e0", fontSize: 12 }}>{"\u{1F4B0}"} {item.salary}</Text>
                  )}
                  <Text style={{ color: colors.textTertiary, fontSize: 12 }}>{formatDate(item.applied_date)}</Text>
                </View>

                {item.notes && (
                  <Text style={{ color: colors.textTertiary, fontSize: 12, marginTop: 10, fontStyle: "italic" }}>
                    {item.notes}
                  </Text>
                )}

                {/* Delete */}
                <TouchableOpacity
                  onPress={() => handleDelete(item.id, item.company)}
                  style={{ alignSelf: "flex-end", marginTop: 10, padding: 4 }}
                >
                  <Text style={{ color: "#e0555550", fontSize: 12 }}>Delete</Text>
                </TouchableOpacity>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Floating Add Button */}
      <TouchableOpacity
        onPress={() => setAddModal(true)}
        style={{
          position: "absolute",
          bottom: 20,
          right: 20,
          backgroundColor: "#c09460",
          width: 58,
          height: 58,
          borderRadius: 18,
          justifyContent: "center",
          alignItems: "center",
          elevation: 8,
          shadowColor: "#c09460",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
        }}
      >
        <Text style={{ color: "#ffffff", fontSize: 28, fontWeight: "300", marginTop: -2 }}>+</Text>
      </TouchableOpacity>

      {/* Add Interview Modal */}
      <Modal visible={addModal} animationType="slide" transparent>
        <View style={{ flex: 1, justifyContent: "flex-end", backgroundColor: colors.modalOverlay }}>
          <View
            style={{
              backgroundColor: colors.glassCardAlt,
              borderTopLeftRadius: 28,
              borderTopRightRadius: 28,
              padding: 28,
              borderWidth: 1,
              borderColor: colors.glassBorder,
              borderBottomWidth: 0,
            }}
          >
            {/* Handle bar */}
            <View style={{ alignItems: "center", marginBottom: 20 }}>
              <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: colors.borderHandle }} />
            </View>

            <Text style={{ color: colors.textPrimary, fontSize: 22, fontWeight: "700", marginBottom: 24 }}>
              New Application
            </Text>
            <Animated.View style={{ transform: [{ translateX: companyShake }], marginBottom: 12 }}>
              <TextInput
                value={company}
                onChangeText={(t) => { setCompany(t); setCompanyError(""); }}
                placeholder="Company (e.g. Google, TCS)"
                placeholderTextColor={colors.textTertiary}
                style={{
                  backgroundColor: colors.glassCard,
                  color: colors.textPrimary,
                  borderRadius: 14,
                  padding: 16,
                  fontSize: 15,
                  borderWidth: 1,
                  borderColor: companyError ? colors.accentRed : colors.glassBorder,
                }}
              />
              {companyError ? <Text style={{ color: colors.accentRed, fontSize: 12, marginTop: 4, marginLeft: 4 }}>{companyError}</Text> : null}
            </Animated.View>
            <Animated.View style={{ transform: [{ translateX: roleShake }], marginBottom: 12 }}>
              <TextInput
                value={role}
                onChangeText={(t) => { setRole(t); setRoleError(""); }}
                placeholder="Role (e.g. SDE-1, Frontend Dev)"
                placeholderTextColor={colors.textTertiary}
                style={{
                  backgroundColor: colors.glassCard,
                  color: colors.textPrimary,
                  borderRadius: 14,
                  padding: 16,
                  fontSize: 15,
                  borderWidth: 1,
                  borderColor: roleError ? colors.accentRed : colors.glassBorder,
                }}
              />
              {roleError ? <Text style={{ color: colors.accentRed, fontSize: 12, marginTop: 4, marginLeft: 4 }}>{roleError}</Text> : null}
            </Animated.View>
            {[
              { val: salary, set: setSalary, placeholder: "Salary/CTC (optional)", kb: "default" },
              { val: notes, set: setNotes, placeholder: "Notes (optional)", kb: "default" },
            ].map((field, i) => (
              <TextInput
                key={i}
                value={field.val}
                onChangeText={field.set}
                placeholder={field.placeholder}
                placeholderTextColor={colors.textTertiary}
                keyboardType={field.kb}
                style={{
                  backgroundColor: colors.glassCard,
                  color: colors.textPrimary,
                  borderRadius: 14,
                  padding: 16,
                  fontSize: 15,
                  marginBottom: 12,
                  borderWidth: 1,
                  borderColor: colors.glassBorder,
                }}
              />
            ))}
            <View style={{ flexDirection: "row", gap: 12, marginTop: 8 }}>
              <TouchableOpacity
                onPress={() => setAddModal(false)}
                style={{
                  flex: 1,
                  padding: 16,
                  borderRadius: 14,
                  backgroundColor: colors.glassCard,
                  alignItems: "center",
                  borderWidth: 1,
                  borderColor: colors.glassBorder,
                }}
              >
                <Text style={{ color: colors.textSecondary, fontWeight: "600" }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleAdd}
                style={{ flex: 1, padding: 16, borderRadius: 14, backgroundColor: "#c09460", alignItems: "center" }}
              >
                <Text style={{ color: "#ffffff", fontWeight: "600" }}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Status Change Modal */}
      <Modal visible={!!statusModal} animationType="slide" transparent>
        <View style={{ flex: 1, justifyContent: "flex-end", backgroundColor: colors.modalOverlay }}>
          <View
            style={{
              backgroundColor: colors.glassCardAlt,
              borderTopLeftRadius: 28,
              borderTopRightRadius: 28,
              padding: 28,
              borderWidth: 1,
              borderColor: colors.glassBorder,
              borderBottomWidth: 0,
            }}
          >
            {/* Handle bar */}
            <View style={{ alignItems: "center", marginBottom: 20 }}>
              <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: colors.borderHandle }} />
            </View>

            <Text style={{ color: colors.textPrimary, fontSize: 18, fontWeight: "700", marginBottom: 18 }}>
              Update Status — {statusModal?.company}
            </Text>
            {statusFlow.map((s) => (
              <TouchableOpacity
                key={s.key}
                onPress={() => handleStatusChange(statusModal.id, s.key)}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  padding: 16,
                  borderRadius: 14,
                  marginBottom: 8,
                  backgroundColor: statusModal?.status === s.key ? `${s.color}15` : colors.glassCard,
                  borderWidth: 1,
                  borderColor: statusModal?.status === s.key ? `${s.color}30` : colors.glassBorder,
                }}
              >
                <Text style={{ fontSize: 20, marginRight: 14 }}>{s.icon}</Text>
                <Text style={{ color: s.color, fontSize: 15, fontWeight: "600" }}>{s.label}</Text>
                {statusModal?.status === s.key && (
                  <Text style={{ color: s.color, marginLeft: "auto", fontSize: 16 }}>{"\u2713"}</Text>
                )}
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              onPress={() => setStatusModal(null)}
              style={{
                padding: 16,
                borderRadius: 14,
                backgroundColor: colors.glassCard,
                alignItems: "center",
                marginTop: 8,
                borderWidth: 1,
                borderColor: colors.glassBorder,
              }}
            >
              <Text style={{ color: colors.textSecondary, fontWeight: "600" }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default InterviewsScreen;
