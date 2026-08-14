import { ChromaClient } from "chromadb";
import { getOrGetCollection } from "../ingest/storeChunks.js";
import { embedChunks } from "../ingest/embedChunks.js";

const CHROMA_URL = process.env.CHROMA_URL || "http://localhost:8000";
const KNOWN_COLLECTIONS = ["textbook_chunks", "cbse_books"];

/**
 * Helper to query all available Chroma collections (handling legacy cbse_books + textbook_chunks)
 */
async function queryChromaCollections(queryFn) {
  const primaryCol = await getOrGetCollection();
  try {
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
 * Metadata lookup & Hybrid Vector Search for Teacher AI.
 * Supports exact chapter retrieval OR semantic vector similarity search for custom topics.
 */
export async function getTeacherChapter({ board, grade, subject, chapter, chapters, topic }) {
  const isOther = (Array.isArray(chapters) && chapters.includes("other")) || chapter === "other";
  const searchTopic = (topic || "").trim();

  // Mode 1: Vector similarity search for custom topic
  if ((isOther || chapters?.length === 0) && searchTopic) {
    try {
      console.log(`[getTeacherChapter] Performing vector search for topic: "${searchTopic}" (${board} Grade ${grade} ${subject})`);
      const [queryVector] = await embedChunks([searchTopic]);

      const vectorWhereConditions = [];
      if (board) {
        const cleanBoard = String(board).toUpperCase();
        vectorWhereConditions.push({
          $or: [
            { board: { $eq: cleanBoard } },
            { syllabus: { $eq: cleanBoard } },
          ],
        });
      }
      if (grade) {
        const gradeNum = String(grade).replace(/\D/g, "");
        if (gradeNum) {
          vectorWhereConditions.push({
            $or: [
              { grade: { $eq: gradeNum } },
              { class: { $eq: gradeNum } },
              { grade: { $eq: `Class ${gradeNum}` } },
            ],
          });
        }
      }
      if (subject) {
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
        console.log(`[getTeacherChapter] Vector search found ${docs.length} relevant chunks for topic: "${searchTopic}"`);
        return {
          fullChapterText: docs.join("\n\n"),
          chunksCount: docs.length,
          chapterTitle: searchTopic,
        };
      }
    } catch (e) {
      console.warn(`[getTeacherChapter] Vector search warning: ${e.message}, falling back to metadata lookup`);
    }
  }

  // Mode 2: Standard metadata lookup by chapter number
  let chapterNumbers = [];
  if (Array.isArray(chapters) && chapters.length > 0) {
    chapterNumbers = chapters.map((c) => parseInt(c, 10)).filter((c) => !isNaN(c));
  } else if (chapter) {
    const nums = String(chapter).split(",").map((c) => parseInt(c.trim(), 10)).filter((c) => !isNaN(c));
    chapterNumbers = nums;
  }

  const whereConditions = [];

  if (board) {
    const cleanBoard = String(board).toUpperCase();
    whereConditions.push({
      $or: [
        { board: { $eq: cleanBoard } },
        { syllabus: { $eq: cleanBoard } },
      ],
    });
  }
  if (grade) {
    const gradeNum = String(grade).replace(/\D/g, "");
    if (gradeNum) {
      whereConditions.push({
        $or: [
          { grade: { $eq: gradeNum } },
          { class: { $eq: gradeNum } },
          { grade: { $eq: `Class ${gradeNum}` } },
        ],
      });
    }
  }
  if (subject) {
    whereConditions.push({
      $or: [
        { subject: { $eq: String(subject) } },
        { subject: { $eq: String(subject).toLowerCase() } },
      ],
    });
  }

  if (chapterNumbers.length === 1) {
    whereConditions.push({
      $or: [
        { chapter: { $eq: chapterNumbers[0] } },
        { chapter: { $eq: String(chapterNumbers[0]) } },
        { chapter: { $eq: `Chap-${chapterNumbers[0]}` } },
      ],
    });
  } else if (chapterNumbers.length > 1) {
    whereConditions.push({
      $or: chapterNumbers.map((num) => ({ chapter: { $eq: num } })),
    });
  }

  let where = undefined;
  if (whereConditions.length === 1) {
    where = whereConditions[0];
  } else if (whereConditions.length > 1) {
    where = { $and: whereConditions };
  }

  try {
    const searchResults = await queryChromaCollections(async (col) => {
      let res = await col.get({
        where,
        limit: 1500,
        include: ["documents", "metadatas"],
      });

      let docs = res?.documents || [];
      let metas = res?.metadatas || [];

      // Fallback: If specific chapter filter produced 0 docs, fallback to subject-level
      if (docs.length === 0 && chapterNumbers.length > 0) {
        const fallbackConditions = whereConditions.filter((c) => !c.$or?.some((item) => "chapter" in item));
        const fallbackWhere = fallbackConditions.length === 1 ? fallbackConditions[0] : fallbackConditions.length > 1 ? { $and: fallbackConditions } : undefined;
        res = await col.get({
          where: fallbackWhere,
          limit: 1500,
          include: ["documents", "metadatas"],
        });
        docs = res?.documents || [];
        metas = res?.metadatas || [];
      }

      return { docs, metas };
    });

    const docs = searchResults.docs || [];
    const metas = searchResults.metas || [];

    if (docs.length === 0) {
      return { fullChapterText: "", chunksCount: 0, chapterTitle: "" };
    }

    const items = [];
    let chapterTitle = "";

    for (let i = 0; i < docs.length; i++) {
      const meta = metas[i] || {};
      if (!chapterTitle && meta.chapterTitle) {
        chapterTitle = meta.chapterTitle;
      }
      items.push({
        text: docs[i],
        chunkOrder: meta.chunkOrder || i + 1,
      });
    }

    // Sort strictly by chunkOrder
    items.sort((a, b) => a.chunkOrder - b.chunkOrder);

    const fullChapterText = items.map((it) => it.text).join("\n\n");

    return {
      fullChapterText,
      chunksCount: items.length,
      chapterTitle,
    };
  } catch (e) {
    console.error("[getTeacherChapter] Metadata lookup error:", e.message);
    return { fullChapterText: "", chunksCount: 0, chapterTitle: "" };
  }
}
