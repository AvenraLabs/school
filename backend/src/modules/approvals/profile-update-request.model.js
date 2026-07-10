import { DataTypes } from "sequelize";
import db from "../../config/db.js";

const ProfileUpdateRequest = db.define(
  "profile_update_request",
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    school_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: "schools",
        key: "id",
      },
      onDelete: "CASCADE",
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
      type: DataTypes.ENUM("student", "teacher"),
      allowNull: false,
    },
    pending_data: {
      type: DataTypes.JSON,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("PENDING", "APPROVED", "REJECTED"),
      allowNull: false,
      defaultValue: "PENDING",
    },
    rejection_reason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "profile_update_requests",
    underscored: true,
    timestamps: true,
    indexes: [
      { fields: ["school_id"] },
      { fields: ["user_id"] },
      { fields: ["status"] },
    ],
  }
);

export default ProfileUpdateRequest;
