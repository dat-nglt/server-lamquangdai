export const env = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: process.env.PORT || 3000,

  // Database
  DB_HOST: process.env.DB_HOST || "localhost",
  DB_PORT: process.env.DB_PORT || 5432,
  DB_USER: process.env.DB_USER || "postgres",
  DB_PASSWORD: process.env.DB_PASSWORD || "dat20April@03",
  DB_NAME: process.env.DB_NAME || "store-mini-app",

  // JWT
  JWT_SECRET: process.env.JWT_SECRET || "your-secret-key",
};
