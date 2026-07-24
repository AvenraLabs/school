import { DataTypes } from "sequelize";
import db from "../../config/db.js";

const Book = db.define(
  "book",
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
    book_no: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    book_name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    total_copies: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    available_copies: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    status: {
      type: DataTypes.ENUM("active", "archived"),
      allowNull: false,
      defaultValue: "active",
    },
    image_url: {
      type: DataTypes.STRING(500),
      allowNull: true,
      defaultValue: null,
    },
    created_by: {
      type: DataTypes.BIGINT,
      allowNull: true,
      references: { model: "users", key: "id" },
    },
  },
  {
    tableName: "books",
    underscored: true,
    timestamps: true,
    indexes: [
      { fields: ["school_id"] },
      { unique: true, fields: ["school_id", "book_no"] },
    ],
  }
);

export default Book;
