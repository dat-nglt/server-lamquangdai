// File này tập trung toàn bộ logic gọi API Zalo về một chỗ.

import axios from "axios";
import logger from "../utils/logger.js"; // Giả sử bạn có logger

const ACCESS_TOKEN = process.env.ZALO_ACCESS_TOKEN;
const ZALO_API = process.env.ZALO_API_BASE_URL;

/**
 * Hàm gửi tin nhắn Zalo CS (Chăm sóc khách hàng)
 * @param {string} UID - User ID của người nhận
 * @param {string} text - Nội dung tin nhắn
 */
export const sendZaloMessage = async (UID, text) => {
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
    access_token: ACCESS_TOKEN,
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

export const extractDisplayNameFromMessage = async (UID) => {
  if (!UID) {
    logger.warn("Không có UID để thực hiện trích lọc");
    return;
  }

  const url = `${ZALO_API}/v2.0/oa/conversation?data={"user_id":${UID},"offset":0,"count":1}`;

  logger.info(url);

  const headers = {
    access_token: ACCESS_TOKEN,
    "Content-Type": "application/json",
  };

  try {
    const response = await axios.post(url, {}, { headers });
    const messages = response.data?.data || [];
    const latestMessage = messages[0] || null;

    if (!latestMessage) {
      logger.warn(`[Zalo API] UID ${UID} chưa có tin nhắn nào`);
      return null;
    }

    logger.info(
      `Đã trích xuất tin nhắn từ UID ${UID}: ${latestMessage.from_display_name}`
    );
    return latestMessage;
  } catch (error) {
    logger.error(
      `Zalo API Error (extractDisplayNameFromMessage for ${UID}):`,
      error.response?.data
    );
    // Ném lỗi để worker có thể retry nếu cần (ví dụ: lỗi 500 từ Zalo)
    throw new Error(
      error.response?.data?.message ||
        "Failed to extract display name from Zalo message"
    );
  }
};
