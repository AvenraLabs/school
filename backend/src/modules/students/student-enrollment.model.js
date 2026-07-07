import { DataTypes } from "sequelize";
import db from "../../config/db.js";

const StudentEnrollment = db.define(
  "student_enrollment",
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },
    student_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: { model: "students", key: "id" },
      onDelete: "CASCADE",
    },
    academic_year_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: { model: "academic_years", key: "id" },
      onDelete: "CASCADE",
    },
    class_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: { model: "classes", key: "id" },
      onDelete: "CASCADE",
    },
    section_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: { model: "sections", key: "id" },
      onDelete: "CASCADE",
    },
    roll_no: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    tableName: "student_enrollments",
    underscored: true,
    timestamps: true,
    indexes: [
      { fields: ["student_id"] },
      { fields: ["academic_year_id"] },
      { fields: ["class_id"] },
      { fields: ["section_id"] },
      { unique: true, fields: ["student_id", "academic_year_id"] }, // A student can have only one enrollment placement per academic year!
    ],
  }
);

export default StudentEnrollment;
