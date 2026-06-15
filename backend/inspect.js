import dotenv from "dotenv";
dotenv.config();

import db from "./src/config/db.js";
import "./src/models/initModels.js";
import Timetable from "./src/modules/timetables/timetable.model.js";
import TeacherAssignment from "./src/modules/teacher-assignments/teacher-assignment.model.js";

async function run() {
  try {
    await db.authenticate();
    console.log("DB authenticated");

    const teacherDesc = await db.models.teacher.describe();
    console.log("Teacher Columns:", Object.keys(teacherDesc));

    const userDesc = await db.models.user.describe();
    console.log("User Columns:", Object.keys(userDesc));
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}

run();
