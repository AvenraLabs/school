import { DataTypes } from "sequelize";
import db from "../../config/db.js";

const WhatsappLog = db.define(
  "whatsapp_log",
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

    status: {
      type: DataTypes.STRING, // success, failed, skipped
      allowNull: false,
    },

    phone: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },

    response: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    error: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "whatsapp_logs",
    underscored: true,
    timestamps: true,
    indexes: [
      { fields: ["school_id"] },
      { fields: ["status"] },
      { fields: ["phone"] },
      { fields: ["created_at"] },
    ],
  }
);

export default WhatsappLog;
