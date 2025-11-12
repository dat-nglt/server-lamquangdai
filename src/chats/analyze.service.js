import { GoogleGenAI } from "@google/genai";
import { SYSTEM_INSTRUCTION_ANALYZE } from "../promts/promt.v1.analyze.js";
import { extractPhoneNumber } from "../utils/extractPhoneNumber.js";
import conversationService from "../utils/conversation.js";
import logger from "../utils/logger.js";
import {
  extractDisplayNameFromMessage,
  sendZaloMessage,
} from "./zalo.service.js"; // Import hàm gửi Zalo

const API_KEY = process.env.GEMENI_API_KEY;
const ai = new GoogleGenAI({ apiKey: API_KEY });

// (Giữ nguyên analyzeUserMessageService, không cần sửa)
export const analyzeUserMessageService = async (messageFromUser, UID) => {
  const phoneNumberFromUser = extractPhoneNumber(messageFromUser);
  let displayName = "Anh/chị";
  let phoneInfo = null;
  if (phoneNumberFromUser && phoneNumberFromUser.length > 0) {
    phoneInfo = phoneNumberFromUser.join(", ");
    logger.info(`[Data] 📞 Phát hiện SĐT: ${phoneInfo}`);
  }

  try {
    const latestMessageFromUID = await extractDisplayNameFromMessage(UID);
    displayName = latestMessageFromUID?.from_display_name;
    logger.info(`Tên người dùng: ${displayName}`);
  } catch (error) {
    logger.warn(
      `Không thể xác định tên người dùng - Giá trị mặc định: Anh/chị`
    );
  }

  const chat = ai.chats.create({
    model: "gemini-2.5-flash",
    config: {
      systemInstruction: SYSTEM_INSTRUCTION_ANALYZE,
    },
  });

  const conversationHistory = conversationService.getConversationHistory(UID);
  logger.error(displayName);

  const prompt = `
  Dưới đây là hội thoại trước đó với khách hàng (nếu có):
  ${
    conversationHistory.length
      ? conversationService.getFormattedHistory(UID)
      : "(Chưa có hội thoại trước đó)"
  }
  Tin nhắn mới nhất của người dùng: "${messageFromUser}"
  ${
    phoneInfo
      ? `Số điện thoại phát hiện qua regex: ${phoneInfo}`
      : "Regex chưa phát hiện được số điện thoại."
  }

  Hãy phân tích và trả về JSON theo mẫu:
  { "nhuCau": "", "tenKhachHang": ${displayName}, "soDienThoai": "", "mucDoQuanTam": "", "daDuThongTin": false, "lyDo": "" }
  `;

  // Thêm try...catch ở đây để nó cũng ném lỗi 503 nếu có
  try {
    const analyzeFromAI = await chat.sendMessage({ message: prompt });
    const textMessage =
      analyzeFromAI?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || null;

    if (!textMessage) {
      logger.warn(`[AI Analyze] ⚠️ Phản hồi rỗng cho user ${UID}`);
      throw new Error("Không đủ dữ liệu để phân tích (phản hồi rỗng)");
    }
    return textMessage;
  } catch (error) {
    logger.error(
      `[AI Analyze Error] Lỗi khi gọi Gemini (Phân tích) cho user ${UID}:`,
      error.message
    );
    // Ném lỗi này ra để worker bắt
    throw error;
  }
};

// (Sửa lại informationForwardingSynthesisService để dùng hàm sendZaloMessage)
export const informationForwardingSynthesisService = async (dataCustomer) => {
  // UID của Lead/Quản lý
  const LEAD_UID = "7365147034329534561";

  try {
    const response = await sendZaloMessage(LEAD_UID, dataCustomer);
    logger.info(`Đã gửi thông tin khách hàng đến Lead [UID: ${LEAD_UID}]`);
    return response; // Trả về phản hồi từ Zalo
  } catch (error) {
    logger.error(
      `Lỗi khi gửi thông tin Lead đến [UID: ${LEAD_UID}]:`,
      error.message
    );
    // Ném lỗi để worker biết (mặc dù job chính vẫn có thể thành công)
    throw new Error("Failed to send lead info");
  }
};
