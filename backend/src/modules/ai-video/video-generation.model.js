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
    operation_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    video_path: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    video_url: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    thumbnail_path: {
      type: DataTypes.TEXT,
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
    // "diagram_only" (default) or "diagram_and_video" (opt-in)
    content_type: {
      type: DataTypes.ENUM("diagram_only", "diagram_and_video"),
      allowNull: true,
      defaultValue: "diagram_only",
    },
    // GCS gs:// URI or Data URI for the labeled 2D diagram PNG
    image_path: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    // Public HTTPS URL or Data URI for the diagram PNG
    image_url: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    // Student-facing one-liner "what you'll learn" caption (≤15 words)
    summary: {
      type: DataTypes.STRING(200),
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
