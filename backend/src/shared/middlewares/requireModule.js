import AppError from "../appError.js";
import School from "../../modules/schools/school.model.js";

/**
 * Middleware to enforce school-level feature module licensing.
 * If the user's school has explicitly disabled `moduleKey`, requests are rejected with 403.
 * SuperAdmin is exempt and bypasses all module restrictions.
 */
export const requireModule = (moduleKey) => {
  return async (req, res, next) => {
    try {
      // SuperAdmin has full platform access
      if (req.user?.role === "super_admin") {
        return next();
      }

      const schoolId = req.user?.school_id;
      if (!schoolId) {
        return next(new AppError("No school associated with this account", 403));
      }

      const school = await School.findByPk(schoolId);
      if (!school) {
        return next(new AppError("School not found or inactive", 404));
      }

      const enabledModules = school.enabled_modules || {};

      // If module is explicitly set to false in the school's licensed module configuration
      if (enabledModules[moduleKey] === false) {
        return next(
          new AppError(
            `The '${moduleKey}' module is not licensed for your institution. Please contact your platform administrator.`,
            403
          )
        );
      }

      next();
    } catch (err) {
      next(err);
    }
  };
};

export const requireModuleEnabled = requireModule;
export default requireModule;
