import express from "express";
import { protect } from "../../shared/middlewares/auth.js";
import { allowRoles } from "../../shared/middlewares/role.js";
import { validate } from "../../shared/middlewares/validate.js";
import * as schema from "./transport.schema.js";
import * as controller from "./transport.controller.js";

const router = express.Router();

router.use(protect);

/* ==========================================
   1️⃣ ADMIN ONLY: DRIVERS & VEHICLES CRUD
   ========================================== */

// Drivers
router.get(
  "/admin/transport/drivers",
  allowRoles("school_admin"),
  controller.listDrivers
);

router.post(
  "/admin/transport/drivers",
  allowRoles("school_admin"),
  validate(schema.createDriverSchema),
  controller.createDriver
);

router.put(
  "/admin/transport/drivers/:id",
  allowRoles("school_admin"),
  validate(schema.updateDriverSchema),
  controller.updateDriver
);

router.delete(
  "/admin/transport/drivers/:id",
  allowRoles("school_admin"),
  controller.deleteDriver
);

// Vehicles
router.get(
  "/admin/transport/vehicles",
  allowRoles("school_admin"),
  controller.listVehicles
);

router.post(
  "/admin/transport/vehicles",
  allowRoles("school_admin"),
  validate(schema.createVehicleSchema),
  controller.createVehicle
);

router.put(
  "/admin/transport/vehicles/:id",
  allowRoles("school_admin"),
  validate(schema.updateVehicleSchema),
  controller.updateVehicle
);

router.delete(
  "/admin/transport/vehicles/:id",
  allowRoles("school_admin"),
  controller.deleteVehicle
);

// Student Assignment
router.get(
  "/admin/transport/assignments",
  allowRoles("school_admin"),
  controller.listAssignments
);

router.post(
  "/admin/transport/assignments",
  allowRoles("school_admin"),
  validate(schema.assignStudentSchema),
  controller.assignStudent
);

router.delete(
  "/admin/transport/assignments/:student_id",
  allowRoles("school_admin"),
  controller.unassignStudent
);

// Admin Requests List & Processing
router.get(
  "/admin/transport/requests",
  allowRoles("school_admin"),
  controller.listRequests
);

router.post(
  "/admin/transport/requests/:id/:action",
  allowRoles("school_admin"),
  validate(schema.processRequestSchema),
  controller.processRequest
);

// Admin Dashboard Stats & Trip History
router.get(
  "/admin/transport/dashboard-stats",
  allowRoles("school_admin"),
  controller.getDashboardStats
);

router.get(
  "/admin/transport/trips",
  allowRoles("school_admin"),
  controller.listTrips
);

/* ==========================================
   2️⃣ DRIVER ONLY: START/STOP TRIP & GPS
   ========================================== */
router.get(
  "/driver/transport/vehicle",
  allowRoles("driver"),
  controller.getDriverVehicle
);

router.post(
  "/driver/transport/trips/start",
  allowRoles("driver"),
  validate(schema.startTripSchema),
  controller.startTrip
);

router.post(
  "/driver/transport/trips/:id/stop",
  allowRoles("driver"),
  controller.stopTrip
);

router.post(
  "/driver/transport/trips/:id/location",
  allowRoles("driver"),
  validate(schema.postLocationSchema),
  controller.postLocation
);

/* ==========================================
   3️⃣ PARENT ONLY: LIVE GPS & REQUESTS
   ========================================== */
router.get(
  "/parent/transport/students/:student_id",
  allowRoles("parent"),
  controller.getParentStudentTransport
);

router.get(
  "/parent/transport/trips/:id/location",
  allowRoles("parent", "school_admin"),
  controller.getParentTripLocation
);

router.post(
  "/parent/transport/requests",
  allowRoles("parent"),
  validate(schema.createRequestSchema),
  controller.createRequest
);

router.get(
  "/parent/transport/vehicles",
  allowRoles("parent"),
  controller.getParentVehicles
);

/* ==========================================
   4️⃣ STUDENT/TEACHER: READ ONLY DETAILS
   ========================================== */
router.get(
  "/student/transport/me",
  allowRoles("student"),
  controller.getStudentTransportDetails
);

router.get(
  "/teacher/transport/students",
  allowRoles("teacher"),
  controller.getTeacherClassTransport
);

export default router;
