import { DataTypes } from "sequelize";
import db from "../../config/db.js";

const TokenPolicy = db.define(
  "token_policy",
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },

    school_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: "schools", key: "id" },
    },

    role: {
      type: DataTypes.ENUM("student", "teacher"),
      allowNull: false,
    },

    annual_tokens: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },

    annual_video_seconds: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },

    annual_image_generations: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },

    updated_by: {
      type: DataTypes.BIGINT,
      allowNull: true,
      references: { model: "users", key: "id" },
    },
  },
  {
    tableName: "token_policies",
    underscored: true,
    timestamps: true,
    indexes: [{ unique: true, fields: ["role", "school_id"] }],
  }
);

export default TokenPolicy;
