// File này tập trung toàn bộ logic gọi API Zalo về một chỗ.

import axios from "axios";
import logger from "../utils/logger.js"; // Giả sử bạn có logger
import db from "../models/index.js";

const { ZaloTokens } = db;

const ZALO_API = process.env.ZALO_API_BASE_URL;
const ZALO_AUTH_URL = process.env.ZALO_AUTH_URL;

/**
 * Hàm gửi tin nhắn Zalo CS (Chăm sóc khách hàng)
 * @param {string} UID - User ID của người nhận
 * @param {string} text - Nội dung tin nhắn
 */
export const sendZaloMessage = async (UID, text, accessToken) => {
  if (!UID || !text) {
    logger.warn("Bỏ qua gửi tin Zalo vì thiếu UID hoặc text.");
    return;
  }

  const url = `${ZALO_API}/v3.0/oa/message/cs`;
  const payload = {
    recipient: { user_id: UID },
    message: { text: text },
  };
  const headers = {
    access_token: accessToken,
    "Content-Type": "application/json",
  };

  try {
    const response = await axios.post(url, payload, { headers });
    logger.info(`Đã gửi tin nhắn Zalo thành công đến [${UID}]`);
    return response.data;
  } catch (error) {
    logger.error(
      `Zalo API Error (sendZaloMessage to ${UID}):`,
      error.response?.data
    );
    // Ném lỗi để worker có thể retry nếu cần (ví dụ: lỗi 500 từ Zalo)
    throw new Error(
      error.response?.data?.message || "Failed to send Zalo message"
    );
  }
};

export const extractDisplayNameFromMessage = async (UID, accessToken) => {
  if (!UID) {
    logger.warn("Không có UID để thực hiện trích lọc");
    return null;
  }

  // Chuyển body JSON thành query string
  const queryData = encodeURIComponent(
    JSON.stringify({ user_id: UID, offset: 0, count: 1 })
  );
  const url = `${ZALO_API}/v2.0/oa/conversation?data=${queryData}`;

  const headers = {
    access_token: accessToken,
    "Content-Type": "application/json",
  };

  try {
    const response = await axios.get(url, { headers }); // GET không có body
    const messages = response.data?.data || [];
    const latestMessage = messages[0] || null;

    if (!latestMessage) {
      logger.warn(`[Zalo API] UID ${UID} chưa có tin nhắn nào`);
      return null;
    }

    logger.info(
      `Đã trích xuất tin nhắn từ UID ${UID}: ${
        latestMessage.from_display_name || "Không rõ tên"
      }`
    );
    return latestMessage;
  } catch (error) {
    logger.error(
      `Zalo API Error (extractDisplayNameFromMessage for ${UID}): ${JSON.stringify(
        error.response?.data,
        null,
        2
      )}`
    );
    throw new Error(
      error.response?.data?.message ||
        "Failed to extract display name from Zalo message"
    );
  }
};

export const getValidAccessToken = async () => {
  // 1. Lấy token duy nhất từ DB (Singleton)
  const tokenData = await ZaloTokens.findOne();

  if (!tokenData) {
    throw new Error(
      "CRITICAL: Chưa có dữ liệu Token trong DB. Vui lòng Admin đăng nhập thủ công lần đầu!"
    );
  }

  // 2. Kiểm tra thời gian hết hạn
  // Mẹo: Nên refresh sớm hơn 5-10 phút (buffer time) để tránh lỗi mạng vào phút chót
  const BUFFER_TIME = 5 * 60 * 1000;
  const now = new Date().getTime();
  const expireTime = new Date(tokenData.access_token_expires_at).getTime();

  logger.warn(BUFFER_TIME);
  logger.warn(now);
  logger.warn(expireTime);
  logger.warn(tokenData.access_token);

  if (expireTime - now > BUFFER_TIME) {
    return tokenData.access_token;
  }

  console.log("🔄 Zalo Token hết hạn, đang tự động refresh...");
  return await refreshAccessToken(tokenData);
};

const refreshAccessToken = async (tokenRecord) => {
  try {
    // Cấu hình Request theo đúng ảnh tài liệu bạn gửi
    const bodyParams = new URLSearchParams();
    bodyParams.append("refresh_token", tokenRecord.refresh_token);
    bodyParams.append("app_id", process.env.ZALO_APP_ID);
    bodyParams.append("grant_type", "refresh_token");

    const config = {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        secret_key: process.env.ZALO_SECRET_KEY, // Quan trọng: Header theo ảnh curl
      },
    };

    // Gọi POST request
    const response = await axios.post(ZALO_AUTH_URL, bodyParams, config);
    const data = response.data;

    // Kiểm tra xem Zalo có trả về lỗi không
    if (data.error) {
      throw new Error(
        `Zalo API Error: ${data.error_name} - ${data.error_description}`
      );
    }

    // 4. Cập nhật vào Database (Cập nhật bản ghi hiện tại, không tạo mới)
    tokenRecord.access_token = data.access_token;
    tokenRecord.refresh_token = data.refresh_token; // Luôn lưu refresh token mới

    // Tính toán thời gian hết hạn mới
    // data.expires_in là giây (thường là 90000s = 25h)
    const newExpireDate = new Date(Date.now() + Number(data.expires_in) * 1000);

    // Refresh token hết hạn sau 3 tháng (tùy chính sách Zalo, ta cứ set dư ra hoặc theo logic của họ)
    const newRefreshExpireDate = new Date(
      Date.now() + 90 * 24 * 60 * 60 * 1000
    );

    tokenRecord.access_token_expires_at = newExpireDate;
    tokenRecord.refresh_token_expires_at = newRefreshExpireDate;

    await tokenRecord.save();

    console.log("✅ Đã refresh token thành công!");
    return data.access_token;
  } catch (error) {
    console.error("❌ Lỗi khi refresh Zalo Token:", error.message);
    throw error;
  }
};
