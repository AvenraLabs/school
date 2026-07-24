import fs from "fs";
import path from "path";
import axios from "axios";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Root project directory: backend/
const BACKEND_ROOT = path.resolve(__dirname, "../../../../");
const STORAGE_DIR = path.join(BACKEND_ROOT, "storage", "videos");

function slugify(text) {
  if (!text) return "general";
  return String(text)
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "_")
    .replace(/^-+|-+$/g, "");
}

/**
 * Downloads a video from Kling URL and saves it to local disk storage.
 * Directory structure: /storage/videos/class_{classId}/{subject_slug}/{topic_slug}/v{version}.mp4
 */
export async function downloadAndSaveVideo({ videoUrl, classId, subjectName, topic }) {
  try {
    const classFolder = `class_${classId || "all"}`;
    const subjectSlug = slugify(subjectName || "general");
    const topicSlug = slugify(topic || "video");

    const targetDir = path.join(STORAGE_DIR, classFolder, subjectSlug, topicSlug);
    fs.mkdirSync(targetDir, { recursive: true });

    // Determine version number (v1.mp4, v2.mp4...)
    let version = 1;
    while (fs.existsSync(path.join(targetDir, `v${version}.mp4`))) {
      version++;
    }

    const fileName = `v${version}.mp4`;
    const fullPath = path.join(targetDir, fileName);

    console.log(`[VideoStorage] Downloading video from Kling to: ${fullPath}...`);

    // Stream download
    const response = await axios({
      method: "GET",
      url: videoUrl,
      responseType: "stream",
      timeout: 120000,
    });

    const writer = fs.createWriteStream(fullPath);
    response.data.pipe(writer);

    await new Promise((resolve, reject) => {
      writer.on("finish", resolve);
      writer.on("error", reject);
    });

    console.log(`[VideoStorage] Download completed successfully: ${fileName}`);

    // Construct relative path and public URL
    const relativePath = path.relative(BACKEND_ROOT, fullPath).replace(/\\/g, "/");
    const publicUrl = `/storage/videos/${classFolder}/${subjectSlug}/${topicSlug}/${fileName}`;

    return {
      filePath: relativePath,
      publicUrl,
      fileName,
    };
  } catch (error) {
    console.error("[VideoStorage] Failed to download and store video:", error.message);
    throw error;
  }
}
