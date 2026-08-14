import { ChromaClient } from "chromadb";

const CHROMA_URL = process.env.CHROMA_URL || "http://localhost:8000";
const KNOWN_COLLECTIONS = ["textbook_chunks", "cbse_books"];

let chromaClientInstance = null;
function getChromaClient() {
  if (!chromaClientInstance) {
    const chromaUrl = new URL(
      CHROMA_URL.startsWith("http") ? CHROMA_URL : `http://${CHROMA_URL}`
    );
    chromaClientInstance = new ChromaClient({
      host: chromaUrl.hostname,
      port: chromaUrl.port
        ? Number(chromaUrl.port)
        : chromaUrl.protocol === "https:"
        ? 443
        : 80,
      ssl: chromaUrl.protocol === "https:",
    });
  }
  return chromaClientInstance;
}

// In-Memory Curriculum Tree Cache: { [board]: { [grade]: { [subject]: [chapters] } } }
let curriculumIndex = null;
let lastIndexFetchTime = 0;
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

/**
 * Standard default subjects per grade (fallback if ChromaDB is completely empty for a grade)
 */
function getDefaultSubjects(gradeNum) {
  if (gradeNum >= 1 && gradeNum <= 5) {
    return ["Mathematics", "Environmental Studies (EVS)", "English", "Hindi"];
  } else if (gradeNum >= 6 && gradeNum <= 10) {
    return ["Mathematics", "Science", "Social Science", "English", "Hindi"];
  } else {
    return [
      "Physics",
      "Chemistry",
      "Mathematics",
      "Biology",
      "Computer Science",
      "English Core",
      "Accountancy",
      "Economics",
      "Business Studies",
    ];
  }
}

/**
 * Builds or refreshes the in-memory curriculum catalog directly from ChromaDB collections.
 */
export async function buildCurriculumIndex(forceRefresh = false) {
  const now = Date.now();
  if (!forceRefresh && curriculumIndex && now - lastIndexFetchTime < CACHE_TTL_MS) {
    return curriculumIndex;
  }

  const client = getChromaClient();
  const newIndex = { CBSE: {}, STATE: {} };

  try {
    for (const colName of KNOWN_COLLECTIONS) {
      try {
        const collection = await client.getCollection({ name: colName });
        if (!collection) continue;

        // Fetch metadatas of ingested books
        const data = await collection.get({
          limit: 1000,
          include: ["metadatas"],
        });

        const metadatas = data?.metadatas || [];
        for (const meta of metadatas) {
          if (!meta) continue;

          // Normalize board
          const rawBoard = String(meta.board || meta.syllabus || "CBSE").toUpperCase().trim();
          const board = rawBoard.includes("STATE") ? "STATE" : "CBSE";

          // Normalize grade standard
          const gradeNum = String(meta.grade || meta.class || "6").replace(/\D/g, "") || "6";

          // Normalize subject
          const rawSubject = String(meta.subject || "").trim();
          if (!rawSubject) continue;
          const subject =
            rawSubject.charAt(0).toUpperCase() + rawSubject.slice(1).toLowerCase();

          // Normalize chapter
          const chapNum =
            parseInt(String(meta.chapter || "").replace(/\D/g, ""), 10) || 1;
          const rawTitle = String(meta.chapterTitle || meta.chapter || "").trim();
          const cleanTitle =
            rawTitle.replace(/^(chapter|unit|chap|ch)\s*\d+[:\s\-\.]*/i, "").trim() ||
            rawTitle ||
            `Chapter ${chapNum}`;

          // Ensure hierarchy exists
          if (!newIndex[board]) newIndex[board] = {};
          if (!newIndex[board][gradeNum]) newIndex[board][gradeNum] = {};
          if (!newIndex[board][gradeNum][subject]) newIndex[board][gradeNum][subject] = [];

          // Add chapter if not already in list
          const existingList = newIndex[board][gradeNum][subject];
          const exists = existingList.some(
            (c) => c.number === chapNum || c.title.toLowerCase() === cleanTitle.toLowerCase()
          );

          if (!exists) {
            existingList.push({
              number: chapNum,
              title: cleanTitle,
              label: cleanTitle,
            });
          }
        }
      } catch (colErr) {
        // Collection might not exist yet; ignore safely
      }
    }

    // Sort chapters numerically
    for (const b of Object.keys(newIndex)) {
      for (const g of Object.keys(newIndex[b])) {
        for (const s of Object.keys(newIndex[b][g])) {
          newIndex[b][g][s].sort((a, b) => (a.number || 0) - (b.number || 0));
        }
      }
    }

    curriculumIndex = newIndex;
    lastIndexFetchTime = now;
  } catch (err) {
    console.warn("[curriculum-cache] Index build notice:", err.message);
    if (!curriculumIndex) {
      curriculumIndex = newIndex;
    }
  }

  return curriculumIndex;
}

/**
 * Invalidate cache on book ingestion
 */
export function invalidateCurriculumCache() {
  curriculumIndex = null;
  lastIndexFetchTime = 0;
}

/**
 * Returns available subjects for a board + grade
 */
export async function getAvailableSubjects(board = "CBSE", grade = "10") {
  const index = await buildCurriculumIndex();
  const cleanBoard = String(board || "CBSE").toUpperCase().trim().includes("STATE")
    ? "STATE"
    : "CBSE";
  const gradeNum = parseInt(String(grade).replace(/\D/g, ""), 10) || 6;

  const subjectsInChroma = index[cleanBoard]?.[String(gradeNum)]
    ? Object.keys(index[cleanBoard][String(gradeNum)]).sort()
    : [];

  if (subjectsInChroma.length > 0) {
    return subjectsInChroma;
  }

  return getDefaultSubjects(gradeNum);
}

/**
 * Returns available chapters for a board + grade + subject
 */
export async function getAvailableChapters(board = "CBSE", grade = "10", subject = "Science") {
  const index = await buildCurriculumIndex();
  const cleanBoard = String(board || "CBSE").toUpperCase().trim().includes("STATE")
    ? "STATE"
    : "CBSE";
  const gradeNum = parseInt(String(grade).replace(/\D/g, ""), 10) || 6;
  const cleanSubject = String(subject || "").trim();

  // Try exact match or case-insensitive match
  const gradeSubjects = index[cleanBoard]?.[String(gradeNum)] || {};
  let chapters = gradeSubjects[cleanSubject] || [];

  if (chapters.length === 0) {
    const matchedKey = Object.keys(gradeSubjects).find(
      (k) => k.toLowerCase() === cleanSubject.toLowerCase()
    );
    if (matchedKey) {
      chapters = gradeSubjects[matchedKey] || [];
    }
  }

  return chapters;
}

/**
 * Returns distinct grades that have ingested books
 */
export async function getAvailableGrades(board = "CBSE") {
  const index = await buildCurriculumIndex();
  const cleanBoard = String(board || "CBSE").toUpperCase().trim().includes("STATE")
    ? "STATE"
    : "CBSE";

  const grades = Object.keys(index[cleanBoard] || {})
    .map((g) => parseInt(g, 10))
    .filter((g) => !isNaN(g))
    .sort((a, b) => a - b);

  if (grades.length > 0) {
    return grades;
  }

  return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
}
