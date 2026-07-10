import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Deletes a local file from the uploads folder if it exists.
 * Handles relative urls starting with /uploads/ or absolute urls.
 * @param {string} fileUrl - The url of the file to delete
 */
export function deleteLocalFile(fileUrl) {
  if (!fileUrl) return;

  // Ignore base64 data strings
  if (fileUrl.startsWith("data:")) return;

  try {
    let relativePath = "";

    if (fileUrl.startsWith("/uploads/")) {
      relativePath = fileUrl;
    } else if (fileUrl.startsWith("http://") || fileUrl.startsWith("https://")) {
      try {
        const parsedUrl = new URL(fileUrl);
        if (parsedUrl.pathname.startsWith("/uploads/")) {
          relativePath = parsedUrl.pathname;
        }
      } catch {
        // Fallback if URL parsing fails
      }
    }

    if (relativePath) {
      // Resolve path relative to backend root directory
      // backend/src/shared/utils/fileCleanup.js -> root is 4 levels up: ../../../../
      const absolutePath = path.resolve(__dirname, "../../../..", relativePath.substring(1));
      
      if (fs.existsSync(absolutePath)) {
        fs.unlink(absolutePath, (err) => {
          if (err) {
            console.error(`Failed to delete local file: ${absolutePath}`, err);
          } else {
            console.log(`Successfully deleted local file: ${absolutePath}`);
          }
        });
      }
    }
  } catch (error) {
    console.error(`Error in deleteLocalFile:`, error);
  }
}
