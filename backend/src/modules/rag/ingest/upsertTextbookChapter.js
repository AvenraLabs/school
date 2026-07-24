import TextbookChapter from "../models/textbook-chapter.model.js";

/**
 * Upsert a chapter record into the textbook_chapters PostgreSQL table.
 * Called during ingestion, before chunk embedding.
 * 
 * Uses the unique constraint (board, grade, subject, chapter_number)
 * to safely re-run ingestion without creating duplicate rows.
 */
export async function upsertTextbookChapter({
  board,
  grade,
  subject,
  chapterNumber,
  chapterTitle,
  bookName = null,
}) {
  if (!board || !grade || !subject || !chapterNumber) {
    console.warn("[upsertTextbookChapter] Skipping — missing required fields:", { board, grade, subject, chapterNumber });
    return null;
  }

  const normalizedBoard = String(board).toUpperCase().trim();
  const normalizedGrade = parseInt(String(grade).replace(/\D/g, ""), 10);
  const normalizedSubject = String(subject).trim();
  const normalizedChapterNumber = parseInt(chapterNumber, 10);

  if (isNaN(normalizedGrade) || isNaN(normalizedChapterNumber)) {
    console.warn("[upsertTextbookChapter] Skipping — invalid grade or chapter number:", { grade, chapterNumber });
    return null;
  }

  try {
    const [record, created] = await TextbookChapter.findOrCreate({
      where: {
        board: normalizedBoard,
        grade: normalizedGrade,
        subject: normalizedSubject,
        chapter_number: normalizedChapterNumber,
      },
      defaults: {
        chapter_title: String(chapterTitle || `Chapter ${normalizedChapterNumber}`).trim(),
        book_name: bookName ? String(bookName).trim() : null,
      },
    });

    // Update chapter_title if it changed (e.g. Gemini extracted better title on re-ingest)
    if (!created && record.chapter_title !== chapterTitle && chapterTitle) {
      await record.update({
        chapter_title: String(chapterTitle).trim(),
        book_name: bookName ? String(bookName).trim() : record.book_name,
      });
    }

    return record;
  } catch (err) {
    // Non-fatal — ingestion continues even if PostgreSQL upsert fails
    console.error("[upsertTextbookChapter] PostgreSQL upsert failed:", err.message);
    return null;
  }
}
