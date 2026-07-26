import { getAiClient, getGeminiModel } from "../shared/aiClient.js";
import { getOrGetCollection } from "../ingest/storeChunks.js";

const LANGUAGE_MAP = new Set([
  "english",
  "tamil",
  "hindi",
  "french",
  "german",
  "sanskrit",
  "language",
]);

export function isLanguageSubject(subjectName) {
  if (!subjectName || typeof subjectName !== "string") return false;
  return LANGUAGE_MAP.has(subjectName.trim().toLowerCase());
}

const ALIAS_MAP = {
  "math": "Maths",
  "mathematics": "Maths",
  "science": "Science",
  "social": "SocialScience",
  "social science": "SocialScience",
  "socialscience": "SocialScience",
  "political science": "Political Science",
  "pol science": "Political Science",
  "civics": "Political Science",
  "phy": "Physics",
  "chem": "Chemistry",
  "bio": "Biology",
  "eco": "Economics",
};

export function isGreeting(text) {
  if (!text || typeof text !== "string") return false;
  const clean = text.trim().toLowerCase().replace(/[^\w\s]/g, "");
  const greetingPattern = /^(hi|hello|hey|good\s*(morning|afternoon|evening)|namaste|greetings|howdy|who\s*are\s*you|what\s*can\s*you\s*do|help|start)$/i;
  if (greetingPattern.test(clean)) return true;
  if (clean.length <= 12 && /^(hi|hello|hey|namaste)\b/i.test(clean)) return true;
  return false;
}

export async function detectSubject({ question, board, grade }) {
  if (!question || typeof question !== "string") {
    return { subject: "General", isLanguage: false, isGreeting: false };
  }

  const qTrim = question.trim();

  if (isGreeting(qTrim)) {
    return { subject: "General", isLanguage: false, isGreeting: true };
  }

  // Stage 1: Fast Script Range & Keyword Detection
  if (/[\u0B80-\u0BFF]/.test(qTrim)) {
    return { subject: "Tamil", isLanguage: true };
  }
  if (/[\u0900-\u097F]/.test(qTrim)) {
    return { subject: "Hindi", isLanguage: true };
  }
  if (/\b(essay|grammar|poem|poetry|letter writing|comprehension)\b/i.test(qTrim)) {
    return { subject: "English", isLanguage: true };
  }

  // Stage 2: Dynamic Subject Discovery from ChromaDB
  let availableSubjects = [
    "Science",
    "Maths",
    "SocialScience",
    "Physics",
    "Chemistry",
    "Biology",
    "Economics",
    "Commerce",
    "History",
    "Geography",
    "Political Science",
    "Computer Science",
    "English",
    "Tamil",
    "Hindi",
  ];

  try {
    const collection = await getOrGetCollection();
    const where = {};
    if (board) where.board = String(board).toUpperCase();
    if (grade) where.grade = String(grade);

    const getRes = await collection.get({
      where: Object.keys(where).length > 0 ? where : undefined,
      limit: 100,
      include: ["metadatas"],
    });

    if (getRes && getRes.metadatas && getRes.metadatas.length > 0) {
      const distinct = new Set(
        getRes.metadatas.map((m) => m.subject).filter(Boolean)
      );
      if (distinct.size > 0) {
        availableSubjects = Array.from(distinct);
        availableSubjects.push("English", "Tamil", "Hindi");
      }
    }
  } catch (e) {
    // Proceed with default subject list
  }

  // Stage 3: Gemini Flash Lite Classification
  const ai = getAiClient();
  const GEMINI_MODEL = getGeminiModel();

  const prompt = `
You are a curriculum subject classifier.
Available Subjects for Board ${board || "CBSE"}, Grade ${grade || "General"}:
${JSON.stringify(availableSubjects)}

Question: "${qTrim}"

Classify this student question into EXACTLY ONE subject from the Available Subjects list.
Return ONLY valid JSON matching this schema:
{
  "subject": "Exact Subject Name"
}
`;

  try {
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
    });

    const raw = response.text || "";
    const cleaned = raw.replace(/```json/g, "").replace(/```/g, "").trim();
    const parsed = JSON.parse(cleaned);
    let matchedSubject = (parsed.subject || "").trim();

    // Stage 4: Fuzzy Alias Normalization
    const lowerMatched = matchedSubject.toLowerCase();
    if (ALIAS_MAP[lowerMatched]) {
      matchedSubject = ALIAS_MAP[lowerMatched];
    }

    const isLang = LANGUAGE_MAP.has(matchedSubject.toLowerCase());
    return {
      subject: matchedSubject || "Science",
      isLanguage: isLang,
    };
  } catch (e) {
    console.warn("[detectSubject] Gemini classification fallback:", e.message);
    return { subject: "Science", isLanguage: false };
  }
}
