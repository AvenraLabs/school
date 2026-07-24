import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

let aiClientInstance = null;

export function getAiClient() {
  if (!aiClientInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("[getAiClient] GEMINI_API_KEY is not defined in environment variables!");
    }
    aiClientInstance = new GoogleGenAI({ apiKey: apiKey || "" });
  }
  return aiClientInstance;
}

export function getGeminiModel() {
  return (process.env.GEMINI_MODEL || "gemini-2.5-flash-lite").replace(/^models\//, "");
}

export function getEmbeddingModel() {
  return process.env.GEMINI_EMBEDDING_MODEL || "gemini-embedding-001";
}
