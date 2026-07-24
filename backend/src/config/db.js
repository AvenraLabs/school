import { config } from "dotenv";
import { Sequelize } from "sequelize";

config();

const db = new Sequelize(process.env.DB_URI, {
  dialect: "postgres",

  logging: false,

  pool: {
    max: parseInt(process.env.DB_POOL_MAX) || 20,
    min: 2,
    acquire: 30000,
    idle: 10000,
  },

  timezone: "+05:30",

  dialectOptions:
    process.env.DB_SSL === "true" || (process.env.NODE_ENV === "production" && process.env.DB_SSL !== "false")
      ? {
          ssl: {
            require: true,
            rejectUnauthorized: false,
          },
        }
      : {},
});

export default db;