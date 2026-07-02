import { Op } from "sequelize";
import db from "../../config/db.js";
import Driver from "./driver.model.js";
import Vehicle from "./vehicle.model.js";
import StudentTransport from "./student-transport.model.js";
import Trip from "./trip.model.js";
import TripLocation from "./trip-location.model.js";
import TransportRequest from "./transport-request.model.js";
import User from "../users/user.model.js";
import Student from "../students/student.model.js";
import Teacher from "../teachers/teacher.model.js";
import TeacherAssignment from "../teacher-assignments/teacher-assignment.model.js";
import Class from "../classes/classes.model.js";
import Section from "../sections/section.model.js";
import AppError from "../../shared/appError.js";
import { getPagination } from "../../shared/utils/pagination.js";

/* ==========================================
   1️⃣ DRIVER ACTIONS (CRUD)
   ========================================== */

export const listDriversService = async ({ school_id, query }) => {
  const { limit, offset } = getPagination(query);
  return Driver.findAndCountAll({
    where: { school_id },
    include: [
      {
        model: User,
        attributes: ["id", "name", "username", "phone", "is_active"],
      },
    ],
    limit,
    offset,
    order: [["created_at", "DESC"]],
  });
};

export const createDriverService = async ({ school_id, body }) => {
  // Check if username already exists
  const existingUser = await User.findOne({
    where: { school_id, username: body.username },
  });
  if (existingUser) {
    throw new AppError("Username already exists in this school", 400);
  }

  const t = await db.transaction();
  try {
    const user = await User.create(
      {
        school_id,
        role: "driver",
        username: body.username,
        password: body.password, // Plain text matching auth service pattern
        name: body.name,
        phone: body.phone,
        first_login: false, // Bypass stepper for driver accounts
      },
      { transaction: t }
    );

    const driver = await Driver.create(
      {
        school_id,
        user_id: user.id,
        license_number: body.license_number,
      },
      { transaction: t }
    );

    await t.commit();
    return { user, driver };
  } catch (err) {
    await t.rollback();
    throw err;
  }
};

export const updateDriverService = async ({ school_id, id, body }) => {
  const driver = await Driver.findOne({
    where: { id, school_id },
  });
  if (!driver) throw new AppError("Driver profile not found", 404);

  const t = await db.transaction();
  try {
    if (body.license_number !== undefined) {
      await driver.update({ license_number: body.license_number }, { transaction: t });
    }
    if (body.is_active !== undefined) {
      await driver.update({ is_active: body.is_active }, { transaction: t });
    }

    const userUpdates = {};
    if (body.name !== undefined) userUpdates.name = body.name;
    if (body.phone !== undefined) userUpdates.phone = body.phone;
    if (body.is_active !== undefined) userUpdates.is_active = body.is_active;

    if (Object.keys(userUpdates).length > 0) {
      await User.update(userUpdates, {
        where: { id: driver.user_id },
        transaction: t,
      });
    }

    await t.commit();
    return driver;
  } catch (err) {
    await t.rollback();
    throw err;
  }
};

export const deleteDriverService = async ({ school_id, id }) => {
  const driver = await Driver.findOne({ where: { id, school_id } });
  if (!driver) throw new AppError("Driver not found", 404);

  const t = await db.transaction();
  try {
    await driver.destroy({ transaction: t });
    await User.destroy({ where: { id: driver.user_id }, transaction: t });
    await t.commit();
  } catch (err) {
    await t.rollback();
    throw err;
  }
};

/* ==========================================
   2️⃣ VEHICLE ACTIONS (CRUD)
   ========================================== */

export const listVehiclesService = async ({ school_id, query }) => {
  const { limit, offset } = getPagination(query);
  return Vehicle.findAndCountAll({
    where: { school_id },
    include: [
      {
        model: Driver,
        include: [{ model: User, attributes: ["id", "name", "phone"] }],
      },
    ],
    limit,
    offset,
    order: [["created_at", "DESC"]],
  });
};

export const createVehicleService = async ({ school_id, body }) => {
  // Check vehicle number unique per school
  const existing = await Vehicle.findOne({
    where: { school_id, vehicle_number: body.vehicle_number },
  });
  if (existing) {
    throw new AppError("Vehicle number already exists in this school", 400);
  }

  // Verify driver exists
  if (body.driver_id) {
    const driver = await Driver.findOne({ where: { id: body.driver_id, school_id } });
    if (!driver) throw new AppError("Assigned driver not found", 404);
  }

  return Vehicle.create({
    school_id,
    vehicle_number: body.vehicle_number,
    vehicle_name: body.vehicle_name,
    capacity: body.capacity,
    driver_id: body.driver_id || null,
  });
};

