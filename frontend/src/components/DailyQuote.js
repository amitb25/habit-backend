import React from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const quotes = [
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { text: "Hard work beats talent when talent doesn't work hard.", author: "Tim Notke" },
  { text: "Success is not final, failure is not fatal. It is the courage to continue that counts.", author: "Winston Churchill" },
  { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
  { text: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
  { text: "It does not matter how slowly you go as long as you do not stop.", author: "Confucius" },
  { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
  { text: "Your limitation — it's only your imagination.", author: "Unknown" },
  { text: "Push yourself, because no one else is going to do it for you.", author: "Unknown" },
  { text: "Great things never come from comfort zones.", author: "Unknown" },
  { text: "Dream it. Wish it. Do it.", author: "Unknown" },
  { text: "The harder you work for something, the greater you'll feel when you achieve it.", author: "Unknown" },
  { text: "Don't stop when you're tired. Stop when you're done.", author: "Unknown" },
  { text: "Wake up with determination. Go to bed with satisfaction.", author: "Unknown" },
  { text: "Little things make big days.", author: "Unknown" },
  { text: "It's going to be hard, but hard does not mean impossible.", author: "Unknown" },
  { text: "Hustle in silence. Let your success make the noise.", author: "Unknown" },
  { text: "Discipline is doing what needs to be done, even when you don't feel like it.", author: "Unknown" },
  { text: "Aaj ka din tera hai. Kuch kar ke dikha.", author: "Self" },
  { text: "Mehnat ka koi shortcut nahi hota. Bas karte raho.", author: "Self" },
  { text: "Jitna mushkil lagta hai, utna hi bada result hoga.", author: "Self" },
  { text: "Ek din sab bolenge — 'Maine socha nahi tha ye kar lega.'", author: "Self" },
  { text: "Consistency > Motivation. Roz karo, feel aayegi.", author: "Self" },
  { text: "Debt khatam hoga, job milegi, sab hoga. Bas ruk mat.", author: "Self" },
  { text: "Tu wahi hai jo tu daily karta hai. Aadat bana, zindagi badal.", author: "Self" },
  { text: "Code karo, seekho, apply karo. Repeat.", author: "Self" },
  { text: "Every expert was once a beginner. Keep learning.", author: "Unknown" },
  { text: "Your future self will thank you for the work you do today.", author: "Unknown" },
  { text: "DSA aaj mushkil lagta hai. 30 din baad easy lagega.", author: "Self" },
  { text: "Small daily improvements are the key to staggering long-term results.", author: "Unknown" },
];

const DailyQuote = () => {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000
  );
  const quote = quotes[dayOfYear % quotes.length];

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
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <Ionicons name="chatbubble-ellipses" size={14} color="#a78bfa" />
        <Text style={{ color: "#a78bfa", fontSize: 12, fontWeight: "600" }}>
          Quote of the Day
        </Text>
      </View>
      <Text style={{ color: "#e5e7eb", fontSize: 14, fontStyle: "italic", lineHeight: 22 }}>
        "{quote.text}"
      </Text>
      <Text style={{ color: "#6b7280", fontSize: 12, marginTop: 8, textAlign: "right" }}>
        — {quote.author}
      </Text>
    </View>
  );
};

export default DailyQuote;
