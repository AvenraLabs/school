import { getAiClient, getEmbeddingModel } from "../shared/aiClient.js";

export async function embedChunks(texts, batchSize = 30) {
  if (!Array.isArray(texts) || texts.length === 0) return [];

  const ai = getAiClient();
  const EMBEDDING_MODEL = getEmbeddingModel();
  const allEmbeddings = [];
  const totalBatches = Math.ceil(texts.length / batchSize);

  // Helper to embed a batch of texts in a single API call with retry/backoff & jitter
  async function embedBatchWithRetry(batchTexts, batchLabel, retries = 3) {
    let lastError = null;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const res = await ai.models.embedContent({
          model: EMBEDDING_MODEL,
          contents: batchTexts,
        });

        // Extract array of embeddings matching the input batch order
        let results = [];
        if (res.embeddings && Array.isArray(res.embeddings)) {
          results = res.embeddings.map((e) => e.values || []);
        } else if (res.embedding?.values) {
          results = [res.embedding.values];
        } else if (res.values) {
          results = [res.values];
        }

        // Verify count matches batch input count exactly
        if (results.length !== batchTexts.length) {
          throw new Error(
            `Embedding count mismatch in Batch ${batchLabel}: expected ${batchTexts.length} embeddings but received ${results.length}`
          );
        }

        return results;
      } catch (err) {
        lastError = err;
        const errMsg = err.message || JSON.stringify(err);
        const isRateLimit =
          err.status === 429 ||
          /resource exhausted|rate limit|quota exceeded/i.test(errMsg);

        if (isRateLimit && attempt < retries) {
          // Parse explicit retry delay if returned by Gemini (e.g. "retry in 14s" or "retryDelay":"14s")
          let waitMs = 15000 * Math.pow(2, attempt); // Default exponential backoff: 15s, 30s, 60s
          const match =
            errMsg.match(/retry in (\d+)\s*s/i) ||
            errMsg.match(/retryDelay"?\s*:\s*"?(\d+)s/i) ||
            errMsg.match(/retry after (\d+)\s*s/i);

          if (match && match[1]) {
            waitMs = (parseInt(match[1], 10) + 1) * 1000;
          }

          // Add random jitter (0 - 1000ms) to prevent simultaneous worker wake-ups
          const jitter = Math.floor(Math.random() * 1000);
          const totalWaitMs = waitMs + jitter;

          console.warn(
            `[embedChunks] Gemini 429 Rate limit hit on Batch ${batchLabel}. Waiting ${Math.round(
              totalWaitMs / 1000
            )}s before retry (Attempt ${attempt + 1}/${retries})...`
          );
          await new Promise((resolve) => setTimeout(resolve, totalWaitMs));
        } else if (!isRateLimit) {
          // Fail fast on non-rate-limit errors
          throw new Error(`[embedChunks] Non-retryable embedding error in Batch ${batchLabel}: ${err.message}`);
        }
      }
    }

    // If retries exhausted, throw error to abort ingestion safely
    throw new Error(
      `[embedChunks] Failed to embed Batch ${batchLabel} (${batchTexts.length} chunks) after ${retries} retries: ${lastError?.message}`
    );
  }

  // Process texts in batches of batchSize (30 chunks per request)
  for (let i = 0; i < texts.length; i += batchSize) {
    const batchIndex = Math.floor(i / batchSize) + 1;
    const batchLabel = `${batchIndex}/${totalBatches}`;
    const batchTexts = texts.slice(i, i + batchSize);

    console.log(
      `[embedChunks] Embedding Batch ${batchLabel} (${batchTexts.length} chunks in 1 API call)...`
    );

    const batchResults = await embedBatchWithRetry(batchTexts, batchLabel);
    allEmbeddings.push(...batchResults);

    // 1000ms pause between batch API requests for safe rate limit headroom
    if (i + batchSize < texts.length) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  if (allEmbeddings.length !== texts.length) {
    throw new Error(
      `[embedChunks] Final embeddings count mismatch: expected ${texts.length}, got ${allEmbeddings.length}`
    );
  }

  return allEmbeddings;
}
