import { DataTypes } from "sequelize";
import db from "../../config/db.js";

const Notification = db.define(
  "notification",
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },

    school_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },

    sender_user_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },

    sender_role: {
      type: DataTypes.ENUM("school_admin", "teacher"),
      allowNull: false,
    },

    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },

    /* TARGETING */
    target_role: {
      type: DataTypes.ENUM("teacher", "student", "all"),
      allowNull: false,
    },

    class_id: {
      type: DataTypes.BIGINT,
      allowNull: true,
    },

    section_id: {
      type: DataTypes.BIGINT,
      allowNull: true,
    },

    image_url: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },

    is_poster: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },

    start_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },

    end_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },

    specific_dates: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
  },
  {
    tableName: "notifications",
    underscored: true,
    timestamps: true,
    indexes: [
      { fields: ["school_id"] },
      { fields: ["target_role"] },
      { fields: ["class_id"] },
    ],
  }
);

export default Notification;
