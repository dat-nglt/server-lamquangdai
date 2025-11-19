import logger from "../utils/logger.js";
import { zaloChatQueue } from "../chats/queue.service.js";

const DEBOUNCE_DELAY = 15000; // 15 giây

export const handleZaloWebhook = async (req, res) => {
    try {
        const UID = req.body?.sender?.id; // Lấy UID người gửi từ webhook
        const messageFromUser = req.body?.message?.text; // Lấy tin nhắn từ webhook
        const eventName = req.body?.event_name; // Lấy loại sự kiện từ webhook

        if (!UID || !messageFromUser || eventName !== "user_send_text") {
            console.log(eventName);

            // Kiểm tra tính hợp lệ của webhook
            logger.warn("Webhook không hợp lệ (thiếu UID hoặc message hoặc event_name không đúng)");
            return res.status(400).send("Invalid webhook data");
        }

        // const unAcceptUIDs = ["7888412520328172590", "1591235795556991810", "7365147034329534561"];
        // if (!unAcceptUIDs.includes(UID)) {
        //     logger.warn(`[Webhook] Bỏ qua tin nhắn từ [${UID} - ${messageFromUser}]`);
        //     return res.status(200).send("OK (Test user ignored)");
        // }

        // --- [LOGIC DEBOUNCE MỚI] ---
        logger.info(`[Webhook] Bắt đầu xử lý Redis/Queue cho UID: ${UID}`);

        try {
            // 1. Lấy Redis client từ queue (BullMQ cung cấp sẵn)
            const redisClient = await zaloChatQueue.client;
            logger.info(`[Webhook] Đã kết nối Redis client thành công`);

            // 2. Định nghĩa key/jobId cho người dùng này
            const pendingMessageKey = `pending-msgs-${UID}`;
            const debounceJobId = `debounce-job-${UID}`;

            // 3. Lưu tin nhắn này vào danh sách chờ trong Redis
            await redisClient.rpush(pendingMessageKey, messageFromUser);
            await redisClient.expire(pendingMessageKey, 3600);
            logger.info(`[Webhook] Đã lưu message vào Redis với key: ${pendingMessageKey}`);

            // 4. Tìm job cũ (nếu có) đang trong hàng đợi "delayed"
            const existingJob = await zaloChatQueue.getJob(debounceJobId);
            if (existingJob && (await existingJob.isDelayed())) {
                await existingJob.remove();
                logger.info(`[Webhook] Đã xóa job cũ: ${debounceJobId}`);
            }

            // 5. Thêm job "GỘP" vào hàng đợi với delay
            const newJob = await zaloChatQueue.add(
                "process-message",
                {
                    UID: UID,
                    isDebounced: true,
                },
                {
                    jobId: debounceJobId,
                    delay: DEBOUNCE_DELAY,
                }
            );

            logger.info(
                `[Webhook] Đã tạo tiến trình công việc thành công ID: ${
                    newJob.id
                } cho UID: ${UID} - ${messageFromUser}. Sẽ xử lý sau ${
                    DEBOUNCE_DELAY / 1000
                }s nếu không có thêm yêu cầu.`
            );

            // Gửi response sau khi tất cả xử lý thành công
            res.status(200).send("OK");
        } catch (queueError) {
            logger.error("[Webhook] Lỗi xử lý Redis/Queue:", {
                error: queueError.message,
                stack: queueError.stack,
                UID: UID,
                message: messageFromUser,
            });

            // Vẫn gửi response OK để Zalo không retry
            res.status(200).send("OK (Queue Error)");
        }
    } catch (error) {
        logger.error("[Webhook Controller] Lỗi nghiêm trọng:", error);
        if (!res.headersSent) {
            res.status(500).send("Internal Server Error");
        }
    }
};
