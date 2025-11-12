import axios from "axios";
import { GoogleGenAI } from "@google/genai";
import { SYSTEM_INSTRUCTION_RESPONSE } from "../promts/promt.v1.response.js";
import { extractPhoneNumber } from "../utils/extractPhoneNumber.js";
import conversationService from "../utils/conversation.js";
import { SYSTEM_INSTRUCTION_ANALYZE } from "../promts/promt.v1.analyze.js";
import logger from "../utils/logger.js";

const API_KEY = process.env.GEMENI_API_KEY;
const ACCESS_TOKEN = process.env.ZALO_ACCESS_TOKEN;
const ZALO_API_BASE_URL = "https://openapi.zalo.me";

if (!ACCESS_TOKEN) {
  throw new Error("ZALO_ACCESS_TOKEN chưa được thiết lập trong file .env");
}
if (!API_KEY) {
  throw new Error("GEMINI_API_KEY chưa được thiết lập trong file .env");
}

const ai = new GoogleGenAI({
  apiKey: API_KEY,
});

export const createChatSessionService = () => {
  const chat = ai.chats.create({
    model: "gemini-2.5-flash",
    config: {
      systemInstruction: SYSTEM_INSTRUCTION_RESPONSE,
    },
  });
  return chat;
};

export const analyzeUserMessageService = async (
  messageFromUser,
  UID // Thêm UID để lấy lịch sử
) => {
  // 1️⃣ Lấy lịch sử hội thoại từ conversationService

  // 2️⃣ Tự động trích xuất số điện thoại bằng regex trước
  const phoneNumberFromUser = extractPhoneNumber(messageFromUser);

  if (phoneNumberFromUser && phoneNumberFromUser.length > 0) {
    let phoneInfo = phoneNumberFromUser.join(", ");
    console.log(`[Data] 📞 Phát hiện SĐT: ${phoneInfo}`);
  }

  // 3️⃣ Tạo session AI với hướng dẫn thông minh
  const chat = ai.chats.create({
    model: "gemini-2.5-flash",
    config: {
      systemInstruction: SYSTEM_INSTRUCTION_ANALYZE,
    },
  });

  // 3️⃣ Chuẩn bị prompt gửi tới AI với lịch sử hội thoại
  const conversationHistory = conversationService.getConversationHistory(UID);
  const prompt = `
  Dưới đây là hội thoại trước đó (nếu có):
  ${
    conversationHistory.length
      ? conversationService.getFormattedHistory(UID)
      : "(Chưa có hội thoại trước đó)"
  }

  Tin nhắn mới nhất của người dùng:
  "${messageFromUser}"

  ${
    phoneInfo
      ? `Số điện thoại phát hiện qua regex: ${phoneInfo}`
      : "Regex chưa phát hiện được số điện thoại."
  }

  Hãy phân tích và trả về JSON theo mẫu:
  {
    "nhuCau": "",
    "soDienThoai": "",
    "mucDoQuanTam": "",
    "daDuThongTin": false,
    "lyDo": ""
  }
  `;

  // 4️⃣ Gửi yêu cầu đến AI và xử lý kết quả
  const analyzeFromAI = await chat.sendMessage({ message: prompt });
  const textMessage =
    analyzeFromAI?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || null;

  if (!textMessage) {
    console.warn(`[AI] ⚠️ Phản hồi rỗng cho user ${UID}`);
    return { error: "Không đủ dữ liệu để phân tích" };
  }

  return textMessage;
};

const chatSessions = new Map();

const getOrCreateChatSession = (UID) => {
  if (chatSessions.has(UID)) {
    console.log(`[Chat Service] Đang lấy session cho user: ${UID}`);
    return chatSessions.get(UID);
  }
  console.log(`[Chat Service] Tạo session MỚI cho user: ${UID}`);
  const newChatSession = createChatSessionService();
  chatSessions.set(UID, newChatSession);
  return newChatSession;
};

