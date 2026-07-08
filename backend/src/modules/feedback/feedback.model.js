import { DataTypes } from "sequelize";
import db from "../../config/db.js";

const Feedback = db.define(
  "feedback",
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },
    school_id: {
      type: DataTypes.BIGINT,
      allowNull: true,
      references: {
        model: "schools",
        key: "id",
      },
      onDelete: "SET NULL",
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    category: {
      type: DataTypes.ENUM("bug_report", "feature_request", "suggestion", "complaint", "appreciation"),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    screenshot_url: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    user_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
      onDelete: "CASCADE",
    },
    role: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    browser: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    app_version: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM("OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"),
      allowNull: false,
      defaultValue: "OPEN",
    },
  },
  {
    tableName: "feedbacks",
    underscored: true,
    timestamps: true,
    indexes: [
      { fields: ["status"] },
      { fields: ["category"] },
      { fields: ["user_id"] },
    ],
  }
);

export default Feedback;
