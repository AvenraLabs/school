import { getAiClient, getGeminiModel } from "../shared/aiClient.js";

/**
 * Detects single vs multi-chapter structure in a PDF.
 */
export async function detectChapters({ filename, pages, subject }) {
  if (!pages || pages.length === 0) return [];

  const ai = getAiClient();
  const GEMINI_MODEL = getGeminiModel();

  const isSingleChapterFile =
    /^(chap|chapter)[-_\s]*\d+/i.test(filename) ||
    /^\d+[-_\s]/i.test(filename);

  // Case 1: Single Chapter PDF (e.g. Chap-4.pdf)
  if (isSingleChapterFile) {
    let chapterNumber = 1;
    let chapterTitle = subject || "Chapter";

    const match = filename.match(/\d+/);
    if (match) {
      chapterNumber = parseInt(match[0], 10);
    }

    const sampleText = pages.slice(0, 3).map((p) => p.text).join("\n").slice(0, 1500);
    const prompt = `
Extract the exact chapter number and chapter title from this textbook sample text.
Return ONLY valid JSON matching this schema:
{
  "chapterNumber": 1,
  "chapterTitle": "Chapter Title Here"
}

Sample Text:
${sampleText}
`;

    try {
      const response = await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: prompt,
      });

      const raw = response.text || "";
      const cleanedJson = raw.replace(/```json/g, "").replace(/```/g, "").trim();
      const parsed = JSON.parse(cleanedJson);
      if (parsed.chapterNumber) chapterNumber = parseInt(parsed.chapterNumber, 10);
      if (parsed.chapterTitle) chapterTitle = parsed.chapterTitle;
    } catch (e) {
      console.warn(`[detectChapters] Gemini single-chapter detection warning for ${filename}:`, e.message);
    }

    return [
      {
        chapterNumber,
        chapterTitle,
        startPage: 1,
        pages,
      },
    ];
  }

  // Case 2: Multi-chapter PDF - Always use Gemini for consistent title and chapter detection
  const chapterBoundaries = [];

  const tableOfContentsSample = pages
    .slice(0, 15)
    .map((p) => `[Page ${p.pageNumber}]\n${p.text.slice(0, 400)}`)
    .join("\n\n")
    .slice(0, 6000);

  const prompt = `
Analyze this textbook sample text and extract all chapter/unit titles, chapter numbers, and their starting page numbers.
Return ONLY a valid JSON array:
[
  {
    "chapterNumber": 1,
    "chapterTitle": "Chapter Title Here",
    "startPage": 1
  }
]

Sample Text:
${tableOfContentsSample}
`;

  try {
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
    });

    const raw = response.text || "";
    const cleanedJson = raw.replace(/```json/g, "").replace(/```/g, "").trim();
    const parsed = JSON.parse(cleanedJson);
    if (Array.isArray(parsed) && parsed.length > 0) {
      parsed.forEach((item, index) => {
        chapterBoundaries.push({
          chapterNumber: parseInt(item.chapterNumber, 10) || (index + 1),
          chapterTitle: String(item.chapterTitle || `Chapter ${item.chapterNumber || index + 1}`),
          startPage: parseInt(item.startPage, 10) || 1,
        });
      });
    }
  } catch (e) {
    console.warn(`[detectChapters] Gemini multi-chapter detection warning for ${filename}:`, e.message);
  }

  if (chapterBoundaries.length === 0) {
    return [
      {
        chapterNumber: 1,
        chapterTitle: subject || "Full Book",
        startPage: 1,
        pages,
      },
    ];
  }

  chapterBoundaries.sort((a, b) => a.startPage - b.startPage);

  const virtualChapters = [];
  for (let i = 0; i < chapterBoundaries.length; i++) {
    const current = chapterBoundaries[i];
    const nextStartPage = chapterBoundaries[i + 1] ? chapterBoundaries[i + 1].startPage : Infinity;

    const chapterPages = pages.filter(
      (p) => p.pageNumber >= current.startPage && p.pageNumber < nextStartPage
    );

    if (chapterPages.length > 0) {
      virtualChapters.push({
        chapterNumber: current.chapterNumber,
        chapterTitle: current.chapterTitle,
        startPage: current.startPage,
        pages: chapterPages,
      });
    }
  }

  return virtualChapters;
}
