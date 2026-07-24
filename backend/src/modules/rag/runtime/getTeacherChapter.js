import { getOrGetCollection } from "../ingest/storeChunks.js";

/**
 * Direct metadata lookup for Teacher AI.
 * Fetches all chunks for board, grade, subject, chapter(s) directly from ChromaDB.
 * Sorts by chunkOrder and merges into full chapter text context.
 */
export async function getTeacherChapter({ board, grade, subject, chapter, chapters }) {
  const collection = await getOrGetCollection();

  // Normalize chapters into array of numbers if provided
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
