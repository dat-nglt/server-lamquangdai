import { Worker } from "bullmq";
import logger from "./src/utils/logger.js";
import conversationService from "./src/utils/conversation.js";
import { handleChatService } from "./src/chats/chatbox.service.js";
import {
    getValidAccessToken,
    sendZaloMessage,
} from "./src/chats/zalo.service.js";
import {
    analyzeUserMessageService,
    informationForwardingSynthesisService,
} from "./src/chats/analyze.service.js";
import { appendJsonToSheet } from "./src/chats/googleSheet.js";

const connection = {
    host: process.env.REDIS_HOST || "localhost",
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD || "dat20April@03",
};

logger.info("[Worker] Đang khởi động và lắng nghe hàng đợi 'zalo-chat'...");

const worker = new Worker(
    "zalo-chat",
    async (job) => {
        // 1. Lấy data từ job
        const { UID, isDebounced } = job.data;
        const redisClient = await worker.client;
        const pendingMessageKey = `pending-msgs-${UID}`;
        let messageFromUser; // Biến này sẽ chứa tin nhắn cuối cùng (đã gộp)

        if (isDebounced) {
            // 3. Lấy TẤT CẢ tin nhắn đang chờ
            const messages = await redisClient.lrange(pendingMessageKey, 0, -1);

            if (messages.length === 0) {
                logger.warn(
                    `[Worker] Job ${job.id} cho UID ${UID} không có tin nhắn nào (có thể đã xử lý rồi). Bỏ qua.`
                );
                return; // Hoàn thành job, không làm gì cả
            }

            // 5. Gộp các tin nhắn lại
            messageFromUser = messages.join(", ");
        } else {
            // Trường hợp job cũ không có cờ "isDebounced"
            logger.warn(
                `[Worker] Job ${job.id} cho UID ${UID} không có cờ 'isDebounced'. Xử lý như job thường.`
            );
            messageFromUser = job.data.messageFromUser;
        }

        // --- [LOGIC XỬ LÝ CHÍNH BẮT ĐẦU TỪ ĐÂY] ---

        const accessToken = await getValidAccessToken();
        if (!accessToken) {
            logger.error(`Không nhận được accessToken`);
        }
        logger.info(
            `[Worker] Bắt đầu xử lý job [${job.id}] cho UID: ${UID}: ${messageFromUser}`
        );

        try {
            // 1. Lưu tin nhắn (đã gộp)
            conversationService.addMessage(UID, "user", messageFromUser);

            let jsonData = null;
            try {
                const analyzeResult = await analyzeUserMessageService(
                    messageFromUser, // Dùng biến đã gộp
                    UID,
                    accessToken
                );
                const analyzeJSON = analyzeResult
                    .replace("```json", "")
                    .replace("```", "")
                    .trim();
                jsonData = JSON.parse(analyzeJSON);
            } catch (analyzeError) {
                logger.error(
                    `[Worker] Lỗi khi PHÂN TÍCH cho UID ${UID}:`,
                    analyzeError.message
                );
            } // 3. Gửi thông tin Lead (Giữ nguyên logic kiểm tra SĐT của bạn)

            if (jsonData && jsonData.soDienThoai && jsonData.nhuCau) {
                const previouslySentPhone =
                    conversationService.getSentLeadPhone(UID);
                if (
                    previouslySentPhone &&
                    previouslySentPhone === jsonData.soDienThoai
                ) {
                    logger.info(
                        `[Worker] Đã gửi Lead cho UID ${UID} rồi. Bỏ qua...`
                    );
                } else {
                    logger.info(
                        `[Worker] Gửi Lead cho UID ${UID}. SĐT mới: ${jsonData.soDienThoai}`
                    );
                    const dataCustomer = `- Nhu cầu: ${
                        jsonData.nhuCau
                    }\n- Tên zalo khách hàng: ${
                        jsonData.tenKhachHang || "Anh/chị"
                    }\n- Số điện thoại: ${
                        jsonData.soDienThoai
                    }\n- Mức độ quan tâm: ${
                        jsonData.mucDoQuanTam
                    }\n📞Vui lòng phân bổ liên hệ lại khách hàng ngay!`;

                    const timeoutPromise = (
                        ms,
                        message = "Request timed out"
                    ) => {
                        return new Promise((_, reject) => {
                            setTimeout(() => {
                                reject(new Error(message));
                            }, ms);
                        });
                    };

                        try {
                        // Chạy đua 2 promise:
                        // 1. Hàm ghi Sheet
                        // 2. Hàm đếm ngược 10 giây
                        await Promise.race([
                            appendJsonToSheet("data-m-1", jsonData),
                            timeoutPromise(
                                10000,
                                "Ghi Google Sheet quá 10 giây"
                            ), // 10000ms = 10s
                        ]);
                    } catch (sheetError) {
                        // BẤT KỲ lỗi nào (lỗi API thật, hoặc lỗi timeout) đều sẽ bị bắt ở đây

                        // Phải dừng lại và báo lỗi, KHÔNG gửi Zalo
                        logger.error(
                            `[Worker] LỖI NGHIÊM TRỌNG: Không thể ghi Sheet cho SĐT ${jsonData.soDienThoai}:`,
                            sheetError.message // <-- Sẽ hiển thị 'Ghi Google Sheet quá 10 giây' nếu timeout
                        );
                        // Ném lỗi này ra để worker bên ngoài biết và retry
                        throw sheetError;
                    }

                    try {
                        await informationForwardingSynthesisService(
                            UID,
                            dataCustomer,
                            accessToken,
                            jsonData.soDienThoai
                        );
                        logger.info(
                            `[Worker] Đã gửi thông tin Lead thành công cho UID: ${UID}`
                        );
                    } catch (leadError) {
                        logger.error(
                            `[Worker] Lỗi khi GỬI LEAD cho UID ${UID}:`,
                            leadError.message
                        );
                    }
                }
            } else {
                logger.warn(
                    `[Worker] Chưa đủ thông tin Lead hoặc lỗi phân tích cho UID: ${UID}`
                );
            }

            logger.info(
                `[Worker] Đang gọi AI Chat cho UID [${UID}] Nội dung [${messageFromUser}]`
            ); // 4. Xử lý chat với AI (dùng tin đã gộp)

            const messageFromAI = await handleChatService(messageFromUser, UID); // 5. Lưu phản hồi AI

            conversationService.addMessage(UID, "model", messageFromAI);
            logger.info(
                `[Worker] AI trả lời [${UID}]: ${messageFromAI.substring(
                    0,
                    50
                )}...`
            ); // 6. Gửi tin nhắn trả lời "thật" cho Zalo

            await sendZaloMessage(UID, messageFromAI, accessToken);

            logger.info(`[Worker] Job [${job.id}] HOÀN THÀNH cho UID: ${UID}`);
            // 4. Xóa key đó đi
            await redisClient.del(pendingMessageKey);
        } catch (error) {
            // BẤT KỲ LỖI NÀO BỊ NÉM RA (chủ yếu là 503 từ handleChatService)
            // Sẽ bị bắt ở đây.
            logger.error(
                `[Worker] Job [${job.id}] THẤT BẠI cho UID ${UID}: ${error.message}. Sẽ thử lại...`
            ); // Ném lỗi này ra ngoài để BullMQ biết và retry job
            throw error;
        }
    },
    { connection }
);

worker.on("completed", (job) => {
    logger.info(`[Worker] Đã hoàn thành tác vụ ${job.id}`);
});

worker.on("failed", (job, err) => {
    logger.error(
        `[Worker] Job ${job.id} thất bại sau ${job.attemptsMade} lần thử: ${err.message}`
    );
});
