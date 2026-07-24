import { DataTypes } from "sequelize";
import db from "../../config/db.js";

const VideoGeneration = db.define(
  "video_generation",
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },
    school_id: {
      type: DataTypes.BIGINT,
      allowNull: true,
      references: { model: "schools", key: "id" },
    },
    teacher_id: {
      type: DataTypes.BIGINT,
      allowNull: true,
      references: { model: "teachers", key: "id" },
    },
    class_id: {
      type: DataTypes.BIGINT,
      allowNull: true,
      references: { model: "classes", key: "id" },
    },
    section_id: {
      type: DataTypes.BIGINT,
      allowNull: true,
      references: { model: "sections", key: "id" },
    },
    subject_id: {
      type: DataTypes.BIGINT,
      allowNull: true,
    },
    subject_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    topic: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    language: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "English",
    },
    duration: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "5",
    },
    status: {
      type: DataTypes.ENUM("pending", "processing", "completed", "failed"),
      allowNull: false,
      defaultValue: "pending",
    },
    kling_job_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    video_path: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    video_url: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    thumbnail_path: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    prompt: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    error_message: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    completed_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "video_generations",
    underscored: true,
    timestamps: true,
  }
);

export default VideoGeneration;
