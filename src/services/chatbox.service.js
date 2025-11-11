import axios from "axios";
import { GoogleGenAI } from "@google/genai";
import { SYSTEM_INSTRUCTION } from "../promts/contact.js";
import { extractPhoneNumber } from "../utils/extractPhoneNumber.js";

const API_KEY =
  process.env.GEMINI_API_KEY || "AIzaSyBAgHEF6i2FubocxwmVA692CzMZf3MIchM";

const ACCESS_TOKEN =
  process.env.ZALO_ACCESS_TOKEN ||
  "gBHbKca06XofjMTTR0yG7QcxRb5d5r1dfwSfRHDHLrw0brnCGaP1MeozELeyIm4IhQq9NYnjAdo9s2ynEHzLVVdgJcn534nQXi0nH1Cj9rYZnpWI8YCf9_Za9Zn48IuAsvjLNqP-In7oXZSGTsWE1k6o3XfyN28JpOqu878x8X_7rpmELZzA0lBQIYbA56yVsEvl5sGVJ3N1yZGYK5r8RDI-FrPWP44Syfn50tHcSZRkid43INr7IusLI6j3I3SZ_VWqB6SlD1YWc3GsPaaOOy6Z67ztM059z-8uNc4_9tFCrZbQTZSuR-3FB5DxUmXDo98PM6Ke5M7t_WnBGXiTMVBR2rDk3YDlm-W19sKzTZRYY5SuMtfCACNABn852GWyjkmk4tDT1WBhfX0OVLGmKjwSDtDFTFU2JdXh61eS"; // DÙNG TOKEN MỚI SAU KHI THU HỒI

const ZALO_API_BASE_URL = "https://openapi.zalo.me";

// Kiểm tra biến môi trườngD
if (!API_KEY) {
  throw new Error("GEMINI_API_KEY chưa được thiết lập trong file .env");
}
if (!ACCESS_TOKEN) {
  throw new Error("ZALO_ACCESS_TOKEN chưa được thiết lập trong file .env");
}

const ai = new GoogleGenAI({
  apiKey: API_KEY,
});

export const createChatSessionService = () => {
  const chat = ai.chats.create({
    model: "gemini-2.5-flash",
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
    },
  });
  return chat;
};


const chatSessions = new Map();
const getOrCreateChatSession = (userId) => {
  // 1. Kiểm tra xem đã có session cho user này chưa
  if (chatSessions.has(userId)) {
    console.log(`[Chat] Đang lấy session cho user: ${userId}`);
    return chatSessions.get(userId);
  } // 2. Nếu chưa, tạo một session mới

  console.log(`[Chat] Tạo session MỚI cho user: ${userId}`);
  const newChatSession = createChatSessionService();
  chatSessions.set(userId, newChatSession); // Lưu lại để dùng lần sau
  return newChatSession;
};

export const handleChatService = async (userMessage, userId) => {
  // 1. Lấy đúng session của user
  const chatSession = getOrCreateChatSession(userId);

  try {
    // 2. Gửi tin nhắn vào session đó
    const result = await chatSession.sendMessage(userMessage); // Đơn giản hóa, chỉ gửi text
    const response = result.response; // Giả sử SDK trả về cấu trúc này

    // 3. TỐI ƯU: Kiểm tra phản hồi một cách an toàn
    // Thay vì truy cập trực tiếp [0], hãy kiểm tra
    if (
      response &&
      response.candidates &&
      response.candidates.length > 0 &&
      response.candidates[0].content &&
      response.candidates[0].content.parts &&
      response.candidates[0].content.parts.length > 0
    ) {
      return response.candidates[0].content.parts[0].text;
    } else {
      // Xử lý trường hợp Gemini không trả về gì (ví dụ: bị chặn do an toàn)
      console.warn(`[AI] Phản hồi rỗng hoặc bị chặn cho user: ${userId}`);
      return "Cảm ơn anh/chị đã tin tưởng liên hệ đến Lâm Quang Đại, anh chị vui lòng để lại số điện thoại để em chuyển tiếp đến bộ phận kinh doanh hỗ trợ mình thêm ạ";
    }
  } catch (error) {
    // 4. TỐI ƯU: Bắt lỗi từ API Gemini
    console.error(`[AI Error] Lỗi khi gọi Gemini cho user ${userId}:`, error);
    // Trả về một tin nhắn lỗi thân thiện với người dùng
    return "Cảm ơn anh/chị đã tin tưởng liên hệ đến Lâm Quang Đại, anh chị vui lòng để lại số điện thoại để em chuyển tiếp đến bộ phận kinh doanh hỗ trợ mình thêm ạ";
  }
};

/**
 * Gọi API Zalo: Gửi tin nhắn tư vấn (CS) cho người dùng
 * API: /v3.0/oa/message/cs
 */
export const sentMessageForUserByIdService = async (
  userId,
  messageFromUser
) => {
  // 1. TỐI ƯU: Validate input ngay lập tức
  if (!userId || !messageFromUser) {
    console.error("Không xác định người người nhận và nội dung tin nhắn");
    throw new Error("UID and Text message are required");
  }

  console.log(`UID [${userId}]: ${messageFromUser}`);

  const phoneNumbers = extractPhoneNumber(messageFromUser);
  let contextMessage = messageFromUser;
  if (phoneNumbers.length > 0) {
    console.log(`[Data] Phát hiện SĐT: ${phoneNumbers.join(", ")}`);
    // Ví dụ: Làm giàu context cho AI
    contextMessage = `
      Người dùng nói: "${messageFromUser}".
      (Thông tin hệ thống: Đã phát hiện SĐT trong tin nhắn là: ${phoneNumbers[0]})
    `;
  }
  // và sau đó gọi: await handleChatService(contextMessage, userId);

  // Tạm thời, tôi sẽ giữ logic gốc của bạn là chỉ gửi tin nhắn thô:
  const messageFromAI = await handleChatService(messageFromUser, userId);
  // 3. Gửi tin nhắn trả lời cho Zalo
  console.log(`AI to [${userId}]: ${messageFromAI}`);

  const url = `${ZALO_API_BASE_URL}/v3.0/oa/message/cs`;
  const payload = {
    recipient: { user_id: userId },
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
    console.error(
      "Zalo API Error (sentMessageForUserByIdService):",
      error.response?.data
    );
    // Ném lỗi này để hàm gọi bên ngoài có thể xử lý
    throw new Error(
      error.response?.data?.message || "Failed to send Zalo message"
    );
  }
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
export const getAllMessageByUserIdService = async (
  userId,
  offset = 0,
  count = 10
) => {
  if (!userId) {
    throw new Error("User ID is required");
  }

  // Đảm bảo count không vượt quá 10 (theo tài liệu)
  const validCount = Math.min(Number(count) || 10, 10);
  const validOffset = Number(offset) || 0;

  const url = `${ZALO_API_BASE_URL}/v2.0/oa/conversation`;

  const params = {
    data: JSON.stringify({
      user_id: userId,
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
      "Zalo API Error (getAllMessageByUserIdService):",
      error.response?.data
    );
    throw new Error(
      error.response?.data?.message || "Failed to fetch conversation"
    );
  }
};
