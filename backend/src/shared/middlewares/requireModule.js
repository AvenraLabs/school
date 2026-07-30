import School from "../../modules/schools/school.model.js";
import AppError from "../appError.js";
import asyncHandler from "../asyncHandler.js";

/**
 * Middleware factory to enforce Super-Admin module toggles per school.
 * Returns HTTP 403 Forbidden if target module is disabled for user's school.
 * 
 * @param {string} moduleKey - transport | library | finance | ai_tutor | ai_tools | ai_video | whatsapp
 */
export function requireModuleEnabled(moduleKey) {
  return asyncHandler(async (req, res, next) => {
    // Super Admins bypass module restriction checks
    if (req.user?.role === "super_admin") {
      return next();
    }

    const schoolId = req.user?.school_id;
    if (!schoolId) {
      return next();
    }

    const school = await School.findByPk(schoolId, { attributes: ["id", "enabled_modules"] });
    if (!school) {
      return next();
    }

    const enabledModules = school.enabled_modules || {};
    // Default to true if key is unconfigured in legacy JSON
    const isEnabled = enabledModules[moduleKey] !== false;

    if (!isEnabled) {
      throw new AppError(`Module '${moduleKey}' is currently disabled for your school.`, 403);
    }

    next();
  });
}

export default requireModuleEnabled;
