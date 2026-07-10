import { ChromaClient } from "chromadb";
import { GoogleGenAI } from "@google/genai";
import AiChatLog from "../ai-chat-logs/ai-chat-log.model.js";
import { deductTokens } from "../tokens/token.service.js";

const CHROMA_URL = process.env.CHROMA_URL || "http://localhost:8000";
const COLLECTION_NAME = "cbse_books";

// Gemini setup
const GEMINI_MODEL = (process.env.GEMINI_MODEL || "gemini-2.5-flash-lite").replace(/^models\//, "");
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Chroma setup
const chromaUrl = new URL(
  CHROMA_URL.startsWith("http") ? CHROMA_URL : `http://${CHROMA_URL}`
);
const chroma = new ChromaClient({
  host: chromaUrl.hostname,
  port: chromaUrl.port
    ? Number(chromaUrl.port)
    : chromaUrl.protocol === "https:"
    ? 443
    : 80,
  ssl: chromaUrl.protocol === "https:",
});

const normalizeClassLevel = (value) => {
  if (!value) return null;
  const str = String(value).trim().toLowerCase();
  const digitMatch = str.match(/\d+/);
  if (digitMatch) return digitMatch[0];
  return str.replace(/^class\s*/, "");
};

const STOPWORDS = new Set([
  "the",
  "and",
  "or",
  "of",
  "to",
  "a",
  "an",
  "in",
  "on",
  "for",
  "with",
  "about",
  "tell",
  "what",
  "is",
  "are",
  "was",
  "were",
  "do",
  "does",
  "did",
  "i",
  "you",
  "we",
  "they",
  "he",
  "she",
  "it",
]);

const extractKeywords = (text) => {
  const words = String(text || "")
    .toLowerCase()
    .match(/[a-z0-9]+/g);
  if (!words) return [];
  return words.filter((w) => w.length >= 4 && !STOPWORDS.has(w));
};

const keywordSearch = async ({ collection, query, limit = 5 }) => {
  const keywords = extractKeywords(query);
  if (!keywords.length) {
    return { chunks: [], metadatas: [] };
  }

  // Fetch all docs (small dataset) and score by keyword hits
  const all = await collection.get({
    limit: 10000,
    include: ["documents", "metadatas"],
  });

  const scored = [];
  for (let i = 0; i < (all.documents || []).length; i++) {
    const doc = all.documents[i] || "";
    const lower = doc.toLowerCase();
    let score = 0;
    for (const k of keywords) {
      if (lower.includes(k)) score += 1;
    }
    if (score > 0) {
      scored.push({ doc, meta: all.metadatas?.[i] || null, score });
    }
  }

  scored.sort((a, b) => b.score - a.score);
  const top = scored.slice(0, limit);

  return {
    chunks: top.map((t) => t.doc),
    metadatas: top.map((t) => t.meta),
  };
};

export const formatRagSources = (metadatas) => {
  if (!Array.isArray(metadatas)) return [];
  return [
    ...new Set(
      metadatas.map((m) => {
        const title = m.chapter || m.book || "Source";
        return `Class ${m.class} - ${title}`;
      })
    ),
  ];
};

export async function retrieveRagContext({
  query,
  classLevel,
  allowGlobal = true,
}) {
  const collection = await chroma.getCollection({
    name: COLLECTION_NAME,
  });

  const results = await collection.query({
    queryTexts: [query],
    nResults: 5,
  });

  return {
    chunks: results.documents.flat(),
    metadatas: results.metadatas.flat(),
    filter: "global",
    classLevel: normalizeClassLevel(classLevel),
  };
}

export async function askRag({ question, classLevel, userId }) {
  let answer;
  let tokensUsed = 0;
  let usedFilter = "none";
  let finalChunks = [];
  let finalMetadatas = [];
  let chromaFailed = false;

  try {
    const context = await retrieveRagContext({
      query: question,
      classLevel,
      allowGlobal: true,
    });

    const chunks = context.chunks;
    finalChunks = chunks;
    finalMetadatas = context.metadatas;
    usedFilter = context.filter;

    if (!chunks.length) {
      const collection = await chroma.getCollection({ name: COLLECTION_NAME });
      const keyword = await keywordSearch({
        collection,
        query: question,
        limit: 5,
      });
      if (keyword.chunks.length) {
        finalChunks = keyword.chunks;
        finalMetadatas = keyword.metadatas;
        usedFilter = "keyword";
      } else {
        answer = "I could not find an answer in the textbook.";
      }
    }

    if (finalChunks.length) {
      const contextText = finalChunks.join("\n\n");
      const prompt = `
You are a school tutor.
Answer ONLY using the textbook content below.
If the answer is not present, say "I don't know".

Language Guidelines:
- If the question is in Tamil, or the student requests the explanation in Tamil, write the entire response in Tamil script (தமிழ்). Do not write transliterated English characters for Tamil words (e.g. write "ஐந்து" instead of "Ainthu").
- You may include key English technical terms in parentheses next to their Tamil translation (e.g., "உராய்வு (Friction)").

Emoji Guidelines:
- DO NOT use or include any emojis (such as smiley faces, symbols, or illustrative icons) in your response. Keep the output strictly as plain text or standard formatting without emojis.

Textbook content:
${contextText}

Question:
${question}

Answer (simple, clear, student-friendly):
`;

      const result = await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: prompt,
      });

      const usage = result.usageMetadata || {};
      tokensUsed = usage.totalTokenCount || 0;
      answer =
        result.text ||
        result?.candidates?.[0]?.content?.parts?.map((p) => p.text).join("") ||
        "";

      // If model still says "I don't know", try keyword context (if not already)
      if (
        answer &&
        answer.trim().toLowerCase() === "i don't know" &&
        usedFilter !== "keyword"
      ) {
        const collection = await chroma.getCollection({ name: COLLECTION_NAME });
        const keyword = await keywordSearch({
          collection,
          query: question,
          limit: 5,
        });
        if (keyword.chunks.length) {
          finalChunks = keyword.chunks;
          finalMetadatas = keyword.metadatas;
          usedFilter = "keyword";

          const retryContext = finalChunks.join("\n\n");
          const retryPrompt = `
You are a school tutor.
Answer ONLY using the textbook content below.
If the answer is not present, say "I don't know".

Language Guidelines:
- If the question is in Tamil, or the student requests the explanation in Tamil, write the entire response in Tamil script (தமிழ்). Do not write transliterated English characters for Tamil words (e.g. write "ஐந்து" instead of "Ainthu").
- You may include key English technical terms in parentheses next to their Tamil translation (e.g., "உராய்வு (Friction)").

Emoji Guidelines:
- DO NOT use or include any emojis (such as smiley faces, symbols, or illustrative icons) in your response. Keep the output strictly as plain text or standard formatting without emojis.

Textbook content:
${retryContext}

Question:
${question}

Answer (simple, clear, student-friendly):
`;

          const retry = await ai.models.generateContent({
            model: GEMINI_MODEL,
            contents: retryPrompt,
          });

          const usage = retry.usageMetadata || {};
          tokensUsed = usage.totalTokenCount || tokensUsed;
          answer =
            retry.text ||
            retry?.candidates?.[0]?.content?.parts?.map((p) => p.text).join("") ||
            answer;
        }
      }
    }
  } catch (err) {
    console.error("RAG / ChromaDB lookup failed, falling back to direct Gemini query:", err);
    chromaFailed = true;
  }

  // Fallback to direct Gemini query if Chroma/RAG failed OR if no RAG answer was found/resolved
  if (chromaFailed || !finalChunks.length || (answer && answer.trim().toLowerCase() === "i don't know") || answer === "I could not find an answer in the textbook.") {
    usedFilter = chromaFailed ? "fallback_chroma_failed" : "fallback_no_context";
    
    const prompt = `
You are a school tutor.
Answer the student's question in a simple, clear, student-friendly way.

Guidelines:
- DO NOT use or include any emojis (such as smiley faces, symbols, or illustrative icons) in your response under any circumstances.

Question:
${question}

Answer:
`;

    const result = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
    });
    
    const usage = result.usageMetadata || {};
    tokensUsed = usage.totalTokenCount || tokensUsed;
    answer =
      result.text ||
      result?.candidates?.[0]?.content?.parts?.map((p) => p.text).join("") ||
      "";
  }

  // 🔹 Log AI usage
  const log = await AiChatLog.create({
    user_id: userId,
    user_query: question,
    ai_response: answer,
    tokens_used: tokensUsed,
    model_used: GEMINI_MODEL,
    ai_type: chromaFailed || !finalChunks.length ? "chat" : "rag",
    class_level: classLevel ?? null,
  });

  // 🔹 Deduct tokens (only if tokens used)
  if (tokensUsed > 0) {
    await deductTokens({
      userId,
      amount: tokensUsed,
      reason: "rag",
      refId: log.id,
    });
  }

  return {
    answer,
    sources: formatRagSources(finalMetadatas),
    source_type: finalChunks.length ? "rag" : "fallback",
    filters_used: usedFilter,
  };
}
