import AsyncStorage from "@react-native-async-storage/async-storage";

// ─── Quote Categories ─────────────────────────────
export const categories = {
  all: { label: "All", icon: "sparkles", color: "#9ca3af" },
  hustle: { label: "Hustle", icon: "flame", color: "#e05555" },
  discipline: { label: "Discipline", icon: "shield-checkmark", color: "#4078e0" },
  success: { label: "Success", icon: "trophy", color: "#e0a820" },
  growth: { label: "Growth", icon: "trending-up", color: "#2bb883" },
  desi: { label: "Desi Fire", icon: "flash", color: "#c09460" },
  api: { label: "Online", icon: "globe", color: "#c09460" },
};

// ─── Quotes Database (120+ local quotes) ──────────
const quotes = [
  // ─── Hustle (20) ───────────────────────────────
  { text: "Hustle in silence. Let your success make the noise.", author: "Unknown", category: "hustle" },
  { text: "Good things come to those who hustle.", author: "Anais Nin", category: "hustle" },
  { text: "The dream is free. The hustle is sold separately.", author: "Unknown", category: "hustle" },
  { text: "Don't stop when you're tired. Stop when you're done.", author: "Unknown", category: "hustle" },
  { text: "Work like there is someone working 24 hours a day to take it away from you.", author: "Mark Cuban", category: "hustle" },
  { text: "If you're not making someone else's life better, you're wasting your time.", author: "Will Smith", category: "hustle" },
  { text: "Rise and grind. Every single day.", author: "Unknown", category: "hustle" },
  { text: "The only place where success comes before work is in the dictionary.", author: "Vidal Sassoon", category: "hustle" },
  { text: "Opportunities don't happen. You create them.", author: "Chris Grosser", category: "hustle" },
  { text: "I didn't get there by wishing for it. I worked to get it.", author: "Estée Lauder", category: "hustle" },
  { text: "The harder you work, the luckier you get.", author: "Gary Player", category: "hustle" },
  { text: "There are no secrets to success. It is the result of preparation, hard work, and learning from failure.", author: "Colin Powell", category: "hustle" },
  { text: "Without hustle, talent will only carry you so far.", author: "Gary Vaynerchuk", category: "hustle" },
  { text: "I'm not lucky. I'm talented. And I hustled.", author: "Unknown", category: "hustle" },
  { text: "Stop waiting for things to happen. Go out and make them happen.", author: "Unknown", category: "hustle" },
  { text: "Outwork everyone. There is no substitute.", author: "Unknown", category: "hustle" },
  { text: "Your 9 to 5 makes you a living. Your side hustle makes you a fortune.", author: "Unknown", category: "hustle" },
  { text: "Grind now. Shine later.", author: "Unknown", category: "hustle" },
  { text: "Stay hungry. Stay foolish.", author: "Steve Jobs", category: "hustle" },
  { text: "I never dreamed about success. I worked for it.", author: "Estée Lauder", category: "hustle" },

  // ─── Discipline (20) ───────────────────────────
  { text: "Discipline is doing what needs to be done, even when you don't feel like it.", author: "Unknown", category: "discipline" },
  { text: "We do not rise to the level of our goals. We fall to the level of our systems.", author: "James Clear", category: "discipline" },
  { text: "Motivation gets you started. Discipline keeps you going.", author: "Unknown", category: "discipline" },
  { text: "The secret of your future is hidden in your daily routine.", author: "Mike Murdock", category: "discipline" },
  { text: "Discipline is choosing between what you want now and what you want most.", author: "Abraham Lincoln", category: "discipline" },
  { text: "Small daily improvements are the key to staggering long-term results.", author: "Unknown", category: "discipline" },
  { text: "It does not matter how slowly you go as long as you do not stop.", author: "Confucius", category: "discipline" },
  { text: "The chains of habit are too light to be felt until they are too heavy to be broken.", author: "Warren Buffett", category: "discipline" },
  { text: "You will never always be motivated. You have to learn to be disciplined.", author: "Unknown", category: "discipline" },
  { text: "Consistency is what transforms average into excellence.", author: "Unknown", category: "discipline" },
  { text: "Discipline equals freedom.", author: "Jocko Willink", category: "discipline" },
  { text: "Success isn't owned. It's rented. And rent is due every day.", author: "J.J. Watt", category: "discipline" },
  { text: "The pain of discipline is far less than the pain of regret.", author: "Unknown", category: "discipline" },
  { text: "Winners embrace hard work. They love the discipline of it.", author: "Lou Holtz", category: "discipline" },
  { text: "Your habits will determine your future.", author: "Jack Canfield", category: "discipline" },
  { text: "Self-discipline is the No. 1 delineating factor between the rich, the middle class, and the poor.", author: "Robert Kiyosaki", category: "discipline" },
  { text: "Do what is hard and your life will be easy. Do what is easy and your life will be hard.", author: "Les Brown", category: "discipline" },
  { text: "First forget inspiration. Habit is more dependable.", author: "Octavia Butler", category: "discipline" },
  { text: "Repetition is the mother of learning, the father of action, which makes it the architect of accomplishment.", author: "Zig Ziglar", category: "discipline" },
  { text: "If you want to be great, be consistent.", author: "Unknown", category: "discipline" },

  // ─── Success (20) ──────────────────────────────
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs", category: "success" },
  { text: "Success is not final, failure is not fatal. It is the courage to continue that counts.", author: "Winston Churchill", category: "success" },
  { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson", category: "success" },
  { text: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt", category: "success" },
  { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt", category: "success" },
  { text: "Your limitation — it's only your imagination.", author: "Unknown", category: "success" },
  { text: "Great things never come from comfort zones.", author: "Unknown", category: "success" },
  { text: "Dream it. Wish it. Do it.", author: "Unknown", category: "success" },
  { text: "The harder you work for something, the greater you'll feel when you achieve it.", author: "Unknown", category: "success" },
  { text: "Success usually comes to those who are too busy to be looking for it.", author: "Henry David Thoreau", category: "success" },
  { text: "I find that the harder I work, the more luck I seem to have.", author: "Thomas Jefferson", category: "success" },
  { text: "Don't be afraid to give up the good to go for the great.", author: "John D. Rockefeller", category: "success" },
  { text: "If you really look closely, most overnight successes took a long time.", author: "Steve Jobs", category: "success" },
  { text: "The way to get started is to quit talking and begin doing.", author: "Walt Disney", category: "success" },
  { text: "Success is walking from failure to failure with no loss of enthusiasm.", author: "Winston Churchill", category: "success" },
  { text: "All progress takes place outside the comfort zone.", author: "Michael John Bobak", category: "success" },
  { text: "If you set your goals ridiculously high and it's a failure, you will fail above everyone else's success.", author: "James Cameron", category: "success" },
  { text: "Try not to become a man of success. Rather become a man of value.", author: "Albert Einstein", category: "success" },
  { text: "Would you like me to give you a formula for success? Double your rate of failure.", author: "Thomas J. Watson", category: "success" },
  { text: "I attribute my success to this: I never gave or took any excuse.", author: "Florence Nightingale", category: "success" },

  // ─── Growth (20) ───────────────────────────────
  { text: "Every expert was once a beginner. Keep learning.", author: "Unknown", category: "growth" },
  { text: "Your future self will thank you for the work you do today.", author: "Unknown", category: "growth" },
  { text: "The only impossible journey is the one you never begin.", author: "Tony Robbins", category: "growth" },
  { text: "A year from now you may wish you had started today.", author: "Karen Lamb", category: "growth" },
  { text: "Growth is painful. Change is painful. But nothing is as painful as staying stuck.", author: "Mandy Hale", category: "growth" },
  { text: "Be not afraid of growing slowly, be afraid only of standing still.", author: "Chinese Proverb", category: "growth" },
  { text: "The mind is everything. What you think you become.", author: "Buddha", category: "growth" },
  { text: "Learn as if you will live forever, live as if you will die tomorrow.", author: "Mahatma Gandhi", category: "growth" },
  { text: "What we fear doing most is usually what we most need to do.", author: "Tim Ferriss", category: "growth" },
  { text: "Invest in yourself. Your career is the engine of your wealth.", author: "Paul Clitheroe", category: "growth" },
  { text: "In a world that's changing really quickly, the only strategy that is guaranteed to fail is not taking risks.", author: "Mark Zuckerberg", category: "growth" },
  { text: "Live as if you were to die tomorrow. Learn as if you were to live forever.", author: "Mahatma Gandhi", category: "growth" },
  { text: "The capacity to learn is a gift; the ability to learn is a skill; the willingness to learn is a choice.", author: "Brian Herbert", category: "growth" },
  { text: "Anyone who stops learning is old, whether at twenty or eighty.", author: "Henry Ford", category: "growth" },
  { text: "The beautiful thing about learning is that no one can take it away from you.", author: "B.B. King", category: "growth" },
  { text: "Education is not the filling of a pail, but the lighting of a fire.", author: "W.B. Yeats", category: "growth" },
  { text: "The more that you read, the more things you will know. The more that you learn, the more places you'll go.", author: "Dr. Seuss", category: "growth" },
  { text: "An investment in knowledge pays the best interest.", author: "Benjamin Franklin", category: "growth" },
  { text: "Change is the end result of all true learning.", author: "Leo Buscaglia", category: "growth" },
  { text: "Once you stop learning, you start dying.", author: "Albert Einstein", category: "growth" },

  // ─── Desi Fire (20) ────────────────────────────
  { text: "Aaj ka din tera hai. Kuch kar ke dikha.", author: "Self", category: "desi" },
  { text: "Mehnat ka koi shortcut nahi hota. Bas karte raho.", author: "Self", category: "desi" },
  { text: "Jitna mushkil lagta hai, utna hi bada result hoga.", author: "Self", category: "desi" },
  { text: "Ek din sab bolenge — 'Maine socha nahi tha ye kar lega.'", author: "Self", category: "desi" },
  { text: "Consistency > Motivation. Roz karo, feel aayegi.", author: "Self", category: "desi" },
  { text: "Debt khatam hoga, job milegi, sab hoga. Bas ruk mat.", author: "Self", category: "desi" },
  { text: "Tu wahi hai jo tu daily karta hai. Aadat bana, zindagi badal.", author: "Self", category: "desi" },
  { text: "Code karo, seekho, apply karo. Repeat.", author: "Self", category: "desi" },
  { text: "DSA aaj mushkil lagta hai. 30 din baad easy lagega.", author: "Self", category: "desi" },
  { text: "Sapne wo nahi jo neend mein aaye, sapne wo hain jo neend udaa de.", author: "APJ Abdul Kalam", category: "desi" },
  { text: "Struggle temporary hai, regret permanent. Choose wisely.", author: "Self", category: "desi" },
  { text: "Tera time aayega. Bas grind karte reh.", author: "Self", category: "desi" },
  { text: "Koshish karne walon ki haar nahi hoti.", author: "Harivansh Rai Bachchan", category: "desi" },
  { text: "Zindagi mein kuch bada karna ho toh chhoti cheezein chhodni padti hain.", author: "Self", category: "desi" },
  { text: "Aaj nahi karega toh kal bhi nahi karega. Abhi shuru kar.", author: "Self", category: "desi" },
  { text: "Logo ke opinions se nahi, apne goals se chalna seekh.", author: "Self", category: "desi" },
  { text: "10 baar fail hua toh kya? 11vi baar crack karega.", author: "Self", category: "desi" },
  { text: "Paisa aayega, izzat aayegi. Pehle skill aani chahiye.", author: "Self", category: "desi" },
  { text: "Comfort zone mein rahega toh mediocre rahega. Bahar nikal.", author: "Self", category: "desi" },
  { text: "Teri mehnat tujhe define karegi, teri situation nahi.", author: "Self", category: "desi" },
];

export default quotes;

// ─── Helper Functions ─────────────────────────────

/** Get the "quote of the day" — deterministic based on day of year */
export const getDailyQuote = () => {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000
  );
  return quotes[dayOfYear % quotes.length];
};

/** Get a random quote (optionally from a specific category) */
export const getRandomQuote = (category = null) => {
  if (category && category !== "all") {
    const pool = quotes.filter((q) => q.category === category);
    if (pool.length > 0) return pool[Math.floor(Math.random() * pool.length)];
  }
  return quotes[Math.floor(Math.random() * quotes.length)];
};

/** Get all quotes from a specific category */
export const getQuotesByCategory = (category) => {
  if (!category || category === "all") return quotes;
  return quotes.filter((q) => q.category === category);
};

// ─── API Quote Fetching ──────────────────────────

const API_CACHE_KEY = "@hustlekit_api_quote";
const API_CACHE_EXPIRY = 60 * 60 * 1000; // 1 hour

/** Fetch a fresh quote from external API with caching */
export const fetchApiQuote = async () => {
  try {
    // Check cache first
    const cached = await AsyncStorage.getItem(API_CACHE_KEY);
    if (cached) {
      const { quote, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < API_CACHE_EXPIRY) {
        return quote;
      }
    }

    // Try ZenQuotes API (free, no key needed)
    const response = await fetch("https://zenquotes.io/api/random");
    if (response.ok) {
      const data = await response.json();
      if (data && data[0] && data[0].q) {
        const quote = {
          text: data[0].q,
          author: data[0].a || "Unknown",
          category: "api",
        };
        // Cache it
        await AsyncStorage.setItem(
          API_CACHE_KEY,
          JSON.stringify({ quote, timestamp: Date.now() })
        );
        return quote;
      }
    }

    // Fallback: try type.fit API
    const response2 = await fetch("https://type.fit/api/quotes");
    if (response2.ok) {
      const data2 = await response2.json();
      if (data2 && data2.length > 0) {
        const random = data2[Math.floor(Math.random() * data2.length)];
        const quote = {
          text: random.text,
          author: random.author?.replace(", type.fit", "") || "Unknown",
          category: "api",
        };
        await AsyncStorage.setItem(
          API_CACHE_KEY,
          JSON.stringify({ quote, timestamp: Date.now() })
        );
        return quote;
      }
    }

    return null; // Both APIs failed
  } catch {
    return null; // Network error — caller will use local fallback
  }
};
