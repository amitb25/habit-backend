import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  ScrollView,
  FlatList,
  Alert,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { useTheme } from "../context/ThemeContext";
import { useGlobal } from "../context/GlobalContext";
import useShake from "../hooks/useShake";
import {
  affirmationCategories,
  getRandomAffirmation,
  getAffirmationsByCategory,
} from "../data/affirmations";

const ManifestationBox = ({ manifestation, onSave }) => {
  const { colors, isDark, glassShadow } = useTheme();
  const {
    user,
    customAffirmations,
    loadCustomAffirmations,
    addCustomAffirmation,
    removeCustomAffirmation,
  } = useGlobal();

  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(manifestation || "");
  const [libraryModal, setLibraryModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [addCustomModal, setAddCustomModal] = useState(false);
  const [customText, setCustomText] = useState("");
  const [customCategory, setCustomCategory] = useState("personal");
  const [viewMode, setViewMode] = useState("prebuilt"); // "prebuilt" | "my"
  const [customError, setCustomError] = useState("");
  const { shakeAnim: customShake, triggerShake: shakeCustomField } = useShake();

  useEffect(() => {
    if (user?.id) loadCustomAffirmations(user.id);
  }, [user?.id]);

  const handleSave = () => {
    onSave(text);
    setIsEditing(false);
  };

  const handlePickAffirmation = (affText) => {
    onSave(affText);
    setText(affText);
    setLibraryModal(false);
  };

  const handleShuffle = () => {
    const random = getRandomAffirmation(selectedCategory);
    onSave(random.text);
    setText(random.text);
  };

  const handleAddCustom = async () => {
    setCustomError("");
    if (!customText.trim()) {
      setCustomError("Write your affirmation first");
      shakeCustomField();
      return;
    }
    await addCustomAffirmation({
      profile_id: user.id,
      text: customText.trim(),
      category: customCategory,
    });
    setCustomText("");
    setAddCustomModal(false);
  };

  const handleDeleteCustom = (id, preview) => {
    Alert.alert("Delete", `Remove "${preview.slice(0, 40)}..."?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => removeCustomAffirmation(id) },
    ]);
  };

  const prebuiltList = useMemo(
    () => getAffirmationsByCategory(selectedCategory),
    [selectedCategory]
  );
  const filteredCustom = useMemo(
    () =>
      selectedCategory === "all"
        ? customAffirmations
        : customAffirmations.filter((a) => a.category === selectedCategory),
    [selectedCategory, customAffirmations]
  );

  // Category options for custom affirmation (exclude "all")
  const customCategoryOptions = Object.entries(affirmationCategories).filter(
    ([key]) => key !== "all"
  );
  // Add "personal" if not in affirmationCategories
  if (!affirmationCategories.personal) {
    customCategoryOptions.push(["personal", { label: "Personal", icon: "person", color: "#9ca3af" }]);
  }

  return (
    <View
      style={{
        backgroundColor: colors.glassCardElevated,
        borderRadius: 20,
        padding: 20,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: colors.glassBorderMedium,
        borderTopWidth: 1,
        borderTopColor: colors.glassHighlight,
        ...glassShadow,
      }}
    >
      {/* Header */}
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Ionicons name="sparkles" size={16} color="#c09460" />
          <Text style={{ color: "#c09460", fontSize: 13, fontWeight: "600" }}>
            Daily Manifestation
          </Text>
        </View>
      </View>

      {isEditing ? (
        <View>
          <TextInput
            value={text}
            onChangeText={setText}
            multiline
            style={{
              color: colors.textPrimary,
              fontSize: 15,
              fontStyle: "italic",
              backgroundColor: colors.glassInput,
              borderRadius: 14,
              padding: 14,
              minHeight: 80,
              textAlignVertical: "top",
              borderWidth: 1,
              borderColor: colors.glassBorder,
            }}
            placeholderTextColor={colors.textTertiary}
            placeholder="Write your affirmation..."
          />
          <View style={{ flexDirection: "row", justifyContent: "flex-end", marginTop: 12, gap: 10 }}>
            <TouchableOpacity
              onPress={() => { setText(manifestation || ""); setIsEditing(false); }}
              style={{
                paddingHorizontal: 18,
                paddingVertical: 10,
                borderRadius: 12,
                backgroundColor: colors.glassInput,
                borderWidth: 1,
                borderColor: colors.glassBorder,
              }}
            >
              <Text style={{ color: colors.textSecondary }}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSave}
              style={{
                paddingHorizontal: 18,
                paddingVertical: 10,
                borderRadius: 12,
                backgroundColor: "#c09460",
              }}
            >
              <Text style={{ color: "#0a0a0f", fontWeight: "600" }}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <TouchableOpacity onPress={() => setIsEditing(true)}>
          <Text style={{ color: colors.textSubtitle, fontSize: 15, fontStyle: "italic", lineHeight: 22 }}>
            "{manifestation || 'Tap to set your daily affirmation...'}"
          </Text>
        </TouchableOpacity>
      )}

      {/* Action Buttons */}
      {!isEditing && (
        <View style={{ flexDirection: "row", gap: 8, marginTop: 14 }}>
          <TouchableOpacity
            onPress={() => setIsEditing(true)}
            activeOpacity={0.7}
            style={{
              flex: 1,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              backgroundColor: colors.glassChip,
              borderRadius: 12,
              paddingVertical: 10,
            }}
          >
            <Ionicons name="pencil" size={13} color={colors.textSecondary} />
            <Text style={{ color: colors.textSecondary, fontSize: 11, fontWeight: "600" }}>Edit</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleShuffle}
            activeOpacity={0.7}
            style={{
              flex: 1,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              backgroundColor: colors.glassChip,
              borderRadius: 12,
              paddingVertical: 10,
            }}
          >
            <Ionicons name="shuffle" size={14} color="#c09460" />
            <Text style={{ color: "#c09460", fontSize: 11, fontWeight: "600" }}>Shuffle</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setLibraryModal(true)}
            activeOpacity={0.7}
            style={{
              flex: 1,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              backgroundColor: colors.glassChip,
              borderRadius: 12,
              paddingVertical: 10,
            }}
          >
            <Ionicons name="library" size={13} color="#c09460" />
            <Text style={{ color: "#c09460", fontSize: 11, fontWeight: "600" }}>Library</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Library Modal */}
      <Modal visible={libraryModal} animationType="slide" transparent>
        <View style={{ flex: 1, justifyContent: "flex-end" }}>
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => setLibraryModal(false)}
            style={{ flex: 1 }}
          >
            <BlurView
              intensity={colors.blurIntensity}
              tint={colors.blurTint}
              style={{ flex: 1 }}
            />
          </TouchableOpacity>
          <View
            style={{
              backgroundColor: colors.glassModal,
              borderTopLeftRadius: 28,
              borderTopRightRadius: 28,
              padding: 24,
              borderWidth: 1,
              borderColor: colors.glassBorderMedium,
              borderBottomWidth: 0,
              maxHeight: "85%",
            }}
          >
            {/* Handle */}
            <View style={{ alignItems: "center", marginBottom: 16 }}>
              <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: colors.borderHandle || "#ffffff15" }} />
            </View>

            {/* Header */}
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
              <Text style={{ color: colors.textPrimary || "#ffffff", fontSize: 20, fontWeight: "700" }}>
                Affirmation Library
              </Text>
              <TouchableOpacity
                onPress={() => setAddCustomModal(true)}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 4,
                  backgroundColor: "#c09460",
                  paddingHorizontal: 14,
                  paddingVertical: 8,
                  borderRadius: 12,
                }}
              >
                <Ionicons name="add" size={16} color="#0a0a0f" />
                <Text style={{ color: "#0a0a0f", fontSize: 12, fontWeight: "700" }}>Add Mine</Text>
              </TouchableOpacity>
            </View>

            {/* View Toggle: Pre-built vs My Affirmations */}
            <View style={{ flexDirection: "row", gap: 8, marginBottom: 14 }}>
              {[
                { key: "prebuilt", label: "Pre-built", icon: "library" },
                { key: "my", label: `My (${customAffirmations.length})`, icon: "person" },
              ].map((v) => (
                <TouchableOpacity
                  key={v.key}
                  onPress={() => setViewMode(v.key)}
                  style={{
                    flex: 1,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                    padding: 10,
                    borderRadius: 12,
                    backgroundColor: viewMode === v.key ? "#c0946018" : (colors.glassChip || "#ffffff08"),
                    borderWidth: 1,
                    borderColor: viewMode === v.key ? "#c0946030" : "transparent",
                  }}
                >
                  <Ionicons name={v.icon} size={14} color={viewMode === v.key ? "#c09460" : (colors.textTertiary || "#6b7280")} />
                  <Text style={{ color: viewMode === v.key ? "#c09460" : (colors.textSecondary || "#9ca3af"), fontSize: 12, fontWeight: "600" }}>
                    {v.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Category Chips */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ marginBottom: 14 }}
              contentContainerStyle={{ gap: 6 }}
            >
              {Object.entries(affirmationCategories).map(([key, catInfo]) => {
                const isActive = selectedCategory === key;
                return (
                  <TouchableOpacity
                    key={key}
                    onPress={() => setSelectedCategory(key)}
                    activeOpacity={0.7}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 4,
                      paddingHorizontal: 10,
                      paddingVertical: 6,
                      borderRadius: 10,
                      backgroundColor: isActive ? catInfo.color + (isDark ? "20" : "30") : (colors.glassChip || "#ffffff08"),
                      borderWidth: 1,
                      borderColor: isActive ? catInfo.color + (isDark ? "35" : "50") : "transparent",
                    }}
                  >
                    <Ionicons name={catInfo.icon} size={11} color={isActive ? catInfo.color : (colors.textTertiary || "#6b7280")} />
                    <Text
                      style={{
                        color: isActive ? catInfo.color : (colors.textTertiary || "#6b7280"),
                        fontSize: 10,
                        fontWeight: isActive ? "700" : "500",
                      }}
                    >
                      {catInfo.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Affirmation List */}
            {viewMode === "prebuilt" ? (
              prebuiltList.length === 0 ? (
                <Text style={{ color: colors.textTertiary || "#6b7280", textAlign: "center", paddingVertical: 30 }}>
                  No affirmations in this category
                </Text>
              ) : (
                <FlatList
                  data={prebuiltList}
                  keyExtractor={(item, index) => `prebuilt-${selectedCategory}-${index}`}
                  initialNumToRender={8}
                  maxToRenderPerBatch={8}
                  windowSize={5}
                  removeClippedSubviews
                  showsVerticalScrollIndicator={false}
                  style={{ maxHeight: 400 }}
                  renderItem={({ item: aff }) => {
                    const catInfo = affirmationCategories[aff.category] || affirmationCategories.all;
                    return (
                      <TouchableOpacity
                        onPress={() => handlePickAffirmation(aff.text)}
                        activeOpacity={0.7}
                        style={{
                          backgroundColor: colors.glassInput,
                          borderRadius: 14,
                          padding: 16,
                          marginBottom: 8,
                          borderWidth: 1,
                          borderColor: colors.glassBorder,
                          borderLeftWidth: 3,
                          borderLeftColor: catInfo.color,
                        }}
                      >
                        <Text style={{ color: colors.textPrimary || "#ffffff", fontSize: 13, fontStyle: "italic", lineHeight: 20 }}>
                          "{aff.text}"
                        </Text>
                        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
                          <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                            <Ionicons name={catInfo.icon} size={10} color={catInfo.color} />
                            <Text style={{ color: catInfo.color, fontSize: 10, fontWeight: "600" }}>{catInfo.label}</Text>
                          </View>
                          <Text style={{ color: "#c09460", fontSize: 10, fontWeight: "600" }}>Tap to use</Text>
                        </View>
                      </TouchableOpacity>
                    );
                  }}
                />
              )
            ) : (
              filteredCustom.length === 0 ? (
                <View style={{ alignItems: "center", paddingVertical: 30 }}>
                  <Text style={{ fontSize: 32, marginBottom: 8 }}>{"\u270D\uFE0F"}</Text>
                  <Text style={{ color: colors.textTertiary || "#6b7280", fontSize: 13 }}>
                    No custom affirmations yet
                  </Text>
                  <TouchableOpacity
                    onPress={() => setAddCustomModal(true)}
                    style={{ marginTop: 12 }}
                  >
                    <Text style={{ color: "#c09460", fontWeight: "600" }}>+ Add your first</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <FlatList
                  data={filteredCustom}
                  keyExtractor={(item) => item.id}
                  initialNumToRender={8}
                  maxToRenderPerBatch={8}
                  windowSize={5}
                  removeClippedSubviews
                  showsVerticalScrollIndicator={false}
                  style={{ maxHeight: 400 }}
                  renderItem={({ item: aff }) => {
                    const catInfo = affirmationCategories[aff.category] || { label: "Personal", icon: "person", color: "#9ca3af" };
                    return (
                      <TouchableOpacity
                        onPress={() => handlePickAffirmation(aff.text)}
                        activeOpacity={0.7}
                        style={{
                          backgroundColor: colors.glassInput,
                          borderRadius: 14,
                          padding: 16,
                          marginBottom: 8,
                          borderWidth: 1,
                          borderColor: colors.glassBorder,
                          borderLeftWidth: 3,
                          borderLeftColor: "#c09460",
                        }}
                      >
                        <Text style={{ color: colors.textPrimary || "#ffffff", fontSize: 13, fontStyle: "italic", lineHeight: 20 }}>
                          "{aff.text}"
                        </Text>
                        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
                          <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                            <Ionicons name={catInfo.icon} size={10} color={catInfo.color} />
                            <Text style={{ color: catInfo.color, fontSize: 10, fontWeight: "600" }}>{catInfo.label}</Text>
                          </View>
                          <TouchableOpacity onPress={() => handleDeleteCustom(aff.id, aff.text)} style={{ padding: 2 }}>
                            <Ionicons name="trash-outline" size={14} color="#e0555560" />
                          </TouchableOpacity>
                        </View>
                      </TouchableOpacity>
                    );
                  }}
                />
              )
            )}

            {/* Close */}
            <TouchableOpacity
              onPress={() => setLibraryModal(false)}
              style={{
                padding: 16,
                borderRadius: 14,
                backgroundColor: colors.glassInput,
                alignItems: "center",
                marginTop: 12,
                borderWidth: 1,
                borderColor: colors.glassBorder,
              }}
            >
              <Text style={{ color: colors.textSecondary || "#9ca3af", fontWeight: "600" }}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Add Custom Affirmation Modal */}
      <Modal visible={addCustomModal} animationType="slide" transparent>
        <View style={{ flex: 1, justifyContent: "flex-end" }}>
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => setAddCustomModal(false)}
            style={{ flex: 1 }}
          >
            <BlurView
              intensity={colors.blurIntensity}
              tint={colors.blurTint}
              style={{ flex: 1 }}
            />
          </TouchableOpacity>
          <View
            style={{
              backgroundColor: colors.glassModal,
              borderTopLeftRadius: 28,
              borderTopRightRadius: 28,
              padding: 28,
              borderWidth: 1,
              borderColor: colors.glassBorderMedium,
              borderBottomWidth: 0,
            }}
          >
            <View style={{ alignItems: "center", marginBottom: 16 }}>
              <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: colors.borderHandle || "#ffffff15" }} />
            </View>

            <Text style={{ color: colors.textPrimary || "#ffffff", fontSize: 20, fontWeight: "700", marginBottom: 18 }}>
              Add Your Affirmation
            </Text>

            <Animated.View style={{ transform: [{ translateX: customShake }], marginBottom: 16 }}>
              <TextInput
                value={customText}
                onChangeText={(t) => { setCustomText(t); setCustomError(""); }}
                placeholder="I am becoming the best version of myself..."
                placeholderTextColor={colors.textTertiary || "#6b7280"}
                multiline
                style={{
                  backgroundColor: colors.glassInput,
                  color: colors.textPrimary || "#ffffff",
                  borderRadius: 14,
                  padding: 16,
                  fontSize: 15,
                  minHeight: 80,
                  textAlignVertical: "top",
                  borderWidth: 1,
                  borderColor: customError ? colors.accentRed : colors.glassBorder,
                }}
              />
              {customError ? <Text style={{ color: colors.accentRed, fontSize: 12, marginTop: 4, marginLeft: 4 }}>{customError}</Text> : null}
            </Animated.View>

            {/* Category */}
            <Text style={{ color: colors.textSecondary || "#9ca3af", fontSize: 12, marginBottom: 10 }}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 18 }} contentContainerStyle={{ gap: 6 }}>
              {customCategoryOptions.map(([key, catInfo]) => {
                const isActive = customCategory === key;
                return (
                  <TouchableOpacity
                    key={key}
                    onPress={() => setCustomCategory(key)}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 4,
                      paddingHorizontal: 12,
                      paddingVertical: 8,
                      borderRadius: 10,
                      backgroundColor: isActive ? catInfo.color + "20" : (colors.glassChip || "#ffffff08"),
                      borderWidth: 1,
                      borderColor: isActive ? catInfo.color + "40" : "transparent",
                    }}
                  >
                    <Ionicons name={catInfo.icon} size={12} color={isActive ? catInfo.color : (colors.textTertiary || "#6b7280")} />
                    <Text style={{ color: isActive ? catInfo.color : (colors.textTertiary || "#6b7280"), fontSize: 11, fontWeight: "600" }}>
                      {catInfo.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <View style={{ flexDirection: "row", gap: 12 }}>
              <TouchableOpacity
                onPress={() => setAddCustomModal(false)}
                style={{
                  flex: 1,
                  padding: 16,
                  borderRadius: 14,
                  backgroundColor: colors.glassInput,
                  alignItems: "center",
                  borderWidth: 1,
                  borderColor: colors.glassBorder,
                }}
              >
                <Text style={{ color: colors.textSecondary || "#9ca3af", fontWeight: "600" }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleAddCustom}
                style={{ flex: 1, padding: 16, borderRadius: 14, backgroundColor: "#c09460", alignItems: "center" }}
              >
                <Text style={{ color: "#0a0a0f", fontWeight: "600" }}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default ManifestationBox;
