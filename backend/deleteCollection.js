import dotenv from "dotenv";
import { ChromaClient } from "chromadb";

dotenv.config();

const CHROMA_URL = process.env.CHROMA_URL || "http://localhost:8000";
const chromaUrl = new URL(
  CHROMA_URL.startsWith("http") ? CHROMA_URL : `http://${CHROMA_URL}`
);

const client = new ChromaClient({
  host: chromaUrl.hostname,
  port: chromaUrl.port
    ? Number(chromaUrl.port)
    : chromaUrl.protocol === "https:"
    ? 443
    : 80,
  ssl: chromaUrl.protocol === "https:",
});

try {
  await client.deleteCollection({
    name: "textbook_chunks",
  });
  console.log("Deleted 'textbook_chunks' collection successfully.");
} catch (err) {
  console.log("Delete result:", err.message);
}

process.exit(0);
