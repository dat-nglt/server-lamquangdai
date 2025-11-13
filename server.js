// server.js
import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import http from "http";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import compression from "compression";
import { Server } from "socket.io"; // (Bạn có import nhưng chưa dùng, vẫn giữ lại)

import logger from "./src/utils/logger.js";
import mainRouter from "./src/routes/index.js";
import db from "./src/models/index.js";

dotenv.config();

// Hàm khởi động server chính
async function startServer() {
  console.clear();
  logger.info("Bắt đầu khởi tạo server cho Zalo Mini App...");
  const app = express();
  const server = http.createServer(app);

  try {
    // --- CẤU HÌNH MIDDLEWARE BẢO MẬT & HIỆU NĂNG ---
    // (Giữ nguyên toàn bộ phần này: helmet, rateLimit, compression, cors...)
    app.use(helmet());
    app.use(
      rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 100000,
        message: { error: "Quá nhiều yêu cầu, vui lòng thử lại sau." },
        standardHeaders: true,
        legacyHeaders: false,
      })
    );
    app.use(compression());
    const allowedOrigins = [
      "https://lamquangdai.vn",
      "https://www.lamquangdai.vn",
      "https://h5.zdn.vn",
    ];
    const zaloMiniAppRegex = /^https:\/\/([a-z0-9-]+\.)*mini\.123c\.vn$/;

    if (process.env.NODE_ENV === "development") {
      allowedOrigins.push("http://localhost:3001"); // Cho phép localhost dev
    }

    // ... (code allowedOrigins và regex giữ nguyên) ...

    const corsOptions = {
      origin: (origin, callback) => {
        // --- DÒNG DEBUG QUAN TRỌNG ---
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else if (origin && zaloMiniAppRegex.test(origin)) {
          callback(null, true);
        } else {
          // Nếu một origin bị chặn, nó sẽ được log ra ở dòng trên
          callback(new Error("Not allowed by CORS"));
        }
      },
      methods: ["GET", "POST", "PUT", "DELETE"],
      allowedHeaders: ["Content-Type", "Authorization"],
    };

    app.use(cors(corsOptions));

    // --- CẤU HÌNH PARSER & LOGGING ---
    // (Giữ nguyên phần này)
    app.use(express.json({ limit: "10mb" }));
    app.use(express.urlencoded({ extended: true, limit: "10mb" }));
    app.use(
      morgan("combined", {
        stream: { write: (message) => logger.info(message.trim()) },
      })
    );

    // --- KẾT NỐI VÀ ĐỒNG BỘ DATABASE ---

    logger.info("---- Đang kết nối tới cơ sở dữ liệu");
    // 1. Xác thực kết nối
    await db.sequelize.authenticate();
    logger.info("Kết nối CSDL thành công");

    // 2. BỔ SUNG: ĐỒNG BỘ DATABASE (CHỈ TRONG DEVELOPMENT)
    if (process.env.NODE_ENV === "development") {
      logger.info("---- Đang đồng bộ CSDL");

      // Dùng { alter: true } - AN TOÀN cho development
      // Cố gắng thay đổi (ALTER) bảng để khớp với model.
      await db.sequelize.sync({ alter: true });
      // await db.sequelize.sync({ force: true });
      // logger.warn('⚠️ CSDL đã được reset với { force: true } (Mất hết dữ liệu)');
      // CẢNH BÁO: Lệnh này sẽ XÓA TẤT CẢ BẢNG và tạo lại. MẤT HẾT DỮ LIỆU.
      logger.info("Đồng bộ CSDL thành công với");
    }

    // --- CẤU HÌNH ROUTES ---
    mainRouter(app);
    logger.info("Cấu hình routes thành công");

    // --- XỬ LÝ LỖI ---
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
    });

    // --- KHỞI ĐỘNG SERVER ---
    const PORT = process.env.PORT || 3000;
    server.listen(PORT, () => {
      logger.info(
        `Server đang chạy tại cổng ${PORT} [${process.env.NODE_ENV}]`
      );
    });
  } catch (error) {
    logger.error("Lỗi nghiêm trọng khi khởi động server:", error.message);
    process.exit(1); // Thoát tiến trình nếu khởi động thất bại
  }
}

// Bắt đầu chạy server
startServer();
