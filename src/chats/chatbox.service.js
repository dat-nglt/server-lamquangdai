import { GoogleGenAI } from "@google/genai";
import { SYSTEM_INSTRUCTION_RESPONSE } from "../promts/promt.v1.response.js";
import logger from "../utils/logger.js";

const API_KEY = process.env.GEMENI_API_KEY;
if (!API_KEY) {
  throw new Error("GEMINI_API_KEY chưa được thiết lập trong file .env");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

// (Giữ nguyên createChatSessionService)
export const createChatSessionService = () => {
  const chat = ai.chats.create({
    model: "gemini-2.5-flash",
    config: {
      systemInstruction: SYSTEM_INSTRUCTION_RESPONSE,
    },
  });
  return chat;
};

// (Giữ nguyên getOrCreateChatSession)
const chatSessions = new Map();
const getOrCreateChatSession = (UID) => {
  if (chatSessions.has(UID)) {
    logger.info(`[Chat Service] Đang lấy session cho user: ${UID}`);
    return chatSessions.get(UID);
  }
  logger.info(`[Chat Service] Tạo session MỚI cho user: ${UID}`);
  const newChatSession = createChatSessionService();
  chatSessions.set(UID, newChatSession);
  return newChatSession;
};

// *** ĐÂY LÀ PHẦN QUAN TRỌNG ĐƯỢC CẬP NHẬT ***
export const handleChatService = async (userMessage, UID) => {
  const chatSession = getOrCreateChatSession(UID);

  try {
    const responseFromAI = await chatSession.sendMessage({
      message: userMessage,
    });

    if (
      responseFromAI &&
      responseFromAI.candidates?.[0]?.content?.parts?.[0]?.text
    ) {
      // Trả về text nếu thành công
      return responseFromAI.candidates[0].content.parts[0].text;
    } else {
      // Trường hợp AI trả về rỗng hoặc bị chặn (lỗi "cứng")
      logger.warn(`[AI Warning] Phản hồi rỗng/bị chặn cho user: ${UID}`);
      return "Cảm ơn anh/chị đã tin tưởng liên hệ đến Lâm Quang Đại, anh chị vui lòng để lại số điện thoại để em chuyển tiếp đến bộ phận kinh doanh hỗ trợ mình thêm ạ";
    }
  } catch (error) {
    logger.error(
      `[AI Error] Lỗi khi gọi Gemini cho user ${UID}:`,
      error.message
    );

    // KIỂM TRA LỖI 503 (HOẶC LỖI MẠNG)
    const errorMessage = error.message || "";
    if (
      errorMessage.includes("503") ||
      errorMessage.includes("overloaded") ||
      errorMessage.includes("ECONNRESET")
    ) {
      logger.warn(
        `[AI Error] Lỗi ${
          error.status || "Mạng"
        } (Quá tải/Mất kết nối). YÊU CẦU THỬ LẠI.`
      );
      // NÉM LỖI này ra để Worker (BullMQ) bắt được và retry
      throw new Error(`Lỗi 503/Mạng: Gemini quá tải/mất kết nối. Sẽ thử lại.`);
    }

    // Các lỗi khác (400, 401...) là lỗi "cứng", không retry, trả về mặc định
    return "Cảm ơn anh/chị đã tin tưởng liên hệ đến Lâm Quang Đại, anh chị vui lòng để lại số điện thoại để em chuyển tiếp đến bộ phận kinh doanh hỗ trợ mình thêm ạ";
  }
};
