import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

let aiClientInstance = null;

export function getAiClient() {
  if (!aiClientInstance) {
    const isVertex = process.env.USE_VERTEX_AI === "true" || !!process.env.GCP_PROJECT || !!process.env.VERTEX_PROJECT;
    const project = process.env.GCP_PROJECT || process.env.VERTEX_PROJECT;
    const location = process.env.GCP_LOCATION || process.env.VERTEX_LOCATION || "us-central1";
    const apiKey = process.env.GEMINI_API_KEY;

    if (isVertex) {
      if (!project) {
        throw new Error(
          "[getAiClient] Vertex AI mode is enabled, but GCP_PROJECT (or VERTEX_PROJECT) is missing in environment variables. Please set GCP_PROJECT in your .env file."
        );
      }
      console.log(`[getAiClient] Initializing GoogleGenAI in Enterprise Vertex AI mode (Project: ${project}, Location: ${location})`);
      
      const vertexConfig = {
        vertexai: true,
        project,
        location,
      };

      // Support explicit Service Account JSON credentials file path if configured
      if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
        console.log(`[getAiClient] Using Service Account Key: ${process.env.GOOGLE_APPLICATION_CREDENTIALS}`);
      }

      aiClientInstance = new GoogleGenAI(vertexConfig);
    } else if (apiKey) {
      console.log("[getAiClient] Initializing GoogleGenAI with GEMINI_API_KEY");
      aiClientInstance = new GoogleGenAI({ apiKey });
    } else {
      throw new Error(
        "[getAiClient] Missing AI configuration. Set USE_VERTEX_AI=true with GCP_PROJECT in .env for Enterprise GCP Vertex AI, or set GEMINI_API_KEY."
      );
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
