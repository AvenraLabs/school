import { DataTypes } from "sequelize";
import db from "../../config/db.js";

const ClassSubject = db.define(
  "class_subject",
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
    class_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    subject_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    periods_per_week: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null,
    },
  },
  {
    tableName: "class_subjects",
    underscored: true,
    timestamps: true,
    indexes: [
      { name: "idx_class_subjects_school_id", fields: ["school_id"] },
      { name: "idx_class_subjects_class_id", fields: ["class_id"] },
      { name: "idx_class_subjects_unique", unique: true, fields: ["school_id", "class_id", "subject_id"] },
    ],
  }
);

// Lazy association setup to avoid circular imports
import Subject from "./subject.model.js";
ClassSubject.belongsTo(Subject, { foreignKey: "subject_id" });

export default ClassSubject;
