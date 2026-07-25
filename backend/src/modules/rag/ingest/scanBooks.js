import fs from "fs";
import path from "path";

const LANGUAGE_SUBJECTS = new Set(["english", "tamil", "hindi"]);

export function scanBooks(booksDir) {
  const results = [];

  if (!fs.existsSync(booksDir)) {
    console.error(`Books directory not found: ${booksDir}`);
    return results;
  }

  function walk(currentDir) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);

      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (entry.isFile() && entry.name.toLowerCase().endsWith(".pdf")) {
        // Resolve relative path from booksDir to extract board/grade/subject
        const relPath = path.relative(booksDir, fullPath).replace(/\\/g, "/");
        const parts = relPath.split("/");

        // Expected structure:
        // Case A: {board}/{grade}/{subject}/{filename.pdf}
        // Case B: {board}/{grade}/{filename.pdf} (where subject is derived from filename without .pdf)
        if (parts.length >= 3) {
          const board = parts[0];
          const grade = parts[1];
          const subject = parts[2].toLowerCase().endsWith(".pdf")
            ? parts[2].replace(/\.pdf$/i, "")
            : parts[2];
          
          const filename = parts[parts.length - 1];

          // Skip language textbooks per system requirement
          if (LANGUAGE_SUBJECTS.has(subject.toLowerCase().trim())) {
            console.log(`[RAG Ingest] Skipping language book: ${relPath}`);
            continue;
          }

          results.push({
            board,
            grade,
            subject,
            pdfPath: fullPath,
            filename,
            relPath,
          });
        }
      }
    }
  }

  walk(booksDir);
  return results;
}
