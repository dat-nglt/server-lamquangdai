import dotenv from "dotenv";

dotenv.config();

export const API_KEY =
  process.env.GEMINI_API_KEY || "AIzaSyBAgHEF6i2FubocxwmVA692CzMZf3MIchM";
export const ACCESS_TOKEN =
  process.env.ZALO_ACCESS_TOKEN || "your_zalo_token_here";
export const ZALO_API_BASE_URL = "https://openapi.zalo.me";

// Redis Configuration
export const REDIS_CONFIG = {
  host: process.env.REDIS_HOST || "localhost",
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || null,
  db: process.env.REDIS_DB || 0,
  // Optional: for production Redis with TLS
  tls: process.env.REDIS_TLS === "true" ? {} : undefined,
  retryDelayOnFailover: 100,
  maxRetriesPerRequest: 3,
  lazyConnect: true,
};

// Validate required environment variables
if (!API_KEY) {
  throw new Error("GEMINI_API_KEY chưa được thiết lập trong file .env");
}
if (!ACCESS_TOKEN) {
  throw new Error("ZALO_ACCESS_TOKEN chưa được thiết lập trong file .env");
}

export default {
  API_KEY,
  ACCESS_TOKEN,
  ZALO_API_BASE_URL,
  REDIS_CONFIG,
};
