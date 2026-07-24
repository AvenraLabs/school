import { DataTypes } from "sequelize";
import db from "../../../config/db.js";

const StudentChatMessage = db.define(
  "student_chat_message",
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },
    session_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: "student_chat_sessions",
        key: "id",
      },
    },
    sender: {
      type: DataTypes.ENUM("user", "assistant"),
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    sources: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    tokens_used: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  },
  {
    tableName: "student_chat_messages",
    underscored: true,
    timestamps: true,
    indexes: [
      { fields: ["session_id"] },
    ],
  }
);

export default StudentChatMessage;
