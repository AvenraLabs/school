import { DataTypes } from "sequelize";
import db from "../../config/db.js";

const StudentTransport = db.define(
  "student_transport",
  {
    student_id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      references: { model: "students", key: "id" },
    },

    school_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: { model: "schools", key: "id" },
    },

    vehicle_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: { model: "vehicles", key: "id" },
    },

    pickup_point: {
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
    tableName: "student_transports",
    underscored: true,
    indexes: [
      { fields: ["school_id"] },
      { fields: ["vehicle_id"] },
    ],
  }
);

export default StudentTransport;
