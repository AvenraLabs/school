import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

let aiClientInstance = null;

export function getAiClient() {
  if (!aiClientInstance) {
    const isVertex = process.env.USE_VERTEX_AI === "true" || (!process.env.GEMINI_API_KEY && process.env.USE_VERTEX_AI !== "false");
    const project = process.env.GCP_PROJECT || process.env.VERTEX_PROJECT || "project-d2ca0237-4057-4b38-b48";
    const location = process.env.GCP_LOCATION || process.env.VERTEX_LOCATION || "us-central1";
    const apiKey = process.env.GEMINI_API_KEY;

    if (isVertex) {
      console.log(`[getAiClient] Initializing GoogleGenAI in Vertex AI mode (Project: ${project}, Location: ${location})`);
      aiClientInstance = new GoogleGenAI({
        vertexai: true,
        project,
        location,
      });
    } else if (apiKey) {
      console.log("[getAiClient] Initializing GoogleGenAI with GEMINI_API_KEY");
      aiClientInstance = new GoogleGenAI({ apiKey });
    } else {
      console.warn("[getAiClient] Initializing GoogleGenAI in Vertex AI fallback mode.");
      aiClientInstance = new GoogleGenAI({
        vertexai: true,
        project: "project-d2ca0237-4057-4b38-b48",
        location: "us-central1",
      });
    }
  }
  return aiClientInstance;
}

export function getGeminiModel() {
  return (process.env.GEMINI_MODEL || "gemini-2.5-flash-lite").replace(/^models\//, "");
}

export function getEmbeddingModel() {
  return process.env.GEMINI_EMBEDDING_MODEL || process.env.GEMINI_EMBED_MODEL || "text-embedding-004";
}


