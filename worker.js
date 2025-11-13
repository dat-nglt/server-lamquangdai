import { Worker } from "bullmq";
import logger from "./src/utils/logger.js";
// Đảm bảo import conversationService từ file đã cập nhật (có getSentLeadPhone)
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

// Kết nối đến Redis (phải giống hệt file queue.service.js)
const connection = {
  host: process.env.REDIS_HOST || "localhost",
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || "dat20April@03",
};

logger.info("[Worker] Đang khởi động và lắng nghe hàng đợi 'zalo-chat'...");

const worker = new Worker(
  "zalo-chat",
  async (job) => {
    const { UID, messageFromUser } = job.data;
    const accessToken = await getValidAccessToken();
    if (!accessToken) {
      logger.error(`Không nhận được accessToken`);
    }
    logger.info(`[Worker] Bắt đầu xử lý job [${job.id}] cho UID: ${UID}`); // *** TOÀN BỘ LOGIC GIẢI THUẬT NẰM TRONG NÀY ***

    try {
      // 1. Lưu tin nhắn người dùng
      conversationService.addMessage(UID, "user", messageFromUser); // 2. Phân tích tin nhắn (với try-catch riêng) // Chúng ta muốn: nếu phân tích lỗi, vẫn tiếp tục chat

      let jsonData = null;
      try {
        const analyzeResult = await analyzeUserMessageService(
          messageFromUser,
          UID,
          accessToken
        );
        const analyzeJSON = analyzeResult
          .replace("```json", "")
          .replace("```", "")
          .trim();
        jsonData = JSON.parse(analyzeJSON);
      } catch (analyzeError) {
        // Lỗi này (kể cả 503) cũng chỉ ghi log, không retry job
        logger.error(
          `[Worker] Lỗi phân tích dữ liệu cho [UID: ${UID}] - Bỏ qua bước phân tích`,
          analyzeError.message
        );
      } // 3. Gửi thông tin Lead (nếu phân tích thành công)

      if (jsonData && jsonData.soDienThoai && jsonData.nhuCau) {
        // [LOGIC MỚI] Kiểm tra SĐT đã được gửi đi trước đó chưa
        const previouslySentPhone = conversationService.getSentLeadPhone(UID);

        // [LOGIC MỚI] So sánh SĐT vừa phân tích được với SĐT đã lưu
        if (
          previouslySentPhone &&
          previouslySentPhone === jsonData.soDienThoai
        ) {
          // SĐT này đã được gửi rồi. Bỏ qua.
          logger.info(
            `[Worker] Đã gửi Lead cho UID ${UID} với SĐT ${previouslySentPhone} rồi. Bỏ qua...`
          );
        } else {
          // Đây là SĐT mới, hoặc SĐT đã thay đổi, hoặc lần đầu tiên.
          // -> Tiến hành gửi Lead
          logger.info(
            `[Worker] Gửi Lead cho UID ${UID}. SĐT mới/thay đổi: ${jsonData.soDienThoai}`
          );
          console.log(jsonData); // In ra jsonData để kiểm tra

          const dataCustomer = `- Nhu cầu: ${jsonData.nhuCau}
- Tên zalo khách hàng: ${jsonData.tenKhachHang || "Anh/chị"}
- Số điện thoại: ${jsonData.soDienThoai}
- Mức độ quan tâm: ${jsonData.mucDoQuanTam}
📞Vui lòng phân bổ liên hệ lại khách hàng ngay!`;
          try {
            // [LOGIC MỚI] Thêm tham số thứ 4: jsonData.soDienThoai
            const sentPhoneNumber = jsonData.soDienThoai;
            await informationForwardingSynthesisService(
              UID,
              dataCustomer,
              accessToken,
              sentPhoneNumber // Truyền SĐT vào service
            );
            logger.info(
              `[Worker] Đã gửi thông tin Lead thành công cho UID: ${UID}`
            );
          } catch (leadError) {
            logger.error(
              `[Worker] Lỗi khi GỬI LEAD cho UID ${UID}:`,
              leadError.message
            ); // Lỗi này cũng không retry job
          }
        } // Đóng else của [LOGIC MỚI]
      } else {
        logger.warn(
          `[Worker] Chưa đủ thông tin Lead hoặc lỗi phân tích cho UID: ${UID}`
        );
      }

      logger.info(
        `[Worker] Đang gọi Gemeni - Tiếp nhận & Phản hồi [UID: ${UID}] với nội dung tin nhắn: ${messageFromUser}`
      ); // 4. Xử lý chat với AI (Đây là bước có thể retry) // Hàm này sẽ NÉM LỖI 503 (như đã sửa ở trên)

      const messageFromAI = await handleChatService(messageFromUser, UID); // 5. Lưu phản hồi AI

      conversationService.addMessage(UID, "model", messageFromAI);
      logger.info(`[Worker] AI trả lời [${UID}]: ${messageFromAI}`); // 6. Gửi tin nhắn trả lời "thật" cho Zalo (Shipper đi giao)

      await sendZaloMessage(UID, messageFromAI, accessToken);

      logger.info(`[Worker] Tiến trình công việc [${job.id}] HOÀN THÀNH cho UID: ${UID}`);
    } catch (error) {
      // BẤT KỲ LỖI NÀO BỊ NÉM RA (chủ yếu là 503 từ handleChatService)
      // Sẽ bị bắt ở đây.
      logger.error(
        `[Worker] Tiến trình công việc [${job.id}] THẤT BẠI cho UID ${UID}: ${error.message}. Đang chờ thử lại yêu cầu...`
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
    `[Worker] Tiến trình công việc ${job.id} thất bại sau ${job.attemptsMade} lần thử: ${err.message}`
  );
});
