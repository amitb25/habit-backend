import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Share, ScrollView, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { getDailyQuote, getRandomQuote, categories, fetchApiQuote } from "../data/quotes";
import { useTheme } from '../context/ThemeContext';

// Category keys to show in filter (exclude "api" from selector — it's auto-tagged)
const filterCategories = Object.entries(categories).filter(([key]) => key !== "api");

const DailyQuote = () => {
  const { colors, isDark, glassShadow } = useTheme();
  const [quote, setQuote] = useState(getDailyQuote());
  const [copied, setCopied] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [loadingApi, setLoadingApi] = useState(false);

  const cat = categories[quote.category] || categories.hustle;

  // Fetch an API quote on first mount (background, non-blocking)
  useEffect(() => {
    fetchApiQuote().then((apiQuote) => {
      // Don't auto-replace — just pre-cache for when user taps "Online"
    });
  }, []);

  const handleNewQuote = () => {
    setCopied(false);
    setQuote(getRandomQuote(selectedCategory));
  };

  const handleFetchOnline = async () => {
    setCopied(false);
    setLoadingApi(true);
    const apiQuote = await fetchApiQuote();
    if (apiQuote) {
      setQuote(apiQuote);
    } else {
      // Fallback to local if API fails
      setQuote(getRandomQuote(selectedCategory));
    }
    setLoadingApi(false);
  };

  const handleCategoryChange = (key) => {
    setCopied(false);
    setSelectedCategory(key);
    // Immediately show a quote from that category
    setQuote(getRandomQuote(key));
  };

  const handleCopy = async () => {
    await Clipboard.setStringAsync(`"${quote.text}" — ${quote.author}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `"${quote.text}" — ${quote.author}\n\nvia LifeStack`,
      });
    } catch (_) {}
  };

  return (
    <View
      style={{
        backgroundColor: colors.glassCardElevated,
        borderRadius: 20,
        padding: 20,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: cat.color + (isDark ? "20" : "40"),
        borderLeftWidth: 3,
        borderLeftColor: cat.color,
        borderTopWidth: 1,
        borderTopColor: colors.glassHighlight,
        ...glassShadow,
      }}
    >
      {/* Header row */}
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Ionicons name="chatbubble-ellipses" size={14} color={cat.color} />
          <Text style={{ color: cat.color, fontSize: 12, fontWeight: "600" }}>
            Quote of the Day
          </Text>
        </View>
        {/* Category badge */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 4,
            backgroundColor: cat.color + "15",
            paddingHorizontal: 10,
            paddingVertical: 4,
            borderRadius: 12,
          }}
        >
          <Ionicons name={cat.icon} size={11} color={cat.color} />
          <Text style={{ color: cat.color, fontSize: 10, fontWeight: "700" }}>
            {cat.label}
          </Text>
        </View>
      </View>

      {/* Category Filter Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ marginBottom: 14 }}
        contentContainerStyle={{ gap: 6 }}
      >
        {filterCategories.map(([key, catInfo]) => {
          const isActive = selectedCategory === key;
          return (
            <TouchableOpacity
              key={key}
              onPress={() => handleCategoryChange(key)}
              activeOpacity={0.7}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 4,
                paddingHorizontal: 10,
                paddingVertical: 6,
                borderRadius: 10,
                backgroundColor: isActive ? catInfo.color + (isDark ? "20" : "30") : colors.glassChip,
                borderWidth: 1,
                borderColor: isActive ? catInfo.color + (isDark ? "35" : "50") : "transparent",
              }}
            >
              <Ionicons name={catInfo.icon} size={11} color={isActive ? catInfo.color : colors.textTertiary} />
              <Text
                style={{
                  color: isActive ? catInfo.color : colors.textTertiary,
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

      {/* Quote text */}
      <Text style={{ color: colors.textSubtitle, fontSize: 14, fontStyle: "italic", lineHeight: 22 }}>
        "{quote.text}"
      </Text>
      <Text style={{ color: colors.textTertiary, fontSize: 12, marginTop: 8, textAlign: "right" }}>
        — {quote.author}
      </Text>

      {/* Action buttons */}
      <View style={{ flexDirection: "row", gap: 8, marginTop: 14 }}>
        <TouchableOpacity
          onPress={handleNewQuote}
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
          <Ionicons name="refresh" size={14} color={colors.textSecondary} />
          <Text style={{ color: colors.textSecondary, fontSize: 11, fontWeight: "600" }}>New</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleFetchOnline}
          activeOpacity={0.7}
          disabled={loadingApi}
          style={{
            flex: 1,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            backgroundColor: loadingApi ? "#c0946015" : colors.glassChip,
            borderRadius: 12,
            paddingVertical: 10,
          }}
        >
          {loadingApi ? (
            <ActivityIndicator size="small" color="#c09460" />
          ) : (
            <>
              <Ionicons name="globe-outline" size={14} color="#c09460" />
              <Text style={{ color: "#c09460", fontSize: 11, fontWeight: "600" }}>Online</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleCopy}
          activeOpacity={0.7}
          style={{
            flex: 1,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            backgroundColor: copied ? "#2bb88315" : colors.glassChip,
            borderRadius: 12,
            paddingVertical: 10,
          }}
        >
          <Ionicons name={copied ? "checkmark" : "copy"} size={14} color={copied ? "#2bb883" : colors.textSecondary} />
          <Text style={{ color: copied ? "#2bb883" : colors.textSecondary, fontSize: 11, fontWeight: "600" }}>
            {copied ? "Copied!" : "Copy"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleShare}
          activeOpacity={0.7}
          style={{
            width: 40,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: colors.glassChip,
            borderRadius: 12,
            paddingVertical: 10,
          }}
        >
          <Ionicons name="share-outline" size={16} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default React.memo(DailyQuote);
