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

    const timetables = await Timetable.findAll();
    console.log("Timetables count:", timetables.length);
    console.log("All Timetables:", timetables.map(t => ({ id: t.id, class_id: t.class_id, section_id: t.section_id, day_of_week: t.day_of_week })));

    const assignments = await TeacherAssignment.findAll();
    console.log("Assignments count:", assignments.length);
    console.log("All Assignments:", assignments.map(a => ({ id: a.id, class_id: a.class_id, section_id: a.section_id, teacher_id: a.teacher_id })));
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}

run();
