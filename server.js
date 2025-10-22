// server.js
import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import http from "http";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import compression from "compression";
import { Server } from "socket.io";

import logger from "./utils/logger.js"; // Giả sử bạn có file logger.js với Winston
import mainRouter from "./routes/index.js";
// import connectDB from "./config/connectDB.js";

// Tải biến môi trường ngay từ đầu
dotenv.config();

// Hàm khởi động server chính
async function startServer() {
  logger.info("🔧 Bắt đầu khởi tạo server cho Zalo Mini App...");
  const app = express();
  const server = http.createServer(app);

  try {
    // --- CẤU HÌNH MIDDLEWARE BẢO MẬT & HIỆU NĂNG ---

    // Bảo mật các HTTP header cơ bản
    app.use(helmet());

    // Giới hạn số lượng request để chống tấn công DoS/brute-force
    app.use(
      rateLimit({
        windowMs: 15 * 60 * 1000, // 15 phút
        max: 200, // Giới hạn 200 requests mỗi IP trong 15 phút
        message: { error: "Quá nhiều yêu cầu, vui lòng thử lại sau." },
        standardHeaders: true,
        legacyHeaders: false,
      })
    );

    // Nén response body để tăng tốc độ tải
    app.use(compression());

    // Cấu hình CORS chặt chẽ cho Zalo Mini App
    const allowedOrigins = [
      "https://mini.zalo.me", // Domain chính của Zalo Mini App
      "https://zmini.me", // Một domain khác của Zalo
    ];
    // Cho phép localhost khi đang phát triển
    if (process.env.NODE_ENV === "development") {
      allowedOrigins.push("http://localhost:3000");
    }
    const corsOptions = {
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error("Not allowed by CORS"));
        }
      },
      methods: ["GET", "POST", "PUT", "DELETE"],
      allowedHeaders: ["Content-Type", "Authorization"], // Cho phép gửi JWT token
    };
    app.use(cors(corsOptions));

    // --- CẤU HÌNH PARSER & LOGGING ---

    // Đọc body của request dưới dạng JSON
    app.use(express.json({ limit: "10mb" }));
    app.use(express.urlencoded({ extended: true, limit: "10mb" }));

    // Ghi log request HTTP với Morgan (chuyển output vào Winston)
    app.use(
      morgan("combined", {
        stream: { write: (message) => logger.info(message.trim()) },
      })
    );

    // --- KẾT NỐI DATABASE ---
    // logger.info("... Đang kết nối tới cơ sở dữ liệu...");
    // await connectDB();
    // logger.info("✅ Kết nối cơ sở dữ liệu thành công!");

    // --- CẤU HÌNH ROUTES ---
    mainRouter(app);
    logger.info("✅ Cấu hình routes thành công!");

    // --- XỬ LÝ LỖI ---
    // Middleware xử lý lỗi 404 (khi không tìm thấy route)
    app.use((req, res, next) => {
      res.status(404).json({ error: "Endpoint không tồn tại." });
    });

    // Middleware xử lý lỗi toàn cục (bắt lỗi từ các route)
    app.use((error, req, res, next) => {
      logger.error(error.stack);
      res.status(500).json({
        error: "Đã có lỗi xảy ra ở server.",
        // Chỉ hiện chi tiết lỗi ở môi trường development
        message: process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    });

    // --- KHỞI ĐỘNG SERVER ---
    const PORT = process.env.PORT || 8080;
    server.listen(PORT, () => {
      logger.info(`🚀 Server đang chạy tại cổng ${PORT} [${process.env.NODE_ENV}]`);
    });
  } catch (error) {
    logger.error("❌ Lỗi nghiêm trọng khi khởi động server:", error);
    process.exit(1); // Thoát tiến trình nếu khởi động thất bại
  }
}

startServer();
