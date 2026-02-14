// ─── Affirmation Categories ─────────────────────────
export const affirmationCategories = {
  all: { label: "All", icon: "sparkles", color: "#c09460" },
  confidence: { label: "Confidence", icon: "shield-checkmark", color: "#e05555" },
  career: { label: "Career", icon: "briefcase", color: "#4078e0" },
  wealth: { label: "Wealth", icon: "cash", color: "#2bb883" },
  health: { label: "Health", icon: "heart", color: "#e06612" },
  gratitude: { label: "Gratitude", icon: "sunny", color: "#e0a820" },
  discipline: { label: "Discipline", icon: "fitness", color: "#c09460" },
  desi: { label: "Desi Power", icon: "flash", color: "#c09460" },
};

// ─── Pre-built Affirmations ──────────────────────────
const affirmations = [
  // ─── Confidence (15) ───────────────────────────
  { text: "I am capable of achieving anything I set my mind to.", category: "confidence" },
  { text: "I believe in myself and my ability to succeed.", category: "confidence" },
  { text: "I am worthy of great things.", category: "confidence" },
  { text: "Every day I am becoming a better version of myself.", category: "confidence" },
  { text: "I have the power to create change in my life.", category: "confidence" },
  { text: "I am enough. I have enough. I do enough.", category: "confidence" },
  { text: "My potential is limitless. My possibilities are endless.", category: "confidence" },
  { text: "I trust myself to make the right decisions.", category: "confidence" },
  { text: "I am resilient. I can handle anything life throws at me.", category: "confidence" },
  { text: "I radiate confidence and attract success.", category: "confidence" },
  { text: "I am not defined by my past. I am driven by my future.", category: "confidence" },
  { text: "I deserve success and I will achieve it.", category: "confidence" },
  { text: "I am fearless in the pursuit of what sets my soul on fire.", category: "confidence" },
  { text: "My self-worth is not determined by others' opinions.", category: "confidence" },
  { text: "I am the architect of my life. I build its foundation.", category: "confidence" },

  // ─── Career (15) ───────────────────────────────
  { text: "I am becoming the best developer I can be.", category: "career" },
  { text: "My dream job is coming to me. I am preparing for it every day.", category: "career" },
  { text: "I will crack my target company interview.", category: "career" },
  { text: "Every line of code I write makes me better.", category: "career" },
  { text: "I am a problem solver. Companies need people like me.", category: "career" },
  { text: "My skills are growing every single day.", category: "career" },
  { text: "I will get a 10+ LPA job through my hard work and dedication.", category: "career" },
  { text: "I am building a career that will make my family proud.", category: "career" },
  { text: "Rejection is redirection. The right opportunity is coming.", category: "career" },
  { text: "I am not competing with others. I am competing with who I was yesterday.", category: "career" },
  { text: "My consistency in DSA practice will pay off.", category: "career" },
  { text: "I am ready for the next level in my career.", category: "career" },
  { text: "Every interview is a learning experience.", category: "career" },
  { text: "I bring unique value to any team I join.", category: "career" },
  { text: "My portfolio and skills speak for themselves.", category: "career" },

  // ─── Wealth (12) ───────────────────────────────
  { text: "I am becoming debt-free. Every payment brings me closer.", category: "wealth" },
  { text: "Money flows to me easily and abundantly.", category: "wealth" },
  { text: "I am financially responsible and make smart decisions.", category: "wealth" },
  { text: "My income is growing. My debts are shrinking.", category: "wealth" },
  { text: "I deserve financial freedom and I am working towards it.", category: "wealth" },
  { text: "I will clear all my debts and build wealth.", category: "wealth" },
  { text: "Every rupee I save is a step towards financial independence.", category: "wealth" },
  { text: "I attract opportunities that create money.", category: "wealth" },
  { text: "I am grateful for what I have and excited for what's coming.", category: "wealth" },
  { text: "My relationship with money is healthy and positive.", category: "wealth" },
  { text: "I will build multiple streams of income.", category: "wealth" },
  { text: "Financial abundance is my birthright.", category: "wealth" },

  // ─── Health (12) ───────────────────────────────
  { text: "My body is strong, my mind is sharp, my spirit is unbreakable.", category: "health" },
  { text: "I choose health over comfort every single day.", category: "health" },
  { text: "I am grateful for my body and I take care of it.", category: "health" },
  { text: "Every workout makes me stronger inside and out.", category: "health" },
  { text: "I nourish my body with good food and positive thoughts.", category: "health" },
  { text: "My mental health is a priority, not a luxury.", category: "health" },
  { text: "I sleep well, eat well, and move my body daily.", category: "health" },
  { text: "I am becoming fitter, healthier, and more energetic.", category: "health" },
  { text: "I release all stress and welcome peace into my life.", category: "health" },
  { text: "My body heals, my mind calms, my soul grows.", category: "health" },
  { text: "I choose progress over perfection in my fitness journey.", category: "health" },
  { text: "Taking care of myself is not selfish. It is necessary.", category: "health" },

  // ─── Gratitude (12) ────────────────────────────
  { text: "I am grateful for this new day and the opportunities it brings.", category: "gratitude" },
  { text: "I appreciate the small wins that lead to big victories.", category: "gratitude" },
  { text: "I am thankful for the challenges that make me grow.", category: "gratitude" },
  { text: "Today I choose to focus on what I have, not what I lack.", category: "gratitude" },
  { text: "I am blessed with a brain that can learn and hands that can build.", category: "gratitude" },
  { text: "I am grateful for my family who supports me.", category: "gratitude" },
  { text: "Every day is a gift. I will make the most of it.", category: "gratitude" },
  { text: "I am thankful for the journey, even the tough parts.", category: "gratitude" },
  { text: "I attract positivity because I am grateful.", category: "gratitude" },
  { text: "My life is full of blessings, seen and unseen.", category: "gratitude" },
  { text: "I appreciate every step forward, no matter how small.", category: "gratitude" },
  { text: "Gratitude turns what I have into enough.", category: "gratitude" },

  // ─── Discipline (12) ───────────────────────────
  { text: "I show up every day, no matter how I feel.", category: "discipline" },
  { text: "I am building an unbreakable daily routine.", category: "discipline" },
  { text: "Discipline is my superpower. I choose it daily.", category: "discipline" },
  { text: "I do the hard things first because I am disciplined.", category: "discipline" },
  { text: "My habits today are creating my tomorrow.", category: "discipline" },
  { text: "I don't wait for motivation. I create it through action.", category: "discipline" },
  { text: "Consistency over intensity. I am in this for the long run.", category: "discipline" },
  { text: "I am becoming the person who never gives up.", category: "discipline" },
  { text: "Small efforts every day lead to massive results.", category: "discipline" },
  { text: "I follow my schedule because I respect my goals.", category: "discipline" },
  { text: "I am stronger than my excuses.", category: "discipline" },
  { text: "Every day I choose discipline over distraction.", category: "discipline" },

  // ─── Desi Power (15) ───────────────────────────
  { text: "Main apni zindagi ka hero hun. Kisi aur ka nahi.", category: "desi" },
  { text: "Aaj se mera comeback shuru hota hai.", category: "desi" },
  { text: "Meri mehnat mujhe define karegi, meri haalat nahi.", category: "desi" },
  { text: "Main woh karunga jo sab kehte hain impossible hai.", category: "desi" },
  { text: "Debt khatam hoga, job milegi, sab hoga. Main ready hun.", category: "desi" },
  { text: "Main roz better ban raha hun. Progress ho rahi hai.", category: "desi" },
  { text: "Meri family ko mujh par garv hoga. Ye mera waada hai.", category: "desi" },
  { text: "Aaj ka din mera hai. Main isko waste nahi karunga.", category: "desi" },
  { text: "Main apne sapno ke layak hun. Bas thoda aur mehnat.", category: "desi" },
  { text: "Jo log mujhe underestimate kar rahe hain, unhe galat sabit karunga.", category: "desi" },
  { text: "Code likhunga, DSA karunga, interview dunga — roz.", category: "desi" },
  { text: "Paise aayenge, izzat aayegi. Pehle skill build karunga.", category: "desi" },
  { text: "Mere andar wo aag hai jo duniya badal sakti hai.", category: "desi" },
  { text: "Mushkil waqt permanent nahi hai, meri mehnat hai.", category: "desi" },
  { text: "Ek saal baad main aaj ka din yaad karunga aur muskuraunga.", category: "desi" },
];

export default affirmations;

// ─── Helper Functions ─────────────────────────────

/** Get today's affirmation — rotates daily */
export const getDailyAffirmation = () => {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000
  );
  return affirmations[dayOfYear % affirmations.length];
};

/** Get a random affirmation (optionally from a specific category) */
export const getRandomAffirmation = (category = null) => {
  if (category && category !== "all") {
    const pool = affirmations.filter((a) => a.category === category);
    if (pool.length > 0) return pool[Math.floor(Math.random() * pool.length)];
  }
  return affirmations[Math.floor(Math.random() * affirmations.length)];
};

/** Get all affirmations from a specific category */
export const getAffirmationsByCategory = (category) => {
  if (!category || category === "all") return affirmations;
  return affirmations.filter((a) => a.category === category);
};
