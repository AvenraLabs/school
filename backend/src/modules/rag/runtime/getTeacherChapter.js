import { ChromaClient } from "chromadb";
import { getOrGetCollection } from "../ingest/storeChunks.js";
import { embedChunks } from "../ingest/embedChunks.js";
import { normalizeBoard } from "../shared/boardUtils.js";

const CHROMA_URL = process.env.CHROMA_URL || "http://localhost:8000";
const KNOWN_COLLECTIONS = ["textbook_chunks", "cbse_books"];

/**
 * Helper to query all available Chroma collections (handling legacy cbse_books + textbook_chunks)
 */
async function queryChromaCollections(queryFn) {
  try {
    const primaryCol = await getOrGetCollection();
    const res = await queryFn(primaryCol);
    if (res && res.docs && res.docs.length > 0) {
      return res;
    }
  } catch (e) {
    console.warn("[getTeacherChapter] Primary collection query note:", e.message);
  }

  // Fallback to other known collections
  const chromaUrl = new URL(
    CHROMA_URL.startsWith("http") ? CHROMA_URL : `http://${CHROMA_URL}`
  );
  const client = new ChromaClient({
    host: chromaUrl.hostname,
    port: chromaUrl.port ? Number(chromaUrl.port) : chromaUrl.protocol === "https:" ? 443 : 80,
    ssl: chromaUrl.protocol === "https:",
  });

  for (const colName of KNOWN_COLLECTIONS) {
    try {
      const col = await client.getCollection({ name: colName });
      if (col) {
        const res = await queryFn(col);
        if (res && res.docs && res.docs.length > 0) {
          return res;
        }
      }
    } catch {}
  }

  return { docs: [], metas: [] };
}

/**
 * RAG Vector Similarity Search for Teacher AI content generation.
 * Searches textbook chunks for the specified topic, filtered by canonical board, grade, and subject.
 *
 * @param {Object} params
 * @param {string} params.board - Board name (e.g. CBSE, State Board)
 * @param {string|number} params.grade - Class/Grade level (e.g. 10 or Class 10)
 * @param {string} params.subject - Subject name (e.g. Economics, Science)
 * @param {string} params.topic - Free-text topic / focus keywords
 * @returns {Promise<{ fullChapterText: string, chunksCount: number, chapterTitle: string }>}
 */
export async function getTeacherChapter({ board, grade, subject, topic }) {
  const searchTopic = (topic || "").trim();

  if (!searchTopic) {
    return { fullChapterText: "", chunksCount: 0, chapterTitle: "" };
  }

  try {
    const cleanBoard = normalizeBoard(board);
    const gradeNum = String(grade || "").replace(/\D/g, "");
    console.log(`[getTeacherChapter] Vector search for topic: "${searchTopic}" (${cleanBoard} Grade ${gradeNum || grade} ${subject || "All Subjects"})`);

    const [queryVector] = await embedChunks([searchTopic]);
    if (!queryVector || queryVector.length === 0) {
      console.warn(`[getTeacherChapter] Could not generate embedding vector for topic: "${searchTopic}"`);
      return { fullChapterText: "", chunksCount: 0, chapterTitle: searchTopic };
    }

    const vectorWhereConditions = [];

    if (cleanBoard) {
      vectorWhereConditions.push({
        $or: [
          { board: { $eq: cleanBoard } },
          { syllabus: { $eq: cleanBoard } },
          { board: { $eq: cleanBoard.toLowerCase() } },
        ],
      });
    }

    if (gradeNum) {
      vectorWhereConditions.push({
        $or: [
          { grade: { $eq: gradeNum } },
          { class: { $eq: gradeNum } },
          { grade: { $eq: `Class ${gradeNum}` } },
        ],
      });
    }

    if (subject && String(subject).toLowerCase() !== "general" && String(subject).toLowerCase() !== "other") {
      vectorWhereConditions.push({
        $or: [
          { subject: { $eq: String(subject) } },
          { subject: { $eq: String(subject).toLowerCase() } },
        ],
      });
    }

    const vectorWhere = vectorWhereConditions.length === 1
      ? vectorWhereConditions[0]
      : vectorWhereConditions.length > 1
      ? { $and: vectorWhereConditions }
      : undefined;

    const searchResults = await queryChromaCollections(async (col) => {
      const res = await col.query({
        queryEmbeddings: [queryVector],
        nResults: 20,
        where: vectorWhere,
      });
      return {
        docs: (res.documents || []).flat(),
        metas: (res.metadatas || []).flat(),
      };
    });

    const docs = searchResults.docs || [];
    if (docs.length > 0) {
      console.log(`[getTeacherChapter] Vector search retrieved ${docs.length} relevant chunks for topic: "${searchTopic}"`);
      return {
        fullChapterText: docs.join("\n\n"),
        chunksCount: docs.length,
        chapterTitle: searchTopic,
      };
    }

    // Fallback search without strict subject filter if subject was specific
    if (vectorWhereConditions.length > 1 && subject) {
      const relaxedConditions = vectorWhereConditions.filter((c) => !c.$or?.some((item) => "subject" in item));
      const relaxedWhere = relaxedConditions.length === 1 ? relaxedConditions[0] : relaxedConditions.length > 1 ? { $and: relaxedConditions } : undefined;

      const fallbackResults = await queryChromaCollections(async (col) => {
        const res = await col.query({
          queryEmbeddings: [queryVector],
          nResults: 15,
          where: relaxedWhere,
        });
        return {
          docs: (res.documents || []).flat(),
          metas: (res.metadatas || []).flat(),
        };
      });

      const fallbackDocs = fallbackResults.docs || [];
      if (fallbackDocs.length > 0) {
        console.log(`[getTeacherChapter] Relaxed vector search found ${fallbackDocs.length} chunks for topic: "${searchTopic}"`);
        return {
          fullChapterText: fallbackDocs.join("\n\n"),
          chunksCount: fallbackDocs.length,
          chapterTitle: searchTopic,
        };
      }
    }

    return { fullChapterText: "", chunksCount: 0, chapterTitle: searchTopic };
  } catch (e) {
    console.warn(`[getTeacherChapter] Vector search error: ${e.message}`);
    return { fullChapterText: "", chunksCount: 0, chapterTitle: searchTopic };
  }
}
