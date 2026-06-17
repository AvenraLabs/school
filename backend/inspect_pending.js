import dotenv from "dotenv";
dotenv.config();

import db from "./src/config/db.js";
import "./src/models/initModels.js";
import Student from "./src/modules/students/student.model.js";
import User from "./src/modules/users/user.model.js";

async function run() {
  try {
    await db.authenticate();
    console.log("DB connected");

    const pending = await Student.findAll({
      where: { approval_status: "pending" },
      include: [
        {
          model: User,
        }
      ]
    });

    console.log("Found pending count:", pending.length);
    for (const p of pending) {
      const json = p.toJSON();
      console.log("Student ID:", p.id);
      console.log("Student keys:", Object.keys(json));
      if (json.user) {
        console.log("json.user name:", json.user.name, "username:", json.user.username);
      } else if (json.User) {
        console.log("json.User name:", json.User.name, "username:", json.User.username);
      } else {
        console.log("No User association!");
      }
    }
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}

run();
