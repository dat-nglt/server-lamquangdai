import { Worker } from "bullmq";
import logger from "./src/utils/logger.js";
import conversationService from "./src/utils/conversation.js";
import { handleChatService } from "./src/services/chatboxAI/chatbox.service.js";
import { getValidAccessToken, sendZaloMessage } from "./src/services/chatboxAI/zalo.service.js";
import { analyzeUserMessageService, informationForwardingSynthesisService } from "./src/services/chatboxAI/analyze.service.js";
import { appendJsonToSheet } from "./src/services/chatboxAI/googleSheet.service.js";

const connection = {
    host: process.env.REDIS_HOST || "localhost",
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD || "dat20April@03",
};

logger.info("[Worker] Đang khởi động và lắng nghe hàng đợi [zalo-chat]...");

const worker = new Worker(
    "zalo-chat", // Tên hàng đợi
    async (job) => {
        const { UID, isDebounced } = job.data; // Lấy UID và cờ isDebounced từ dữ liệu job
        const redisClient = await worker.client; // Lấy Redis client từ worker
        const pendingMessageKey = `pending-msgs-${UID}`; // Key Redis cho tin nhắn chờ
        let messageFromUser; // Biến này sẽ chứa tin nhắn cuối cùng (đã gộp)

        if (isDebounced) {
            // 3. Lấy TẤT CẢ tin nhắn đang chờ
            const messages = await redisClient.lrange(pendingMessageKey, 0, -1);

            if (messages.length === 0) {
                logger.warn(
                    `[Worker] Tiến trình ${job.id} cho UID ${UID} không có tin nhắn nào (có thể đã xử lý rồi) [bỏ qua...]`
                );
                return; // Hoàn thành job, không làm gì cả
            }

            // 5. Gộp các tin nhắn lại
            messageFromUser = messages.join(", ");
        } else {
            // Trường hợp job cũ không có cờ "isDebounced"
            logger.warn(`[Worker] Job ${job.id} cho UID ${UID} không có cờ 'isDebounced'. Xử lý như job thường.`);
            messageFromUser = job.data.messageFromUser;
        }

        // --- [LOGIC XỬ LÝ CHÍNH BẮT ĐẦU TỪ ĐÂY] ---

        const accessToken = await getValidAccessToken(); // Lấy accessToken hợp lệ để gửi tin nhắn & tự động refresh nếu cần
        if (!accessToken) {
            logger.error(`Không nhận được accessToken`);
            throw new Error("No valid access token available");
        }

        logger.info(`[Worker] Bắt đầu xử lý phiên trò chuyện [${job.id}] cho ${UID} với nội dung: ${messageFromUser}`);

        try {
            // 1. Lưu tin nhắn người dùng vào lịch sử cuộc trò chuyện [đã gộp nếu có]
            conversationService.addMessage(UID, "user", messageFromUser);
            let jsonData = null; // Biến để lưu dữ liệu phân tích

            logger.info(`[Worker] Đang phân tích tin nhắn người dùng cho UID ${UID}...`);

            try {
                const analyzeResult = await analyzeUserMessageService(messageFromUser, UID, accessToken);
                logger.info(`[Worker] Phân tích tin nhắn người dùng cho UID ${UID} hoàn thành.`);
                const analyzeJSON = analyzeResult.replace("```json", "").replace("```", "").trim();
                jsonData = JSON.parse(analyzeJSON);
            } catch (analyzeError) {
                logger.error(`[Worker] Lỗi khi PHÂN TÍCH cho UID ${UID}:`, analyzeError.message);
                throw analyzeError;
            }

            if (jsonData && jsonData.soDienThoai && jsonData.nhuCau) {
                const previouslySentPhone = conversationService.getSentLeadPhone(UID); // Lấy SĐT đã gửi Lead (nếu có)
                if (previouslySentPhone && previouslySentPhone === jsonData.soDienThoai) {
                    // Đã gửi Lead cho SĐT này rồi hay chưa???
                    logger.info(
                        `[Worker] Đã gửi thông tin đến Lead cho UID ${UID} rồi [bỏ qua việc gửi lại] - SĐT: ${jsonData.soDienThoai}`
                    );
                } else {
                    logger.info(`[Worker] Gửi thông tin đến Lead cho UID ${UID}. SĐT mới: ${jsonData.soDienThoai}`);
                    const dataCustomer = `🔔 THÔNG TIN KHÁCH HÀNG MỚI
                                        
    👤 Tên khách hàng: ${jsonData.tenKhachHang || "Anh/chị"}
    📞 Số điện thoại: ${jsonData.soDienThoai}
    💼 Nhu cầu: ${jsonData.nhuCau}
    ⭐ Mức độ quan tâm: ${jsonData.mucDoQuanTam}

🚨 VUI LÒNG LIÊN HỆ KHÁCH HÀNG NGAY!`;

                    try {
                        await appendJsonToSheet("data-from-chatbox-ai", jsonData);
                    } catch (sheetError) {
                        logger.error(
                            `[Worker] LỖI NGHIÊM TRỌNG: Không thể ghi Sheet cho SĐT ${jsonData.soDienThoai}:`,
                            sheetError.message
                        );
                    }

                    try {
                        await informationForwardingSynthesisService(
                            UID,
                            dataCustomer,
                            accessToken,
                            jsonData.soDienThoai
                        );
                        logger.info(`[Worker] Đã gửi thông tin Lead thành công cho UID: ${UID}`);
                    } catch (leadError) {
                        logger.error(`[Worker] Lỗi khi GỬI LEAD cho UID ${UID}:`, leadError.message);
                    }
                }
            } else {
                logger.warn(`[Worker] Chưa đủ thông tin Lead hoặc lỗi phân tích cho UID: ${UID}`);
            }

            logger.info(`[Worker] Đang gọi AI phản hồi cho phiên trò chuyện [${UID}]  [${messageFromUser}]`); // 4. Xử lý chat với AI (dùng tin đã gộp)

            // Truyền accessToken vào handleChatService để có thể gửi thông báo cho ADMIN
            const messageFromAI = await handleChatService(messageFromUser, UID, accessToken); // 5. Lưu phản hồi AI

            conversationService.addMessage(UID, "model", messageFromAI);
            logger.info(`[Worker] AI trả lời [${UID}]: ${messageFromAI.substring(0, 20)}...`); // 6. Gửi tin nhắn trả lời "thật" cho Zalo

            await sendZaloMessage(UID, messageFromAI, accessToken);

            logger.info(`[Worker] Phiên trò chuyện [${job.id}] đã xử lý xong cho [${UID}]`);
            // 4. Xóa key đó ra khỏi Redis để tránh xử lý lại & tràn bộ nhớ
            await redisClient.del(pendingMessageKey);
        } catch (error) {
            // BẤT KỲ LỖI NÀO BỊ NÉM RA (chủ yếu là 503 từ handleChatService)
            // Sẽ bị bắt ở đây.
            logger.error(
                `[Worker] Phiên làm việc [${job.id}] xử lý thất bại cho ${UID}: ${error.message}. Sẽ tiến hành thực hiện lại...`
            ); // Ném lỗi này ra ngoài để BullMQ biết và retry job
            throw error;
        }
    },
    { connection }
);

worker.on("completed", (job) => {
    logger.info(`[Worker] Đã hoàn thành phiên làm việc [${job.id}]`);
});

worker.on("failed", (job, err) => {
    logger.error(`[Worker] Phiên làm việc ${job.id} thất bại sau ${job.attemptsMade} lần thử: ${err.message}`);
});
