import { DataTypes } from "sequelize";
import db from "../../config/db.js";

const TimetableGenerationJob = db.define(
  "timetable_generation_job",
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },
    school_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: "schools",
        key: "id",
      },
    },
    academic_year_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: "academic_years",
        key: "id",
      },
    },
    status: {
      type: DataTypes.ENUM("pending", "processing", "completed", "failed"),
      allowNull: false,
      defaultValue: "pending",
    },
    triggered_by: {
      type: DataTypes.BIGINT,
      allowNull: true,
      references: {
        model: "users",
        key: "id",
      },
    },
    result_summary: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {},
    },
    completed_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "timetable_generation_jobs",
    underscored: true,
    timestamps: true,
    indexes: [
      { name: "idx_tgj_school_id", fields: ["school_id"] },
      { name: "idx_tgj_academic_year_id", fields: ["academic_year_id"] },
      { name: "idx_tgj_status", fields: ["status"] },
    ],
  }
);

export default TimetableGenerationJob;