export const handleChatService = async (userMessage, UID) => {
  const chatSession = getOrCreateChatSession(UID);

  try {
    // 2. Gửi tin nhắn vào session đó
    const responseFromAI = await chatSession.sendMessage({
      message: userMessage,
    });

    // 3. TỐI ƯU: Kiểm tra phản hồi một cách an toàn
    if (
      responseFromAI &&
      responseFromAI.candidates &&
      responseFromAI.candidates.length > 0 &&
      responseFromAI.candidates[0].content &&
      responseFromAI.candidates[0].content.parts &&
      responseFromAI.candidates[0].content.parts.length > 0
    ) {
      return responseFromAI.candidates[0].content.parts[0].text;
    } else {
      // Xử lý trường hợp Gemini không trả về gì
      console.warn(`[AI Warning] Phản hồi rỗng hoặc bị chặn cho user: ${UID}`);
      return "Cảm ơn anh/chị đã tin tưởng liên hệ đến Lâm Quang Đại, anh chị vui lòng để lại số điện thoại để em chuyển tiếp đến bộ phận kinh doanh hỗ trợ mình thêm ạ";
    }
  } catch (error) {
    // 4. TỐI ƯU: Bắt lỗi từ API Gemini
    console.error(`[AI Error] Lỗi khi gọi Gemini cho user ${UID}:`, error);
    return "Cảm ơn anh/chị đã tin tưởng liên hệ đến Lâm Quang Đại, anh chị vui lòng để lại số điện thoại để em chuyển tiếp đến bộ phận kinh doanh hỗ trợ mình thêm ạ";
  }
};

/**
 * Gọi API Zalo: Gửi tin nhắn tư vấn (CS) cho người dùng
 * API: /v3.0/oa/message/cs
 */
export const sentMessageForUserByIdService = async (UID, messageFromUser) => {
  // 1. Validate input
  if (!UID || !messageFromUser) {
    console.error("Không xác định người người nhận và nội dung tin nhắn");
    throw new Error("UID and Text message are required");
  }

  // 2. THÊM VÀO: Lưu tin nhắn người dùng vào lịch sử
  conversationService.addMessage(UID, "user", messageFromUser);

  if (UID !== "7365147034329534561") {
    logger.warn("Hệ thống đang ở chế độ kiểm thử");
    return;
  }

  // 3. Phân tích tin nhắn với lịch sử đầy đủ
  const analyzeUserMessageResult = await analyzeUserMessageService(
    messageFromUser,
    UID // Truyền UID để lấy lịch sử
  );

  const analyzeUserMessageJSON = analyzeUserMessageResult
    .replace("```json", "")
    .replace("```", "")
    .trim();

  try {
    const jsonData = JSON.parse(analyzeUserMessageJSON);
    if (jsonData.soDienThoai && jsonData.nhuCau) {
      const dataCustomer = `
✅Nhu cầu: ${jsonData.nhuCau}

✅Số điện thoại: ${jsonData.soDienThoai}

✅Mức độ quan tâm: ${jsonData.mucDoQuanTam}

📞Vui lòng phân bổ liên hệ lại khách hàng ngay!
      `;
      try {
        const response = await informationForwardingSynthesisService(
          dataCustomer
        );
        if (response.message === "Success") {
          logger.info("Đã báo thông tin khách hàng đến Lead");
        }
      } catch (error) {
        logger.error(error);
      }
    } else {
      logger.warn("Chưa đầy đủ thông tin");
    }
    logger.info(`Số điện thoại: ${jsonData.soDienThoai}`);
    logger.info(`Nhu cầu: ${jsonData.nhuCau}`);
    logger.info(`Đủ thông tin: ${jsonData.daDuThongTin}`);
  } catch (e) {
    logger.error("Lỗi parse JSON:", e);
    logger.info("Chuỗi sau khi replace:", analyzeUserMessageJSON); // In ra để kiểm tra
  }

  logger.info(`UID [${UID}]: ${messageFromUser}`);

  // 4. Xử lý chat với AI
  const messageFromAI = await handleChatService(messageFromUser, UID);

  // 5. THÊM VÀO: Lưu phản hồi AI vào lịch sử
  conversationService.addMessage(UID, "model", messageFromAI);

  logger.info(`AI to [${UID}]: ${messageFromAI}`);

  // 6. Gửi tin nhắn trả lời cho Zalo
  const url = `${ZALO_API_BASE_URL}/v3.0/oa/message/cs`;
  console.log(ACCESS_TOKEN);
  const payload = {
    recipient: { user_id: UID },
    message: { text: messageFromAI },
  };
  const headers = {
    access_token: ACCESS_TOKEN,
    "Content-Type": "application/json",
  };

  try {
    const response = await axios.post(url, payload, { headers });
    return response.data;
  } catch (error) {
    logger.error(
      "Zalo API Error (sentMessageForUserByIdService):",
      error.response?.data
    );
    throw new Error(
      error.response?.data?.message || "Failed to send Zalo message"
    );
  }
};

