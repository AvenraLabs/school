import { getAiClient, getEmbeddingModel } from "../shared/aiClient.js";

/**
 * Batches embedding requests to Gemini API using gemini-embedding-001.
 * Limits concurrency (max 5 at a time) and includes retries to prevent Gemini rate-limit failures.
 */
export async function embedChunks(texts, concurrency = 5) {
  if (!Array.isArray(texts) || texts.length === 0) return [];

  const ai = getAiClient();
  const EMBEDDING_MODEL = getEmbeddingModel();
  const allEmbeddings = [];

  // Helper to call embedContent with retries on 429 rate limit errors
  async function embedWithRetry(text, retries = 3, delayMs = 1000) {
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const res = await ai.models.embedContent({
          model: EMBEDDING_MODEL,
          contents: text,
        });

        return (
          res.embedding?.values ||
          res.embeddings?.[0]?.values ||
          res.values ||
          []
        );
      } catch (err) {
        const isRateLimit = err.status === 429 || /resource exhausted|rate limit/i.test(err.message);
        if (isRateLimit && attempt < retries) {
          const wait = delayMs * Math.pow(2, attempt);
          console.warn(`[embedChunks] Gemini rate limit hit. Retrying chunk in ${wait}ms (attempt ${attempt + 1}/${retries})...`);
          await new Promise((r) => setTimeout(r, wait));
        } else if (attempt === retries) {
          console.error(`[embedChunks] Failed to embed chunk after ${retries} retries:`, err.message);
          return [];
        } else {
          console.error(`[embedChunks] Embedding error:`, err.message);
          return [];
        }
      }
    }
    return [];
  }

  // Process in small batches of `concurrency` (5 at a time)
  for (let i = 0; i < texts.length; i += concurrency) {
    const chunkBatch = texts.slice(i, i + concurrency);
    const results = await Promise.all(
      chunkBatch.map((text) => embedWithRetry(text))
    );
    allEmbeddings.push(...results);

    // Subtle 100ms pause between batches to avoid spamming the API
    if (i + concurrency < texts.length) {
      await new Promise((r) => setTimeout(r, 100));
    }
  }

  return allEmbeddings;
}
