import asyncHandler from "../../shared/asyncHandler.js";
import * as service from "./transport.service.js";
import * as whatsappService from "../whatsapp/whatsapp.service.js";

/* ==========================================
   1️⃣ ADMIN ONLY
   ========================================== */

export const listDrivers = asyncHandler(async (req, res) => {
  const result = await service.listDriversService({
    school_id: req.user.school_id,
    query: req.query,
  });
  res.json({
    success: true,
    total: result.count,
    data: result.rows,
  });
});

export const createDriver = asyncHandler(async (req, res) => {
  const result = await service.createDriverService({
    school_id: req.user.school_id,
    body: req.body,
  });
  res.status(201).json({
    success: true,
    data: result,
  });
});

export const updateDriver = asyncHandler(async (req, res) => {
  const result = await service.updateDriverService({
    school_id: req.user.school_id,
    id: Number(req.params.id),
    body: req.body,
  });
  res.json({
    success: true,
    data: result,
  });
});

export const deleteDriver = asyncHandler(async (req, res) => {
  await service.deleteDriverService({
    school_id: req.user.school_id,
    id: Number(req.params.id),
  });
  res.json({
    success: true,
    message: "Driver profile and login deleted successfully",
  });
});

export const listVehicles = asyncHandler(async (req, res) => {
  const result = await service.listVehiclesService({
    school_id: req.user.school_id,
    query: req.query,
  });
  res.json({
    success: true,
    total: result.count,
    data: result.rows,
  });
});

export const createVehicle = asyncHandler(async (req, res) => {
  const result = await service.createVehicleService({
    school_id: req.user.school_id,
    body: req.body,
  });
  res.status(201).json({
    success: true,
    data: result,
  });
});

export const updateVehicle = asyncHandler(async (req, res) => {
  const result = await service.updateVehicleService({
    school_id: req.user.school_id,
    id: Number(req.params.id),
    body: req.body,
  });
  res.json({
    success: true,
    data: result,
  });
});

export const deleteVehicle = asyncHandler(async (req, res) => {
  await service.deleteVehicleService({
    school_id: req.user.school_id,
    id: Number(req.params.id),
  });
  res.json({
    success: true,
    message: "Vehicle deleted successfully",
  });
});

export const listAssignments = asyncHandler(async (req, res) => {
  const result = await service.listAssignmentsService({
    school_id: req.user.school_id,
    query: req.query,
  });
  res.json({
    success: true,
    total: result.count,
    data: result.rows,
  });
});

export const assignStudent = asyncHandler(async (req, res) => {
  const result = await service.assignStudentService({
    school_id: req.user.school_id,
    body: req.body,
  });
  res.json({
    success: true,
    data: result,
  });
});

export const unassignStudent = asyncHandler(async (req, res) => {
  await service.unassignStudentService({
    school_id: req.user.school_id,
    student_id: Number(req.params.student_id),
  });
  res.json({
    success: true,
    message: "Student unassigned from vehicle",
  });
});

export const listRequests = asyncHandler(async (req, res) => {
  const result = await service.listRequestsService({
    school_id: req.user.school_id,
    query: req.query,
  });
  res.json({
    success: true,
    total: result.count,
    data: result.rows,
  });
});

export const processRequest = asyncHandler(async (req, res) => {
  const result = await service.processRequestService({
    school_id: req.user.school_id,
    user_id: req.user.id,
    id: Number(req.params.id),
    action: req.params.action,
    rejection_reason: req.body.rejection_reason,
  });
  res.json({
    success: true,
    data: result,
  });
});

/* ==========================================
   2️⃣ DRIVER ONLY
   ========================================== */

export const getDriverVehicle = asyncHandler(async (req, res) => {
  const result = await service.getDriverVehicleService({
    school_id: req.user.school_id,
    driver_id: req.user.driver_id,
  });
  res.json({
    success: true,
    data: result,
  });
});

