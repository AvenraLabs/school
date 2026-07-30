import { DataTypes } from "sequelize";
import db from "../../config/db.js";

const SectionSubjectOverride = db.define(
  "section_subject_override",
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
    section_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    subject_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    // true  = include this subject in the section even if absent from class default
    // false = exclude this subject from the section even if present in class default
    is_included: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
  },
  {
    tableName: "section_subject_overrides",
    underscored: true,
    timestamps: true,
    indexes: [
      { name: "idx_sso_school_id", fields: ["school_id"] },
      { name: "idx_sso_class_section", fields: ["class_id", "section_id"] },
      { name: "idx_sso_unique", unique: true, fields: ["school_id", "class_id", "section_id", "subject_id"] },
    ],
  }
);

import Subject from "./subject.model.js";
SectionSubjectOverride.belongsTo(Subject, { foreignKey: "subject_id" });

export default SectionSubjectOverride;
