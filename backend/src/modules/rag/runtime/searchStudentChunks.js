import { getAiClient, getEmbeddingModel } from "../shared/aiClient.js";
import { getOrGetCollection } from "../ingest/storeChunks.js";

export async function searchStudentChunks({ question, board, grade, subject, limit = 5 }) {
  if (!question) return { chunks: [], metadatas: [] };

  const collection = await getOrGetCollection();
  const ai = getAiClient();
  const EMBEDDING_MODEL = getEmbeddingModel();

  const embRes = await ai.models.embedContent({
    model: EMBEDDING_MODEL,
    contents: question,
  });

  const queryVector =
    embRes.embedding?.values ||
    embRes.embeddings?.[0]?.values ||
    embRes.values ||
    [];

  if (!queryVector || queryVector.length === 0) {
    return { chunks: [], metadatas: [] };
  }

  const whereConditions = [];

  if (board) {
    whereConditions.push({ board: { $eq: String(board).toUpperCase() } });
  }
  if (grade) {
    whereConditions.push({ grade: { $eq: String(grade) } });
  }
  if (subject) {
    whereConditions.push({ subject: { $eq: String(subject) } });
  }

  let where = undefined;
  if (whereConditions.length === 1) {
    where = whereConditions[0];
  } else if (whereConditions.length > 1) {
    where = { $and: whereConditions };
  }

  try {
    const results = await collection.query({
      queryEmbeddings: [queryVector],
      nResults: limit,
      where,
    });

    const chunks = (results.documents || []).flat();
    const metadatas = (results.metadatas || []).flat();

    return { chunks, metadatas };
  } catch (e) {
    console.error("[searchStudentChunks] ChromaDB query error:", e.message);
    try {
      const fallbackWhere = grade ? { grade: { $eq: String(grade) } } : undefined;
      const results = await collection.query({
        queryEmbeddings: [queryVector],
        nResults: limit,
        where: fallbackWhere,
      });

      return {
        chunks: (results.documents || []).flat(),
        metadatas: (results.metadatas || []).flat(),
      };
    } catch (err) {
      return { chunks: [], metadatas: [] };
    }
  }
}
