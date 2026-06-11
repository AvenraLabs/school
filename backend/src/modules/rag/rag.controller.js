import asyncHandler from "../../shared/asyncHandler.js";
import { askRag } from "./rag.service.js";

import Class from "../classes/classes.model.js";

const normalizeClassLevel = (value) => {
  if (!value) return value;
  const str = String(value).trim().toLowerCase();
  const digitMatch = str.match(/\d+/);
  if (digitMatch) return digitMatch[0];
  return str.replace(/^class\s*/, "");
};

export const askQuestion = asyncHandler(async (req, res) => {
  const { question, classLevel } = req.body;


  if (!question) {
    return res.status(400).json({ message: "Question is required" });
  }

  let effectiveClassLevel = normalizeClassLevel(classLevel);

  if (req.user?.role === "student" && req.user?.class_id) {
    const cls = await Class.findOne({
      where: { id: req.user.class_id, school_id: req.user.school_id },
      attributes: ["class_name"],
    });
    if (cls?.class_name) {
      effectiveClassLevel = normalizeClassLevel(cls.class_name);
    }
  }

  const result = await askRag({
    question,
    classLevel: effectiveClassLevel,
    userId: req.user.id,
  });

  return res.json({
    question,
    answer: result.answer,
    sources: result.sources,
  });
});

