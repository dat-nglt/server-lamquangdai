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

import logger from "./src/utils/logger.js";
import mainRouter from "./src/routes/index.js";

// --- THÊM IMPORT KẾT NỐI DATABASE ---
// (Giả sử file database.js của bạn nằm ở ./config/database.js)
import { testConnection } from "./src/configs/database.js";
// import connectDB from "./config/connectDB.js"; // <--- Bỏ dòng này

// Tải biến môi trường ngay từ đầu
dotenv.config();

// Hàm khởi động server chính
async function startServer() {
  logger.info("🔧 Bắt đầu khởi tạo server cho Zalo Mini App...");
  const app = express();
  const server = http.createServer(app);

  try {
    // --- CẤU HÌNH MIDDLEWARE BẢO MẬT & HIỆU NĂNG ---
    // (Giữ nguyên toàn bộ phần này: helmet, rateLimit, compression, cors)
    app.use(helmet());
    app.use(
      rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 200,
        message: { error: "Quá nhiều yêu cầu, vui lòng thử lại sau." },
        standardHeaders: true,
        legacyHeaders: false,
      })
    );
    app.use(compression());
    const allowedOrigins = ["https://mini.zalo.me", "https://zmini.me"];
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
      allowedHeaders: ["Content-Type", "Authorization"],
    };
    app.use(cors(corsOptions)); // --- CẤU HÌNH PARSER & LOGGING --- // (Giữ nguyên phần này: express.json, morgan)

    app.use(express.json({ limit: "10mb" }));
    app.use(express.urlencoded({ extended: true, limit: "10mb" }));
    app.use(
      morgan("combined", {
        stream: { write: (message) => logger.info(message.trim()) },
      })
    ); // --- KẾT NỐI DATABASE ---

    logger.info("...Đang kết nối tới cơ sở dữ liệu"); // <--- GỌI HÀM KẾT NỐI CỦA BẠN TẠI ĐÂY ---
    await testConnection(); // (Hàm testConnection của bạn đã tự log khi thành công // và tự process.exit(1) khi thất bại, nên rất an toàn) // --- CẤU HÌNH ROUTES ---
    mainRouter(app);
    logger.info("Cấu hình routes thành công!"); // --- XỬ LÝ LỖI --- // (Giữ nguyên phần này)

    app.use((req, res, next) => {
      res.status(404).json({ error: "Endpoint không tồn tại." });
    });
    app.use((error, req, res, next) => {
      logger.error(error.stack);
      res.status(500).json({
        error: "Đã có lỗi xảy ra ở server.",
        message:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }); // --- KHỞI ĐỘNG SERVER ---

    const PORT = process.env.PORT || 8080;
    server.listen(PORT, () => {
      logger.info(
        `Server đang chạy tại cổng ${PORT} [${process.env.NODE_ENV}]`
      );
    });
  } catch (error) {
    logger.error("❌ Lỗi nghiêm trọng khi khởi động server:", error);
    process.exit(1); // Thoát tiến trình nếu khởi động thất bại
  }
}

startServer();
