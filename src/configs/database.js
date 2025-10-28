// Cấu hình cho Sequelize CLI (migration, seed, v.v.)

import { Sequelize } from "sequelize";
import { env } from "./env.js";
import logger from "../utils/logger.js";

export const sequelize = new Sequelize(
  env.DB_NAME,
  env.DB_USER,
  env.DB_PASSWORD,
  {
    host: env.DB_HOST,
    port: env.DB_PORT,
    dialect: "postgres",
    logging: env.NODE_ENV === "development" ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  }
);

export const testConnection = async () => {
  try {
    await sequelize.authenticate();
    logger.info("PostgreSQL connected successfully");
  } catch (error) {
    logger.error("Unable to connect to PostgreSQL", error);
    process.exit(1);
  }
};
