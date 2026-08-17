import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

let aiClientInstance = null;

export function getAiClient() {
  if (!aiClientInstance) {
    const project = process.env.GCP_PROJECT;
    const location = process.env.GCP_LOCATION || "us-central1";
    
    // Safety check for Project ID
    if (!project) {
      throw new Error("GCP_PROJECT is missing. Please check your .env file.");
    }

    // Set internal SDK flag for Vertex AI optimization
    process.env.GOOGLE_GENAI_USE_ENTERPRISE = "true";

    aiClientInstance = new GoogleGenAI({
      vertexai: true,
      project,
      location,
    });
  }
  return aiClientInstance;
}

export function getGeminiModel(feature = "") {
  if (feature === "question_paper") {
    return (process.env.GEMINI_MODEL_QUESTION_PAPER || "gemini-2.5-flash").replace(/^models\//, "");
  }
  // Returns 'gemini-2.5-flash-lite' by default for other features
  return (process.env.GEMINI_MODEL || "gemini-2.5-flash-lite").replace(/^models\//, "");
}

export function getEmbeddingModel() {
  return process.env.GEMINI_EMBEDDING_MODEL || "text-embedding-004";
}
