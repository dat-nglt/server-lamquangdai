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
export const analyzeUserMessageService = async (
  messageFromUser,
  UID,
  accessToken
) => {
  const phoneNumberFromUser = extractPhoneNumber(messageFromUser);
  let displayName = "Anh/chị";
  let phoneInfo = null;
  if (phoneNumberFromUser && phoneNumberFromUser.length > 0) {
    phoneInfo = phoneNumberFromUser.join(", ");
    logger.info(`[Data] 📞 Phát hiện SĐT: ${phoneInfo}`);
  }

  try {
    const latestMessageFromUID = await extractDisplayNameFromMessage(
      UID,
      accessToken
    );
    displayName = latestMessageFromUID?.from_display_name;
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

  const prompt = `
  Dưới đây là hội thoại trước đó với khách hàng (nếu có):
  ${
    conversationHistory.length
      ? conversationService.getFormattedHistory(UID)
      : "(Chưa có hội thoại trước đó)"
  }
  
  Tin nhắn mới nhất của người dùng: "${messageFromUser}"
  
  ---
  **Thông tin đã biết:**
  * Tên khách hàng (từ hệ thống/lịch sử): "${displayName}"
  * Số điện thoại (từ regex): ${
    phoneInfo ? `"${phoneInfo}"` : "(Chưa phát hiện)"
  }

  ---
  **Nhiệm vụ:**
  Hãy phân tích tin nhắn mới nhất dựa trên bối cảnh hội thoại và thông tin đã biết.
  Trả về một đối tượng JSON duy nhất theo mẫu sau.

  **Lưu ý quan trọng khi điền vào mẫu:**
  1.  **tenKhachHang:** Ưu tiên sử dụng tên từ hệ thống ("${displayName}"). Tuy nhiên, nếu người dùng tự xưng tên MỚI hoặc khác trong tin nhắn mới nhất (ví dụ: "Mình tên là Minh"), hãy cập nhật bằng tên mới đó.
  2.  **soDienThoai:** Ưu tiên số điện thoại từ regex (${
    phoneInfo ? `"${phoneInfo}"` : `""`
  }). Nếu regex không phát hiện được, nhưng người dùng cung cấp số điện thoại rõ ràng trong tin nhắn mới nhất, hãy trích xuất số đó.
  3.  **nhuCau:** Tóm tắt ngắn gọn nhu cầu chính (ví dụ: "Hỏi về giá sản phẩm X", "Khiếu nại", "Cần tư vấn").
  4.  **daDuThongTin:** Đặt là \`true\` nếu bạn đã có cả (1) nhuCau, (2) tenKhachHang, VÀ (3) soDienThoai. Nếu thiếu bất kỳ thông tin nào trong ba thông tin này, hãy đặt là \`false\`.
  5.  **lyDo:** Nếu \`daDuThongTin\` là \`false\`, giải thích ngắn gọn thông tin nào còn thiếu (ví dụ: "Thiếu số điện thoại", "Chưa rõ nhu cầu").

  **Mẫu JSON (Chỉ trả về JSON này):**
  {
    "nhuCau": "",
    "tenKhachHang": "${displayName}",
    "soDienThoai": ${phoneInfo ? `"${phoneInfo}"` : `""`},
    "mucDoQuanTam": "",
    "daDuThongTin": false,
    "lyDo": ""
  }
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
export const informationForwardingSynthesisService = async (
  dataCustomer,
  accessToken
) => {
  // UID của Lead/Quản lý
  // const LEAD_UID = "5584155984018191145";
  const LEAD_UID = "7365147034329534561";

  try {
    const response = await sendZaloMessage(LEAD_UID, dataCustomer, accessToken);
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