export const updateVehicleService = async ({ school_id, id, body }) => {
  const vehicle = await Vehicle.findOne({ where: { id, school_id } });
  if (!vehicle) throw new AppError("Vehicle not found", 404);

  if (body.driver_id) {
    const driver = await Driver.findOne({ where: { id: body.driver_id, school_id } });
    if (!driver) throw new AppError("Assigned driver not found", 404);
  }

  return vehicle.update({
    vehicle_number: body.vehicle_number !== undefined ? body.vehicle_number : vehicle.vehicle_number,
    vehicle_name: body.vehicle_name !== undefined ? body.vehicle_name : vehicle.vehicle_name,
    capacity: body.capacity !== undefined ? body.capacity : vehicle.capacity,
    driver_id: body.driver_id !== undefined ? body.driver_id : vehicle.driver_id,
    is_active: body.is_active !== undefined ? body.is_active : vehicle.is_active,
  });
};

export const deleteVehicleService = async ({ school_id, id }) => {
  const vehicle = await Vehicle.findOne({ where: { id, school_id } });
  if (!vehicle) throw new AppError("Vehicle not found", 404);
  return vehicle.destroy();
};

/* ==========================================
   3️⃣ ASSIGNMENTS & APPROVAL REQUESTS
   ========================================== */

export const listAssignmentsService = async ({ school_id, query }) => {
  const { limit, offset } = getPagination(query);
  return StudentTransport.findAndCountAll({
    where: { school_id },
    include: [
      {
        model: Student,
        include: [
          { model: User, attributes: ["id", "name"] },
          { model: Class, attributes: ["id", "class_name"] },
          { model: Section, attributes: ["id", "name"] },
        ],
      },
      {
        model: Vehicle,
      },
    ],
    limit,
    offset,
    order: [["created_at", "DESC"]],
  });
};

export const assignStudentService = async ({ school_id, body }) => {
  const student = await Student.findOne({ where: { id: body.student_id, school_id } });
  if (!student) throw new AppError("Student not found", 404);

  const vehicle = await Vehicle.findOne({ where: { id: body.vehicle_id, school_id } });
  if (!vehicle) throw new AppError("Vehicle not found", 404);

  const [record] = await StudentTransport.upsert({
    student_id: body.student_id,
    school_id,
    vehicle_id: body.vehicle_id,
    pickup_point: body.pickup_point || null,
    is_active: true,
  });
  return record;
};

export const unassignStudentService = async ({ school_id, student_id }) => {
  const record = await StudentTransport.findOne({ where: { student_id, school_id } });
  if (!record) throw new AppError("Student transport assignment not found", 404);
  return record.destroy();
};

export const listRequestsService = async ({ school_id, query }) => {
  const { limit, offset } = getPagination(query);
  return TransportRequest.findAndCountAll({
    where: { school_id },
    include: [
      {
        model: Student,
        include: [{ model: User, attributes: ["id", "name"] }],
      },
      {
        model: Vehicle,
        as: "CurrentVehicle",
      },
      {
        model: Vehicle,
        as: "RequestedVehicle",
      },
    ],
    limit,
    offset,
    order: [["created_at", "DESC"]],
  });
};

export const processRequestService = async ({ school_id, user_id, id, action, rejection_reason }) => {
  const request = await TransportRequest.findOne({ where: { id, school_id } });
  if (!request) throw new AppError("Request not found", 404);

  if (request.status !== "pending") {
    throw new AppError("Request has already been processed", 400);
  }

  const t = await db.transaction();
  try {
    if (action === "approve") {
      await request.update(
        {
          status: "approved",
          approved_by: user_id,
        },
        { transaction: t }
      );

      // Perform upsert on StudentTransport mapping
      await StudentTransport.upsert(
        {
          student_id: request.student_id,
          school_id,
          vehicle_id: request.requested_vehicle_id,
          pickup_point: request.pickup_point,
          is_active: true,
        },
        { transaction: t }
      );
    } else {
      await request.update(
        {
          status: "rejected",
          approved_by: user_id,
          rejection_reason: rejection_reason || null,
        },
        { transaction: t }
      );
    }
    await t.commit();
    return request;
  } catch (err) {
    await t.rollback();
    throw err;
  }
};

