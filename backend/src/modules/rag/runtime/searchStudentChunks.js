import { getAiClient, getEmbeddingModel } from "../shared/aiClient.js";
import { getOrGetCollection } from "../ingest/storeChunks.js";

export async function searchStudentChunks({ question, board, grade, subject, limit = 5 }) {
  if (!question) return { chunks: [], metadatas: [] };

  let queryVector = [];
  try {
    const collection = await getOrGetCollection();
    const ai = getAiClient();
    const EMBEDDING_MODEL = getEmbeddingModel();

    const embRes = await ai.models.embedContent({
      model: EMBEDDING_MODEL,
      contents: question,
    });

    queryVector =
      embRes.embedding?.values ||
      embRes.embeddings?.[0]?.values ||
      embRes.values ||
      [];
  } catch (embErr) {
    console.warn("[searchStudentChunks] Embedding API call failed:", embErr.message || embErr);
    return { chunks: [], metadatas: [] };
  }

  if (!queryVector || queryVector.length === 0) {
    return { chunks: [], metadatas: [] };
  }

  const cleanGrade = grade ? String(grade).replace(/\D/g, "") || String(grade) : "";
  const cleanBoard = board ? String(board).toUpperCase().trim() : "";
  const cleanSubject = subject ? String(subject).trim() : "";

  // Build grade variants (e.g., "6", "class6", "class 6", "Class 6")
  const gradeVariants = Array.from(
    new Set([
      cleanGrade,
      `class${cleanGrade}`,
      `class ${cleanGrade}`,
      `Class ${cleanGrade}`,
      `grade${cleanGrade}`,
      `grade ${cleanGrade}`,
    ])
  ).filter(Boolean);

  // Build ChromaDB where conditions
  const whereConditions = [];

  if (cleanBoard) {
    if (cleanBoard.includes("STATE")) {
      whereConditions.push({
        $or: [
          { board: { $eq: "STATE" } },
          { board: { $eq: "STATEBOARD" } },
          { board: { $eq: "STATE BOARD" } },
        ],
      });
    } else {
      whereConditions.push({ board: { $eq: cleanBoard } });
    }
  }

  if (gradeVariants.length === 1) {
    whereConditions.push({ grade: { $eq: gradeVariants[0] } });
  } else if (gradeVariants.length > 1) {
    whereConditions.push({
      $or: gradeVariants.map((g) => ({ grade: { $eq: g } })),
    });
  }

  if (cleanSubject) {
    whereConditions.push({ subject: { $eq: cleanSubject } });
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

    let chunks = (results.documents || []).flat();
    let metadatas = (results.metadatas || []).flat();

    // If exact filter yielded 0 results, retry with relaxed grade-only filter
    if ((!chunks || chunks.length === 0) && gradeVariants.length > 0) {
      const relaxedWhere =
        gradeVariants.length === 1
          ? { grade: { $eq: gradeVariants[0] } }
          : { $or: gradeVariants.map((g) => ({ grade: { $eq: g } })) };

      const fallbackResults = await collection.query({
        queryEmbeddings: [queryVector],
        nResults: limit,
        where: relaxedWhere,
      });

      chunks = (fallbackResults.documents || []).flat();
      metadatas = (fallbackResults.metadatas || []).flat();
    }

    return { chunks, metadatas };
  } catch (e) {
    console.error("[searchStudentChunks] ChromaDB query error:", e.message);
    try {
      const fallbackWhere = cleanGrade ? { grade: { $eq: cleanGrade } } : undefined;
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
