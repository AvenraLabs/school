import { getAiClient, getEmbeddingModel } from "../shared/aiClient.js";

/**
 * Batches embedding requests to Gemini API using gemini-embedding-001.
 */
export async function embedChunks(texts, batchSize = 20) {
  if (!Array.isArray(texts) || texts.length === 0) return [];

  const ai = getAiClient();
  const EMBEDDING_MODEL = getEmbeddingModel();
  const allEmbeddings = [];

  for (let i = 0; i < texts.length; i += batchSize) {
    const batch = texts.slice(i, i + batchSize);

    try {
      const batchPromises = batch.map(async (text) => {
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
      });

      const batchResults = await Promise.all(batchPromises);
      allEmbeddings.push(...batchResults);
    } catch (e) {
      console.error(`[embedChunks] Error embedding batch starting at index ${i}:`, e.message);
      for (const text of batch) {
        try {
          const single = await ai.models.embedContent({
            model: EMBEDDING_MODEL,
            contents: text,
          });
          allEmbeddings.push(single.embedding?.values || []);
        } catch (err) {
          console.error(`[embedChunks] Single fallback failed:`, err.message);
          allEmbeddings.push([]);
        }
      }
    }
  }

  return allEmbeddings;
}
