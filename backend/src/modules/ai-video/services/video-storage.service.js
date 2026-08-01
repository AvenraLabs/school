import { convertGsToPublicUrl } from "./google-video.service.js";

/**
 * Resolves cloud storage video URL and returns web-accessible URL and path metadata.
 */
export async function downloadAndSaveVideo({ videoUrl }) {
  const publicUrl = convertGsToPublicUrl(videoUrl);
  return {
    filePath: videoUrl,
    publicUrl: publicUrl,
    fileName: publicUrl.split("/").pop() || "video.mp4",
  };
}