export const getDriverActiveTrip = asyncHandler(async (req, res) => {
  const result = await service.getDriverActiveTripService({
    school_id: req.user.school_id,
    driver_id: req.user.driver_id,
  });
  res.json({
    success: true,
    data: result,
  });
});

export const getDriverProfile = asyncHandler(async (req, res) => {
  const result = await service.getDriverProfileService({
    school_id: req.user.school_id,
    driver_id: req.user.driver_id,
  });
  res.json({
    success: true,
    data: result,
  });
});

export const startTrip = asyncHandler(async (req, res) => {
  const result = await service.startTripService({
    school_id: req.user.school_id,
    driver_id: req.user.driver_id,
    body: req.body,
    io: req.io,
  });

  // Call WhatsApp service in the background
  whatsappService.sendBusTripStarted(req.body.vehicle_id).catch((err) =>
    console.error("WhatsApp bus trip started alert background error:", err)
  );

  res.json({
    success: true,
    data: result,
  });
});

export const stopTrip = asyncHandler(async (req, res) => {
  const result = await service.stopTripService({
    school_id: req.user.school_id,
    driver_id: req.user.driver_id,
    id: Number(req.params.id),
    io: req.io,
  });

  // Call WhatsApp service in the background
  if (result && result.vehicle_id) {
    whatsappService.sendBusTripEnded(result.vehicle_id).catch((err) =>
      console.error("WhatsApp bus trip ended alert background error:", err)
    );
  }

  res.json({
    success: true,
    data: result,
  });
});

export const postLocation = asyncHandler(async (req, res) => {
  const result = await service.postLocationService({
    school_id: req.user.school_id,
    driver_id: req.user.driver_id,
    trip_id: Number(req.params.id),
    body: req.body,
    io: req.io, // Passed from server.js middleware!
  });
  res.json({
    success: true,
    data: result,
  });
});

/* ==========================================
   3️⃣ STUDENT LIVE GPS & REQUESTS
   ========================================== */

export const getStudentTransport = asyncHandler(async (req, res) => {
  const result = await service.getStudentTransportService({
    school_id: req.user.school_id,
    student_id: Number(req.params.student_id),
  });
  res.json({
    success: true,
    data: result,
  });
});

export const getStudentTripLocation = asyncHandler(async (req, res) => {
  const result = await service.getStudentTripLocationService({
    school_id: req.user.school_id,
    trip_id: Number(req.params.id),
  });
  res.json({
    success: true,
    data: result,
  });
});

export const createRequest = asyncHandler(async (req, res) => {
  const result = await service.createRequestService({
    school_id: req.user.school_id,
    student_id: Number(req.body.student_id),
    body: req.body,
  });
  res.status(201).json({
    success: true,
    data: result,
  });
});

/* ==========================================
   4️⃣ READ ONLY DETAILS
   ========================================== */

export const getStudentTransportDetails = asyncHandler(async (req, res) => {
  const result = await service.getStudentTransportDetailsService({
    school_id: req.user.school_id,
    student_user_id: req.user.id,
  });
  res.json({
    success: true,
    data: result,
  });
});

export const getTeacherClassTransport = asyncHandler(async (req, res) => {
  const result = await service.getTeacherClassTransportService({
    school_id: req.user.school_id,
    teacher_user_id: req.user.id,
    query: req.query,
  });
  res.json({
    success: true,
    total: result.count,
    data: result.rows,
  });
});

export const getDashboardStats = asyncHandler(async (req, res) => {
  const result = await service.getDashboardStatsService({
    school_id: req.user.school_id,
  });
  res.json({
    success: true,
    data: result,
  });
});

export const listTrips = asyncHandler(async (req, res) => {
  const result = await service.listTripsService({
    school_id: req.user.school_id,
    query: req.query,
  });
  res.json({
    success: true,
    total: result.count,
    data: result.rows,
  });
});

export const getStudentVehicles = asyncHandler(async (req, res) => {
  const result = await service.listVehiclesService({
    school_id: req.user.school_id,
    query: { limit: 100 },
  });
  res.json({
    success: true,
    data: result.rows,
  });
});
