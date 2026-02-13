import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  RefreshControl,
} from "react-native";
import { useGlobal } from "../context/GlobalContext";
import { formatDate } from "../utils/helpers";

const statusFlow = [
  { key: "applied", label: "Applied", color: "#4f8cff", icon: "\u{1F4E9}" },
  { key: "phone_screen", label: "Phone Screen", color: "#a78bfa", icon: "\u{1F4DE}" },
  { key: "technical", label: "Technical", color: "#a78bfa", icon: "\u{1F4BB}" },
  { key: "hr_round", label: "HR Round", color: "#4f8cff", icon: "\u{1F91D}" },
  { key: "offer", label: "Offer", color: "#22c55e", icon: "\u{1F389}" },
  { key: "rejected", label: "Rejected", color: "#f87171", icon: "\u{274C}" },
  { key: "ghosted", label: "Ghosted", color: "#6b7280", icon: "\u{1F47B}" },
];

const getStatusInfo = (status) => statusFlow.find((s) => s.key === status) || statusFlow[0];

const InterviewsScreen = () => {
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

  useEffect(() => {
    loadInterviews(user.id);
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadInterviews(user.id);
    setRefreshing(false);
  };

  const handleAdd = async () => {
    if (!company.trim() || !role.trim()) {
      Alert.alert("Error", "Company and role are required");
      return;
    }
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
    <View style={{ flex: 1, backgroundColor: "#0a0a0f" }}>
      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#4f8cff" />}
      >
        {/* Summary cards */}
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 22 }}>
          {[
            { label: "Total", value: interviewSummary.total, color: "#4f8cff", icon: "\u{1F4BC}" },
            { label: "In Progress", value: interviewSummary.in_progress, color: "#a78bfa", icon: "\u{23F3}" },
            { label: "Offers", value: interviewSummary.offers, color: "#22c55e", icon: "\u{1F389}" },
            { label: "Rejected", value: interviewSummary.rejected, color: "#f87171", icon: "\u{274C}" },
          ].map((s) => (
            <View
              key={s.label}
              style={{
                backgroundColor: "#1a1a2e",
                borderRadius: 14,
                padding: 16,
                width: "47%",
                alignItems: "center",
                borderWidth: 1,
                borderColor: "#ffffff08",
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
              <Text style={{ color: "#6b7280", fontSize: 11, marginTop: 3 }}>{s.label}</Text>
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
                backgroundColor: filter === f.key ? "#4f8cff" : "#1a1a2e",
                paddingHorizontal: 16,
                paddingVertical: 9,
                borderRadius: 22,
                marginRight: 8,
                borderWidth: filter === f.key ? 0 : 1,
                borderColor: "#ffffff08",
              }}
            >
              <Text style={{ color: filter === f.key ? "#ffffff" : "#9ca3af", fontSize: 12, fontWeight: "600" }}>
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Interview cards */}
        {filteredInterviews.length === 0 ? (
          <View style={{ alignItems: "center", paddingVertical: 48 }}>
            <Text style={{ fontSize: 44 }}>{"\u{1F4BC}"}</Text>
            <Text style={{ color: "#6b7280", marginTop: 12 }}>No applications yet</Text>
          </View>
        ) : (
          filteredInterviews.map((item) => {
            const info = getStatusInfo(item.status);
            return (
              <View
                key={item.id}
                style={{
                  backgroundColor: "#12121a",
                  borderRadius: 16,
                  padding: 18,
                  marginBottom: 12,
                  borderLeftWidth: 3,
                  borderLeftColor: info.color,
                  borderWidth: 1,
                  borderColor: "#ffffff06",
                }}
              >
                {/* Header */}
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: "#ffffff", fontSize: 16, fontWeight: "700" }}>{item.company}</Text>
                    <Text style={{ color: "#9ca3af", fontSize: 13, marginTop: 2 }}>{item.role}</Text>
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
                    <Text style={{ color: "#4f8cff", fontSize: 12 }}>{"\u{1F4B0}"} {item.salary}</Text>
                  )}
                  <Text style={{ color: "#6b7280", fontSize: 12 }}>{formatDate(item.applied_date)}</Text>
                </View>

                {item.notes && (
                  <Text style={{ color: "#6b7280", fontSize: 12, marginTop: 10, fontStyle: "italic" }}>
                    {item.notes}
                  </Text>
                )}

                {/* Delete */}
                <TouchableOpacity
                  onPress={() => handleDelete(item.id, item.company)}
                  style={{ alignSelf: "flex-end", marginTop: 10, padding: 4 }}
                >
                  <Text style={{ color: "#f8717150", fontSize: 12 }}>Delete</Text>
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
          backgroundColor: "#a78bfa",
          width: 58,
          height: 58,
          borderRadius: 18,
          justifyContent: "center",
          alignItems: "center",
          elevation: 8,
          shadowColor: "#a78bfa",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
        }}
      >
        <Text style={{ color: "#ffffff", fontSize: 28, fontWeight: "300", marginTop: -2 }}>+</Text>
      </TouchableOpacity>

      {/* Add Interview Modal */}
      <Modal visible={addModal} animationType="slide" transparent>
        <View style={{ flex: 1, justifyContent: "flex-end", backgroundColor: "#00000080" }}>
          <View
            style={{
              backgroundColor: "#12121a",
              borderTopLeftRadius: 28,
              borderTopRightRadius: 28,
              padding: 28,
              borderWidth: 1,
              borderColor: "#ffffff08",
              borderBottomWidth: 0,
            }}
          >
            {/* Handle bar */}
            <View style={{ alignItems: "center", marginBottom: 20 }}>
              <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: "#ffffff15" }} />
            </View>

            <Text style={{ color: "#ffffff", fontSize: 22, fontWeight: "700", marginBottom: 24 }}>
              New Application
            </Text>
            {[
              { val: company, set: setCompany, placeholder: "Company (e.g. Google, TCS)", kb: "default" },
              { val: role, set: setRole, placeholder: "Role (e.g. SDE-1, Frontend Dev)", kb: "default" },
              { val: salary, set: setSalary, placeholder: "Salary/CTC (optional)", kb: "default" },
              { val: notes, set: setNotes, placeholder: "Notes (optional)", kb: "default" },
            ].map((field, i) => (
              <TextInput
                key={i}
                value={field.val}
                onChangeText={field.set}
                placeholder={field.placeholder}
                placeholderTextColor="#6b7280"
                keyboardType={field.kb}
                style={{
                  backgroundColor: "#1a1a2e",
                  color: "#ffffff",
                  borderRadius: 14,
                  padding: 16,
                  fontSize: 15,
                  marginBottom: 12,
                  borderWidth: 1,
                  borderColor: "#ffffff08",
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
                  backgroundColor: "#1a1a2e",
                  alignItems: "center",
                  borderWidth: 1,
                  borderColor: "#ffffff08",
                }}
              >
                <Text style={{ color: "#9ca3af", fontWeight: "600" }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleAdd}
                style={{ flex: 1, padding: 16, borderRadius: 14, backgroundColor: "#a78bfa", alignItems: "center" }}
              >
                <Text style={{ color: "#ffffff", fontWeight: "600" }}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Status Change Modal */}
      <Modal visible={!!statusModal} animationType="slide" transparent>
        <View style={{ flex: 1, justifyContent: "flex-end", backgroundColor: "#00000080" }}>
          <View
            style={{
              backgroundColor: "#12121a",
              borderTopLeftRadius: 28,
              borderTopRightRadius: 28,
              padding: 28,
              borderWidth: 1,
              borderColor: "#ffffff08",
              borderBottomWidth: 0,
            }}
          >
            {/* Handle bar */}
            <View style={{ alignItems: "center", marginBottom: 20 }}>
              <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: "#ffffff15" }} />
            </View>

            <Text style={{ color: "#ffffff", fontSize: 18, fontWeight: "700", marginBottom: 18 }}>
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
                  backgroundColor: statusModal?.status === s.key ? `${s.color}15` : "#1a1a2e",
                  borderWidth: 1,
                  borderColor: statusModal?.status === s.key ? `${s.color}30` : "#ffffff08",
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
                backgroundColor: "#1a1a2e",
                alignItems: "center",
                marginTop: 8,
                borderWidth: 1,
                borderColor: "#ffffff08",
              }}
            >
              <Text style={{ color: "#9ca3af", fontWeight: "600" }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default InterviewsScreen;
