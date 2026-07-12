import api from "../../api/axios";
import cloudStorageService from "../../services/cloudStorage";
import { processImageForUpload } from "../../utils/imageUtils";

export const getMyProfile = (role) => {
  if (role === "student") return api.get("/students/me");
  if (role === "teacher") return api.get("/teachers/me");

  throw new Error("Unsupported role");
};

export const updateMyProfile = (role, data) => {
  if (role === "student") return api.post("/students/complete-profile", data);
  if (role === "teacher") return api.post("/teachers/complete-profile", data);

  throw new Error("Unsupported role");
};

export const completeProfileApi = (data) => {
  return updateMyProfile(data.role, data);
};

/**
 * Uploads profile picture using cloud storage service
 * @param {File} file - Image file to upload
 * @param {string} userId - User ID
 * @returns {Promise<string>} - Image URL
 */
export const uploadProfilePicture = async (file, userId) => {
  try {
    // Validate and process the image
    const processedImage = await processImageForUpload(file, {
      validation: {
        maxSizeInMB: 5,
        allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
      },
      compression: {
        maxWidth: 800,
        maxHeight: 800,
        quality: 0.8,
        outputFormat: 'image/jpeg'
      }
    });

    // Upload using cloud storage service
    const uploadResult = await cloudStorageService.uploadProfilePicture(processedImage, userId);

    return uploadResult.url;
  } catch (error) {
    throw new Error(`Profile picture upload failed: ${error.message}`);
  }
};

/**
 * Deletes profile picture using cloud storage service
 * @param {string} imageUrl - URL of image to delete
 * @returns {Promise<boolean>} - Success status
 */
export const deleteProfilePicture = async (imageUrl) => {
  try {
    await cloudStorageService.deleteImage(imageUrl);
    return true;
  } catch (error) {
    console.warn(`Profile picture delete failed: ${error.message}`);
    // Don't throw error for delete failures - just log and continue
    return false;
  }
};

/**
 * @deprecated Use uploadProfilePicture instead
 */
export const getAvatarUploadUrl = () => {
  throw new Error("Use uploadProfilePicture function instead");
};