/* ==========================================
   4️⃣ DRIVER ACTIONS & LIVE GPS
   ========================================== */

export const getDriverVehicleService = async ({ school_id, driver_id }) => {
  const vehicle = await Vehicle.findOne({
    where: { driver_id, school_id },
  });
  if (!vehicle) throw new AppError("No vehicle assigned to this driver", 404);
  return vehicle;
};

export const startTripService = async ({ school_id, driver_id, body }) => {
  const vehicle = await Vehicle.findOne({
    where: { id: body.vehicle_id, driver_id, school_id },
  });
  if (!vehicle) throw new AppError("Vehicle not found or not assigned to you", 403);

  // Stop any other active trip for driver
  await Trip.update(
    { status: "completed", ended_at: new Date() },
    { where: { driver_id, status: "active" } }
  );

  return Trip.create({
    school_id,
    driver_id,
    vehicle_id: body.vehicle_id,
    trip_type: body.trip_type,
    status: "active",
    started_at: new Date(),
  });
};

export const stopTripService = async ({ school_id, driver_id, id }) => {
  const trip = await Trip.findOne({
    where: { id, driver_id, school_id, status: "active" },
  });
  if (!trip) throw new AppError("Active trip not found", 404);

  return trip.update({
    status: "completed",
    ended_at: new Date(),
  });
};

export const postLocationService = async ({ school_id, driver_id, trip_id, body, io }) => {
  const trip = await Trip.findOne({
    where: { id: trip_id, driver_id, school_id, status: "active" },
  });
  if (!trip) throw new AppError("Active trip not found", 404);

  const loc = await TripLocation.create({
    trip_id,
    latitude: body.latitude,
    longitude: body.longitude,
    speed: body.speed || null,
    heading: body.heading || null,
  });

  // Emit WebSocket update real-time
  if (io) {
    io.to(`trip:${trip_id}`).emit("trip:location", {
      trip_id,
      latitude: body.latitude,
      longitude: body.longitude,
      speed: body.speed,
      heading: body.heading,
      created_at: loc.created_at,
    });
  }

  return loc;
};

/* ==========================================
   5️⃣ PARENT & STUDENT ACCESS
   ========================================== */

export const getParentStudentTransportService = async ({ school_id, student_id }) => {
  const transport = await StudentTransport.findOne({
    where: { student_id, school_id },
    include: [
      {
        model: Vehicle,
        include: [
          {
            model: Driver,
            include: [{ model: User, attributes: ["id", "name", "phone"] }],
          },
        ],
      },
    ],
  });

  if (!transport) return null;

  const activeTrip = await Trip.findOne({
    where: { vehicle_id: transport.vehicle_id, status: "active" },
  });

  return {
    transport,
    active_trip: activeTrip,
  };
};

export const getParentTripLocationService = async ({ school_id, trip_id }) => {
  const trip = await Trip.findOne({ where: { id: trip_id, school_id } });
  if (!trip) throw new AppError("Trip not found", 404);

  return TripLocation.findOne({
    where: { trip_id },
    order: [["created_at", "DESC"]],
  });
};

export const createRequestService = async ({ school_id, student_id, body }) => {
  const student = await Student.findOne({ where: { id: student_id, school_id } });
  if (!student) throw new AppError("Student not found", 404);

  const reqVehicle = await Vehicle.findOne({ where: { id: body.requested_vehicle_id, school_id } });
  if (!reqVehicle) throw new AppError("Requested vehicle not found", 404);

  const current = await StudentTransport.findOne({ where: { student_id, school_id } });

  return TransportRequest.create({
    school_id,
    student_id,
    current_vehicle_id: current?.vehicle_id || null,
    requested_vehicle_id: body.requested_vehicle_id,
    pickup_point: body.pickup_point || null,
    status: "pending",
  });
};

export const getStudentTransportDetailsService = async ({ school_id, student_user_id }) => {
  const student = await Student.findOne({ where: { user_id: student_user_id, school_id } });
  if (!student) throw new AppError("Student profile not found", 404);

  return StudentTransport.findOne({
    where: { student_id: student.id, school_id },
    include: [
      {
        model: Vehicle,
        include: [
          {
            model: Driver,
            include: [{ model: User, attributes: ["id", "name", "phone"] }],
          },
        ],
      },
    ],
  });
};

