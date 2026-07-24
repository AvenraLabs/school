import { DataTypes } from "sequelize";
import db from "../../../config/db.js";

const StudentChatSession = db.define(
  "student_chat_session",
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },
    student_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
    school_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: "schools",
        key: "id",
      },
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "New Conversation",
    },
    subject: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    tableName: "student_chat_sessions",
    underscored: true,
    timestamps: true,
    indexes: [
      { fields: ["student_id"] },
      { fields: ["school_id"] },
    ],
  }
);

export default StudentChatSession;
