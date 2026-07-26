import { getOrGetCollection } from "../ingest/storeChunks.js";
import { embedChunks } from "../ingest/embedChunks.js";

/**
 * Metadata lookup & Vector Search for Teacher AI.
 * Supports exact chapter retrieval OR semantic vector similarity search for custom topics.
 */
export async function getTeacherChapter({ board, grade, subject, chapter, chapters, topic }) {
  const collection = await getOrGetCollection();

  const isOther = (Array.isArray(chapters) && chapters.includes("other")) || chapter === "other";
  const searchTopic = (topic || "").trim();

  // Vector similarity search path for custom topic ("other" or custom topic provided)
  if ((isOther || chapters?.length === 0) && searchTopic) {
    try {
      console.log(`[getTeacherChapter] Performing vector search for topic: "${searchTopic}" (${board} Grade ${grade} ${subject})`);
      const [queryVector] = await embedChunks([searchTopic]);

      const vectorWhereConditions = [];
      if (board) vectorWhereConditions.push({ board: { $eq: String(board).toUpperCase() } });
      if (grade) {
        const gradeNum = String(grade).replace(/\D/g, "");
        if (gradeNum) vectorWhereConditions.push({ grade: { $eq: gradeNum } });
      }
      if (subject) vectorWhereConditions.push({ subject: { $eq: String(subject) } });

      const vectorWhere = vectorWhereConditions.length === 1
        ? vectorWhereConditions[0]
        : vectorWhereConditions.length > 1
        ? { $and: vectorWhereConditions }
        : undefined;

      const searchResults = await collection.query({
        queryEmbeddings: [queryVector],
        nResults: 20,
        where: vectorWhere,
      });

      const docs = (searchResults.documents || []).flat();
      const metas = (searchResults.metadatas || []).flat();

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

  // Standard metadata lookup by chapter number
  let chapterNumbers = [];
  if (Array.isArray(chapters) && chapters.length > 0) {
    chapterNumbers = chapters.map((c) => parseInt(c, 10)).filter((c) => !isNaN(c));
  } else if (chapter) {
    const nums = String(chapter).split(",").map((c) => parseInt(c.trim(), 10)).filter((c) => !isNaN(c));
    chapterNumbers = nums;
  }

  const whereConditions = [];

  if (board) {
    whereConditions.push({ board: { $eq: String(board).toUpperCase() } });
  }
  if (grade) {
    const gradeNum = String(grade).replace(/\D/g, "");
    if (gradeNum) {
      whereConditions.push({ grade: { $eq: gradeNum } });
    }
  }
  if (subject) {
    whereConditions.push({ subject: { $eq: String(subject) } });
  }

  if (chapterNumbers.length === 1) {
    whereConditions.push({ chapter: { $eq: chapterNumbers[0] } });
  } else if (chapterNumbers.length > 1) {
    whereConditions.push({ chapter: { $in: chapterNumbers } });
  }

  let where = undefined;
  if (whereConditions.length === 1) {
    where = whereConditions[0];
  } else if (whereConditions.length > 1) {
    where = { $and: whereConditions };
  }

  try {
    let results = await collection.get({
      where,
      limit: 1500,
      include: ["documents", "metadatas"],
    });

    let docs = results?.documents || [];
    let metas = results?.metadatas || [];

    // Fallback: If specific chapter filter produced 0 docs (e.g. State Board single PDF whole book), fallback to subject-level metadata
    if (docs.length === 0 && chapterNumbers.length > 0) {
      const fallbackConditions = whereConditions.filter((cond) => !cond.chapter);
      const fallbackWhere = fallbackConditions.length === 1 ? fallbackConditions[0] : { $and: fallbackConditions };
      results = await collection.get({
        where: fallbackWhere,
        limit: 1500,
        include: ["documents", "metadatas"],
      });
      docs = results?.documents || [];
      metas = results?.metadatas || [];
    }

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
