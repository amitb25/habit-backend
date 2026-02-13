import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const ManifestationBox = ({ manifestation, onSave }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(manifestation || "");

  const handleSave = () => {
    onSave(text);
    setIsEditing(false);
  };

  return (
    <View
      style={{
        backgroundColor: "#16161f",
        borderRadius: 20,
        padding: 20,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: "#ffffff0a",
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <Ionicons name="sparkles" size={16} color="#a78bfa" />
        <Text style={{ color: "#a78bfa", fontSize: 13, fontWeight: "600" }}>
          Daily Manifestation
        </Text>
      </View>

      {isEditing ? (
        <View>
          <TextInput
            value={text}
            onChangeText={setText}
            multiline
            style={{
              color: "#ffffff",
              fontSize: 15,
              fontStyle: "italic",
              backgroundColor: "#0d0d14",
              borderRadius: 14,
              padding: 14,
              minHeight: 80,
              textAlignVertical: "top",
              borderWidth: 1,
              borderColor: "#ffffff08",
            }}
            placeholderTextColor="#6b7280"
            placeholder="Write your affirmation..."
          />
          <View style={{ flexDirection: "row", justifyContent: "flex-end", marginTop: 12, gap: 10 }}>
            <TouchableOpacity
              onPress={() => { setText(manifestation || ""); setIsEditing(false); }}
              style={{
                paddingHorizontal: 18,
                paddingVertical: 10,
                borderRadius: 12,
                backgroundColor: "#0d0d14",
                borderWidth: 1,
                borderColor: "#ffffff08",
              }}
            >
              <Text style={{ color: "#9ca3af" }}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSave}
              style={{
                paddingHorizontal: 18,
                paddingVertical: 10,
                borderRadius: 12,
                backgroundColor: "#a78bfa",
              }}
            >
              <Text style={{ color: "#0a0a0f", fontWeight: "600" }}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <TouchableOpacity onPress={() => setIsEditing(true)}>
          <Text style={{ color: "#e5e7eb", fontSize: 15, fontStyle: "italic", lineHeight: 22 }}>
            "{manifestation || 'Tap to set your daily affirmation...'}"
          </Text>
          <Text style={{ color: "#6b7280", fontSize: 11, marginTop: 6 }}>
            Tap to edit
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default ManifestationBox;
