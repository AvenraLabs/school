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

  // Case 2: Multi-chapter PDF - Regex check first
  const chapterBoundaries = [];
  const chapterRegex = /^(chapter|unit|lesson)\s+(\d+|[ivxlcdm]+)[\s:]*(.*)$/im;

  for (const page of pages) {
    const lines = (page.text || "").split("\n");
    for (const line of lines.slice(0, 5)) {
      const match = line.trim().match(chapterRegex);
      if (match) {
        const numStr = match[2];
        const num = parseInt(numStr, 10) || chapterBoundaries.length + 1;
        const title = match[3].trim() || `Chapter ${num}`;
        
        if (!chapterBoundaries.some((b) => b.startPage === page.pageNumber)) {
          chapterBoundaries.push({
            chapterNumber: num,
            chapterTitle: title,
            startPage: page.pageNumber,
          });
        }
        break;
      }
    }
  }

  // If regex failed, call Gemini Flash Lite ONCE for PDF outline
  if (chapterBoundaries.length === 0) {
    const tableOfContentsSample = pages
      .slice(0, 10)
      .map((p) => `[Page ${p.pageNumber}]\n${p.text.slice(0, 300)}`)
      .join("\n\n")
      .slice(0, 4000);

    const prompt = `
Find all chapter headings and their start page numbers from this textbook sample text.
Return ONLY valid JSON array:
[
  {
    "chapterNumber": 1,
    "chapterTitle": "Title",
    "startPage": 5
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
        parsed.forEach((item) => {
          chapterBoundaries.push({
            chapterNumber: item.chapterNumber || chapterBoundaries.length + 1,
            chapterTitle: item.chapterTitle || `Chapter ${item.chapterNumber}`,
            startPage: item.startPage || 1,
          });
        });
      }
    } catch (e) {
      console.warn(`[detectChapters] Gemini multi-chapter detection fallback for ${filename}:`, e.message);
    }
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
