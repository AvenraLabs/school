/**
 * Cleans extracted textbook page text by removing repeated headers, footers,
 * standalone page numbers, duplicated spaces, and multiple blank lines.
 * Never modifies actual textbook wording.
 */
export function cleanText(pages) {
  if (!Array.isArray(pages)) return [];

  // Identify lines that appear on >60% of pages (headers/footers)
  const lineFrequency = {};
  const totalPages = pages.length;

  for (const p of pages) {
    const lines = (p.text || "").split("\n");
    const uniqueLines = new Set(lines.map((l) => l.trim().toLowerCase()));
    for (const line of uniqueLines) {
      if (line.length > 5) {
        lineFrequency[line] = (lineFrequency[line] || 0) + 1;
      }
    }
  }

  const repeatedHeadersFooters = new Set(
    Object.keys(lineFrequency).filter(
      (line) => lineFrequency[line] / totalPages > 0.6
    )
  );

  return pages.map((p) => {
    const rawLines = (p.text || "").split("\n");
    const cleanedLines = [];

    for (const rawLine of rawLines) {
      const trimmed = rawLine.trim();

      // Skip empty line duplicates later
      if (!trimmed) {
        cleanedLines.push("");
        continue;
      }

      // Remove standalone page numbers (e.g. "Page 12", "12", "- 12 -")
      if (/^(page\s*)?\d{1,3}$/i.test(trimmed) || /^-\s*\d{1,3}\s*-$/.test(trimmed)) {
        continue;
      }

      // Remove repeated header/footer text
      if (repeatedHeadersFooters.has(trimmed.toLowerCase())) {
        continue;
      }

      // Normalize duplicated inline spaces
      const normalizedLine = rawLine.replace(/[ \t]+/g, " ");
      cleanedLines.push(normalizedLine);
    }

    // Join and collapse multiple consecutive blank lines
    let cleanedText = cleanedLines.join("\n");
    cleanedText = cleanedText.replace(/\n{3,}/g, "\n\n").trim();

    return {
      pageNumber: p.pageNumber,
      text: cleanedText,
    };
  });
}
