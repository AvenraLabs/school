import { DataTypes } from "sequelize";
import db from "../../config/db.js";

const TripLocation = db.define(
  "trip_location",
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },

    trip_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: { model: "trips", key: "id" },
      onDelete: "CASCADE",
    },

    latitude: {
      type: DataTypes.DECIMAL(10, 8),
      allowNull: false,
    },

    longitude: {
      type: DataTypes.DECIMAL(11, 8),
      allowNull: false,
    },

    speed: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },

    heading: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },

    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "trip_locations",
    underscored: true,
    timestamps: false, // Only created_at timestamp
    indexes: [
      { fields: ["trip_id"] },
      { fields: ["created_at"] },
    ],
  }
);

export default TripLocation;
