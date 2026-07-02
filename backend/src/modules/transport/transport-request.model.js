import { DataTypes } from "sequelize";
import db from "../../config/db.js";

const TransportRequest = db.define(
  "transport_request",
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },

    school_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: { model: "schools", key: "id" },
    },

    student_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: { model: "students", key: "id" },
    },

    current_vehicle_id: {
      type: DataTypes.BIGINT,
      allowNull: true,
      references: { model: "vehicles", key: "id" },
    },

    requested_vehicle_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: { model: "vehicles", key: "id" },
    },

    pickup_point: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    status: {
      type: DataTypes.ENUM("pending", "approved", "rejected"),
      allowNull: false,
      defaultValue: "pending",
    },

    approved_by: {
      type: DataTypes.BIGINT,
      allowNull: true,
      references: { model: "users", key: "id" },
    },

    rejection_reason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "transport_requests",
    underscored: true,
    indexes: [
      { fields: ["school_id"] },
      { fields: ["student_id"] },
      { fields: ["status"] },
    ],
  }
);

export default TransportRequest;