export const informationForwardingSynthesisService = async (
  dataCustomer,
  // UID = "1591235795556991810"
  UID = "7365147034329534561"
) => {
  const url = `${ZALO_API_BASE_URL}/v3.0/oa/message/cs`;
  const payload = {
    recipient: { user_id: UID },
    message: { text: dataCustomer },
  };
  const headers = {
    access_token: ACCESS_TOKEN,
    "Content-Type": "application/json",
  };

  try {
    const response = await axios.post(url, payload, { headers });
    logger.info(
      `Đã gửi tin nhắn tổng hợp thông tin khách hàng đến [UID: ${UID}]`
    );
    return response.data;
  } catch (error) {
    logger.error(
      "Zalo API Error (sentMessageForUserByIdService):",
      error.response?.data
    );
    throw new Error(
      error.response?.data?.message || "Failed to send Zalo message"
    );
  }
};

/**
 * Hàm mới: Xóa lịch sử hội thoại của user
 */
export const clearConversationHistoryService = (UID) => {
  conversationService.clearHistory(UID);
  // Đồng thời xóa cả chat session nếu có
  if (chatSessions.has(UID)) {
    chatSessions.delete(UID);
  }
};

/**
 * Hàm mới: Lấy số lượng hội thoại đang hoạt động
 */
export const getActiveConversationsCountService = () => {
  return conversationService.getActiveConversationsCount();
};

/**
 * Gọi API Zalo: Lấy danh sách các hội thoại gần đây
 * API: /v2.0/oa/listrecentchat
 */
export const getAllRecentlyMessageService = async (offset = 0, count = 5) => {
  const validCount = Math.min(Number(count) || 5, 10);
  const validOffset = Number(offset) || 0;

  const url = `${ZALO_API_BASE_URL}/v2.0/oa/listrecentchat`;

  try {
    const response = await axios.get(url, {
      headers: {
        access_token: ACCESS_TOKEN,
      },
      params: {
        data: JSON.stringify({
          offset: validOffset,
          count: validCount,
        }),
      },
    });

    return response.data;
  } catch (error) {
    console.error("Zalo API Error:", error.response?.data || error.message);
    throw error;
  }
};

/**
 * Gọi API Zalo: Lấy tin nhắn trong một hội thoại cụ thể
 * API: /v2.0/oa/conversation
 */
export const getAllMessageByUIDService = async (
  UID,
  offset = 0,
  count = 10
) => {
  if (!UID) {
    throw new Error("User ID is required");
  }

  // Đảm bảo count không vượt quá 10 (theo tài liệu)
  const validCount = Math.min(Number(count) || 10, 10);
  const validOffset = Number(offset) || 0;

  const url = `${ZALO_API_BASE_URL}/v2.0/oa/conversation`;

  const params = {
    data: JSON.stringify({
      user_id: UID,
      offset: validOffset,
      count: validCount,
    }),
  };

  const headers = {
    access_token: ACCESS_TOKEN,
  };

  console.log(headers.access_token);

  try {
    const response = await axios.get(url, { params, headers });
    console.log(response);

    return response.data;
  } catch (error) {
    console.error(
      "Zalo API Error (getAllMessageByUIDService):",
      error.response?.data
    );
    throw new Error(
      error.response?.data?.message || "Failed to fetch conversation"
    );
  }
};
