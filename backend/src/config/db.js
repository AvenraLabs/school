import { config } from "dotenv";
import { Sequelize } from "sequelize";

config();

const db = new Sequelize(process.env.DB_URI, {
  dialect: "postgres",

  logging: false,

  pool: {
    max: parseInt(process.env.DB_POOL_MAX) || 4,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },

  timezone: "+05:30",

  dialectOptions: process.env.DB_SSL === "true" || process.env.NODE_ENV === "production"
    ? {
        ssl: {
          require: true,
          rejectUnauthorized: false,
        },
      }
    : {},
});

export default db;