export const getTeacherClassTransportService = async ({ school_id, teacher_user_id, query }) => {
  const teacher = await Teacher.findOne({ where: { user_id: teacher_user_id, school_id } });
  if (!teacher) throw new AppError("Teacher not found", 404);

  const assignments = await TeacherAssignment.findAll({
    where: { teacher_id: teacher.id, is_active: true },
  });
  if (!assignments.length) return { count: 0, rows: [] };

  const classIds = assignments.map((a) => a.class_id);
  const sectionIds = assignments.map((a) => a.section_id);

  const { limit, offset } = getPagination(query);

  return StudentTransport.findAndCountAll({
    where: { school_id },
    include: [
      {
        model: Student,
        where: {
          class_id: classIds,
          section_id: sectionIds,
        },
        include: [
          { model: User, attributes: ["id", "name"] },
          { model: Class, attributes: ["id", "class_name"] },
          { model: Section, attributes: ["id", "name"] },
        ],
      },
      {
        model: Vehicle,
      },
    ],
    limit,
    offset,
    order: [["created_at", "DESC"]],
  });
};

export const getDashboardStatsService = async ({ school_id }) => {
  const totalVehicles = await Vehicle.count({ where: { school_id } });
  const activeTrips = await Trip.count({ where: { school_id, status: "active" } });
  const totalDrivers = await Driver.count({ where: { school_id } });
  const studentsUsingBus = await StudentTransport.count({ where: { school_id, is_active: true } });

  const runningTrips = await Trip.findAll({
    where: { school_id, status: "active" },
    include: [
      {
        model: Vehicle,
        attributes: ["id", "vehicle_number", "vehicle_name"],
      },
      {
        model: Driver,
        include: [{ model: User, attributes: ["id", "name"] }],
      },
    ],
  });

  const runningBuses = runningTrips.map((t) => ({
    trip_id: t.id,
    vehicle_name: t.vehicle?.vehicle_name || "Bus",
    vehicle_number: t.vehicle?.vehicle_number || "",
    driver_name: (t.driver?.user ?? t.driver?.User)?.name || "Driver",
    trip_type: t.trip_type,
    started_at: t.started_at,
  }));

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const completedToday = await Trip.count({
    where: {
      school_id,
      status: "completed",
      started_at: { [Op.gte]: startOfDay },
    },
  });

  const runningToday = activeTrips;

  const vehiclesWithTripsToday = await Trip.findAll({
    where: {
      school_id,
      started_at: { [Op.gte]: startOfDay },
    },
    attributes: ["vehicle_id"],
    raw: true,
  });

  const activeVehicleIds = [...new Set(vehiclesWithTripsToday.map((v) => v.vehicle_id))];
  const totalVehiclesList = await Vehicle.findAll({
    where: { school_id, is_active: true },
    attributes: ["id"],
    raw: true,
  });

  const allVehicleIds = totalVehiclesList.map((v) => v.id);
  const notStartedToday = Math.max(0, allVehicleIds.length - activeVehicleIds.length);

  return {
    totalVehicles,
    activeTrips,
    totalDrivers,
    studentsUsingBus,
    runningBuses,
    todayTripsSummary: {
      completed: completedToday,
      running: runningToday,
      notStarted: notStartedToday,
    },
  };
};

export const listTripsService = async ({ school_id, query }) => {
  const { limit, offset } = getPagination(query);
  return Trip.findAndCountAll({
    where: { school_id },
    include: [
      {
        model: Vehicle,
        attributes: ["id", "vehicle_number", "vehicle_name"],
      },
      {
        model: Driver,
        include: [{ model: User, attributes: ["id", "name"] }],
      },
    ],
    limit,
    offset,
    order: [["started_at", "DESC"]],
  });
};

export const getDriverActiveTripService = async ({ school_id, driver_id }) => {
  return Trip.findOne({
    where: {
      school_id,
      driver_id,
      status: "active"
    }
  });
};

export const getDriverProfileService = async ({ school_id, driver_id }) => {
  const driver = await Driver.findOne({
    where: { id: driver_id, school_id },
    include: [{ model: User, attributes: ["id", "name", "phone", "username"] }]
  });
  if (!driver) throw new AppError("Driver profile not found", 404);
  return driver;
};
