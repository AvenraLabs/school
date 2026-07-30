import { DataTypes } from "sequelize";
import db from "../../config/db.js";

const Exam = db.define(
  "exam",
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },

    school_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: { model: "schools", key: "id" },
    },

    academic_year_id: {
      type: DataTypes.BIGINT,
      allowNull: true,
      references: { model: "academic_years", key: "id" },
    },

    class_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: { model: "classes", key: "id" },
    },

    section_id: {
      type: DataTypes.BIGINT,
      allowNull: true,
      references: { model: "sections", key: "id" },
    },

    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    exam_master_id: {
      type: DataTypes.BIGINT,
      allowNull: true,
      references: { model: "exam_masters", key: "id" },
    },

    is_locked: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    tableName: "exams",
    underscored: true,
    timestamps: true,
    indexes: [
      { name: "idx_exams_school_id", fields: ["school_id"] },
      { name: "idx_exams_class_id", fields: ["class_id"] },
      { name: "idx_exams_section_id", fields: ["section_id"] },
    ],
  }
);

export default Exam;
