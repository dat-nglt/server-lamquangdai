import { zaloChatQueue } from "../chats/queue.service.js";
import { sendZaloMessage } from "../chats/zalo.service.js";
import logger from "../utils/logger.js";

const ADMIN_UID = "5584155984018191145";
let isAiActive = true; // Mặc định là AI đang hoạt động

// Hàm này là hàm chính xử lý webhook đến từ Zalo
export const handleZaloWebhook = async (req, res) => {
  try {
    const UID = req.body?.sender?.id;
    const messageFromUser = req.body?.message?.text;

    if (!UID || !messageFromUser) {
      logger.warn("Webhook không hợp lệ (thiếu UID hoặc message)", req.body);
      return res.status(400).send("Invalid webhook data");
    }

    const ignoredUIDs = [
      "7365147034329534561", // UID Admin - Tấn Đạt
      "6261117697809429940", // UID chị Yến
      "5584155984018191145", // UID anh Bạc
    ];

    // Test mode
    if (ignoredUIDs.includes(UID)) {
      logger.warn(
        `[Webhook] Bỏ qua tin nhắn từ [UID: ${UID} - ${messageFromUser}] `
      );
      return res.status(200).send("OK (Test user ignored)");
    }

    // 3. Thêm job vào hàng đợi (Nhà bếp)
    await zaloChatQueue.add("process-message", {
      UID: UID,
      messageFromUser: messageFromUser,
    });

    logger.info(
      `[Webhook] Đã nhận và đưa vào queue cho UID: ${UID} - ${messageFromUser}`
    );

    // 4. Phản hồi 200 OK cho Zalo NGAY LẬP TỨC
    res.status(200).send("OK");
  } catch (error) {
    logger.error("[Webhook Controller] Lỗi nghiêm trọng:", error);
    res.status(500).send("Internal Server Error");
  }
};
