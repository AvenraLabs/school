import { DataTypes } from "sequelize";
import db from "../../config/db.js";

const TimetableSubstitution = db.define(
  "timetable_substitution",
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },

    school_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },

    academic_year_id: {
      type: DataTypes.BIGINT,
      allowNull: true,
      references: { model: "academic_years", key: "id" },
    },

    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },

    timetable_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: { model: "timetables", key: "id" },
      onDelete: "CASCADE",
    },

    class_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: { model: "classes", key: "id" },
    },

    section_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: { model: "sections", key: "id" },
    },

    original_teacher_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: { model: "teachers", key: "id" },
    },

    substitute_teacher_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: { model: "teachers", key: "id" },
    },

    created_by: {
      type: DataTypes.BIGINT,
      allowNull: true,
      references: { model: "users", key: "id" },
    },
  },
  {
    tableName: "timetable_substitutions",
    underscored: true,
    timestamps: true,
    indexes: [
      { fields: ["school_id"] },
      { fields: ["date"] },
      { fields: ["timetable_id"] },
      { fields: ["original_teacher_id"] },
      { fields: ["substitute_teacher_id"] },
      {
        unique: true,
        fields: ["date", "timetable_id"],
      },
    ],
  }
);

export default TimetableSubstitution;
