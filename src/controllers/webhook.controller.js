import { zaloChatQueue } from "../chats/queue.service.js";
import { sendZaloMessage } from "../chats/zalo.service.js";
import logger from "../utils/logger.js";

// Hàm này là hàm chính xử lý webhook đến từ Zalo
export const handleZaloWebhook = async (req, res) => {
  try {
    // 1. Trích xuất thông tin (Tùy theo cấu trúc webhook của bạn)
    // Giả sử:
    const UID = req.body?.sender?.id;
    const messageFromUser = req.body?.message?.text;

    if (!UID || !messageFromUser) {
      logger.warn("Webhook không hợp lệ (thiếu UID hoặc message)", req.body);
      return res.status(400).send("Invalid webhook data");
    }

    // Test mode
    if (UID !== "7365147034329534561") {
      logger.warn(`[Webhook] Bỏ qua tin nhắn từ user test: ${UID}`);
      return res.status(200).send("OK (Test user ignored)");
    }

    // // 2. Gửi tin nhắn "chờ" (Không cần await - Fire and Forget)
    // sendZaloMessage(
    //   UID,
    //   "Dạ"
    // ).catch((err) => {
    //   // Ghi log nếu gửi tin "chờ" thất bại, nhưng không dừng luồng chính
    //   logger.error(
    //     `[Webhook] Lỗi khi gửi tin "chờ" đến ${UID}: ${err.message}`
    //   );
    // });

    // 3. Thêm job vào hàng đợi (Nhà bếp)
    await zaloChatQueue.add("process-message", {
      UID: UID,
      messageFromUser: messageFromUser,
    });

    logger.info(`[Webhook] Đã nhận và đưa vào queue cho UID: ${UID}`);

    // 4. Phản hồi 200 OK cho Zalo NGAY LẬP TỨC
    res.status(200).send("OK");
  } catch (error) {
    logger.error("[Webhook Controller] Lỗi nghiêm trọng:", error);
    res.status(500).send("Internal Server Error");
  }
};
