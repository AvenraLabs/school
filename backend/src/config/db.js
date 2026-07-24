import { config } from "dotenv";
import { Sequelize } from "sequelize";

config();

const dialectOptions = {
  // Prevent runaway queries from holding connection locks indefinitely (15s default)
  statement_timeout: parseInt(process.env.DB_STATEMENT_TIMEOUT || "15000", 10),
  // Auto-kill idle transactions held open longer than 10 seconds
  idle_in_transaction_session_timeout: parseInt(process.env.DB_IDLE_TX_TIMEOUT || "10000", 10),
  // Keep TCP connections alive through GCloud VPC NAT and firewalls
  keepAlive: true,
};

if (
  process.env.DB_SSL === "true" ||
  (process.env.NODE_ENV === "production" && process.env.DB_SSL !== "false")
) {
  dialectOptions.ssl = {
    require: true,
    rejectUnauthorized: false,
  };
}

const db = new Sequelize(process.env.DB_URI, {
  dialect: "postgres",

  logging: false,

  pool: {
    max: parseInt(process.env.DB_POOL_MAX) || 30,
    min: parseInt(process.env.DB_POOL_MIN) || 2,
    acquire: parseInt(process.env.DB_POOL_ACQUIRE) || 30000,
    idle: parseInt(process.env.DB_POOL_IDLE) || 10000,
    evict: 1000, // Evict stale connections every second
  },

  timezone: "+05:30",

  dialectOptions,
});

export default db;