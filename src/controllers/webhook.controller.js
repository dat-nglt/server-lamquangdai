import logger from "../utils/logger.js";
import { zaloChatQueue } from "../chats/queue.service.js"; // Đảm bảo import queue

// Thời gian chờ (debounce) tính bằng mili-giây
const DEBOUNCE_DELAY = 10000; // 20 giây

export const handleZaloWebhook = async (req, res) => {
  try {
    const UID = req.body?.sender?.id;
    const messageFromUser = req.body?.message?.text;

    if (!UID || !messageFromUser) {
      logger.warn("Webhook không hợp lệ (thiếu UID hoặc message)", req.body);
      return res.status(400).send("Invalid webhook data");
    }

    // ... (Phần code ignoredUIDs của bạn giữ nguyên) ...
    const ignoredUIDs = [
      "7365147034329534561",
      "6261117697809429940",
      "5584155984018191145",
      "9032072449004512527"
    ];
    if (!ignoredUIDs.includes(UID)) {
      logger.warn(
        `[Webhook] Bỏ qua tin nhắn từ [UID: ${UID} - ${messageFromUser}]`
      );
      return res.status(200).send("OK (Test user ignored)");
    }

    // --- [LOGIC DEBOUNCE MỚI] ---

    // 1. Lấy Redis client từ queue (BullMQ cung cấp sẵn)
    const redisClient = await zaloChatQueue.client;

    // 2. Định nghĩa key/jobId cho người dùng này
    const pendingMessageKey = `pending-msgs-${UID}`;
    const debounceJobId = `debounce-job-${UID}`;

    // 3. Lưu tin nhắn này vào danh sách chờ trong Redis
    // Chúng ta dùng RPUSH để thêm vào cuối danh sách
    await redisClient.rpush(pendingMessageKey, messageFromUser);
    // Tự động xóa key này sau 1 giờ nếu worker có lỗi, tránh rác Redis
    await redisClient.expire(pendingMessageKey, 3600);

    // 4. Tìm job cũ (nếu có) đang trong hàng đợi "delayed"
    const existingJob = await zaloChatQueue.getJob(debounceJobId);
    if (existingJob && (await existingJob.isDelayed())) {
      // Nếu tìm thấy, xóa nó đi. Chúng ta sẽ tạo một job mới (reset timer)
      await existingJob.remove();
    } // 5. Thêm job "GỘP" vào hàng đợi với 20s delay

    // Lưu ý: data chỉ cần UID. Worker sẽ tự lấy message từ Redis
    await zaloChatQueue.add(
      "process-message",
      {
        UID: UID,
        isDebounced: true, // Thêm cờ này để worker biết cách xử lý
      },
      {
        jobId: debounceJobId, // ID cố định cho user
        delay: DEBOUNCE_DELAY, // Luôn đợi 20s
      }
    );

    logger.info(
      `[Webhook] Đã gộp/đặt lại timer cho UID: ${UID} - ${messageFromUser}. Sẽ xử lý sau 20s.`
    ); // 6. Phản hồi 200 OK cho Zalo NGAY LẬP TỨC

    res.status(200).send("OK");
  } catch (error) {
    logger.error("[Webhook Controller] Lỗi nghiêm trọng:", error);
    res.status(500).send("Internal Server Error");
  }
};
