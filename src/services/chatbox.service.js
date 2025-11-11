import axios from "axios";
import { GoogleGenAI } from "@google/genai";
import { SYSTEM_INSTRUCTION } from "../promts/contact.js";
import { extractPhoneNumber } from "../utils/extractPhoneNumber.js";
import conversationService from "../utils/conversation.js";

const API_KEY =
  process.env.GEMINI_API_KEY || "AIzaSyC8SrYclm2PScOKFZNh6cv0rdfx5rVFZKg";
const ACCESS_TOKEN =
  process.env.ZALO_ACCESS_TOKEN ||
  "gBHbKca06XofjMTTR0yG7QcxRb5d5r1dfwSfRHDHLrw0brnCGaP1MeozELeyIm4IhQq9NYnjAdo9s2ynEHzLVVdgJcn534nQXi0nH1Cj9rYZnpWI8YCf9_Za9Zn48IuAsvjLNqP-In7oXZSGTsWE1k6o3XfyN28JpOqu878x8X_7rpmELZzA0lBQIYbA56yVsEvl5sGVJ3N1yZGYK5r8RDI-FrPWP44Syfn50tHcSZRkid43INr7IusLI6j3I3SZ_VWqB6SlD1YWc3GsPaaOOy6Z67ztM059z-8uNc4_9tFCrZbQTZSuR-3FB5DxUmXDo98PM6Ke5M7t_WnBGXiTMVBR2rDk3YDlm-W19sKzTZRYY5SuMtfCACNABn852GWyjkmk4tDT1WBhfX0OVLGmKjwSDtDFTFU2JdXh61eS";

const ZALO_API_BASE_URL = "https://openapi.zalo.me";

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

export const analyzeUserMessageService = async (
  messageFromUser,
  userId // Thêm userId để lấy lịch sử
) => {
  // 1️⃣ Lấy lịch sử hội thoại từ conversationService
  const conversationHistory =
    conversationService.getConversationHistory(userId);

  console.log(`Lịch sử trò chuyện: ${conversationHistory}`);

  // 2️⃣ Tự động trích xuất số điện thoại bằng regex trước
  const phoneNumbers = extractPhoneNumber(messageFromUser);
  let phoneInfo = null;

  if (phoneNumbers && phoneNumbers.length > 0) {
    phoneInfo = phoneNumbers.join(", ");
    console.log(`[Data] 📞 Phát hiện SĐT: ${phoneInfo}`);
  }

  // 3️⃣ Tạo session AI với hướng dẫn thông minh
  const chat = ai.chats.create({
    model: "gemini-2.5-flash",
    config: {
      systemInstruction: `
    Bạn là trợ lý AI chuyên phân tích hội thoại kinh doanh.
    Nhiệm vụ của bạn:
    - Hiểu ngữ cảnh hội thoại giữa người dùng và hệ thống.
    - Bóc tách nhu cầu và thông tin khách hàng.
    - Nhận diện và chuẩn hóa số điện thoại Việt Nam (10 số bắt đầu 0 hoặc +84xxxxxxxxx),
      kể cả khi viết tách, viết bằng chữ, hoặc thiếu số 0 đầu.
    - Đánh giá mức độ quan tâm và quyết định xem hội thoại đã đủ dữ kiện để tổng hợp hay chưa,
      không mặc định "daDuThongTin": true.

    Yêu cầu:
    1️⃣ "nhuCau": Tóm tắt ngắn gọn nhu cầu chính, nếu không có thì mặc định sẽ là "Khách hàng cần tư vấn chi tiết".
    2️⃣ "soDienThoai": Nếu regex không phát hiện, hãy tự tìm trong văn bản và chuẩn hóa về dạng 0xxxxxxxxx hoặc +84xxxxxxxxx.
       Nếu không tìm được số hợp lệ, trả về null.
    3️⃣ "mucDoQuanTam":
       - "Cao": có hành động cụ thể (muốn mua, để lại SĐT, yêu cầu tư vấn,...)
       - "Trung bình": chỉ đang hỏi, chưa cam kết
       - "Thấp": mơ hồ, không liên quan
    4️⃣ "daDuThongTin": true/false — xác định dựa trên hội thoại xem đã đủ thông tin để tổng hợp chưa.
       - true: đã có đủ SĐT và nhu cầu chính để chuyển cho bộ phận kinh doanh
       - false: chưa đủ thông tin, cần hỏi thêm
    5️⃣ "lyDo": Giải thích ngắn gọn vì sao đưa ra kết luận "daDuThongTin" và "mucDoQuanTam".
    6️⃣ Nếu người dùng cung cấp SĐT gián tiếp (viết tách hoặc bằng chữ), hãy tự chuyển về số hợp lệ.

    Luôn trả về JSON hợp lệ, KHÔNG viết mô tả ngoài JSON.
  `,
    },
  });

  // 3️⃣ Chuẩn bị prompt gửi tới AI với lịch sử hội thoại
  const prompt = `
  Dưới đây là hội thoại trước đó (nếu có):
  ${
    conversationHistory.length
      ? conversationService.getFormattedHistory(userId)
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
  const response = await chat.sendMessage({ message: prompt });
  const textMessage =
    response?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || null;

  if (!textMessage) {
    console.warn(`[AI] ⚠️ Phản hồi rỗng cho user ${userId}`);
    return { error: "Không đủ dữ liệu để phân tích" };
  }

  return textMessage;
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
    const response = await chatSession.sendMessage({ message: userMessage });

    // 3. TỐI ƯU: Kiểm tra phản hồi một cách an toàn
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
      // Xử lý trường hợp Gemini không trả về gì
      console.warn(`[AI] Phản hồi rỗng hoặc bị chặn cho user: ${userId}`);
      return "Cảm ơn anh/chị đã tin tưởng liên hệ đến Lâm Quang Đại, anh chị vui lòng để lại số điện thoại để em chuyển tiếp đến bộ phận kinh doanh hỗ trợ mình thêm ạ";
    }
  } catch (error) {
    // 4. TỐI ƯU: Bắt lỗi từ API Gemini
    console.error(`[AI Error] Lỗi khi gọi Gemini cho user ${userId}:`, error);
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
  // 1. Validate input
  if (!userId || !messageFromUser) {
    console.error("Không xác định người người nhận và nội dung tin nhắn");
    throw new Error("UID and Text message are required");
  }

  // 2. THÊM VÀO: Lưu tin nhắn người dùng vào lịch sử
  conversationService.addMessage(userId, "user", messageFromUser);

  if (userId !== "7365147034329534561") {
    console.log("Hệ thống đang ở chế độ kiểm thử");
    return;
  }

  // 3. Phân tích tin nhắn với lịch sử đầy đủ
  const analyzeUserMessageResult = await analyzeUserMessageService(
    messageFromUser,
    userId // Truyền userId để lấy lịch sử
  );

  const jsonString = analyzeUserMessageResult
    .replace("```json", "")
    .replace("```", "")
    .trim();

  try {
    const jsonData = JSON.parse(jsonString);
    if (jsonData.soDienThoai && jsonData.nhuCau) {
      const dataCustomer = `
        🔔Thông báo khách hàng mới🔔

        Một khách hàng mới vừa đăng ký với thông tin:
        - Nhu cầu: *${jsonData.nhuCau}*
        - Số điện thoại: **${jsonData.soDienThoai}**
        - Mức độ quan tâm: **${jsonData.mucDoQuanTam}**

        Vui lòng liên hệ lại khách hàng ngay!
      `;

      try {
        const response = await informationForwardingSynthesisService(
          dataCustomer
        );
        if (response.message === "Success") {
          console.log("Đã báo thông tin khách hàng đến Lead");
        }
      } catch (error) {
        console.log(error);
      }
    } else {
      console.log("Chưa đầy đủ thông tin");
    }
    console.log(`Số điện thoại: ${jsonData.soDienThoai}`);
    console.log(`Nhu cầu: ${jsonData.nhuCau}`);
    console.log(`Đủ thông tin: ${jsonData.daDuThongTin}`);
  } catch (e) {
    console.error("Lỗi parse JSON:", e);
    console.log("Chuỗi sau khi replace:", jsonString); // In ra để kiểm tra
  }

  console.log(`UID [${userId}]: ${messageFromUser}`);

  // 4. Xử lý chat với AI
  const messageFromAI = await handleChatService(messageFromUser, userId);

  // 5. THÊM VÀO: Lưu phản hồi AI vào lịch sử
  conversationService.addMessage(userId, "model", messageFromAI);

  console.log(`AI to [${userId}]: ${messageFromAI}`);

  // 6. Gửi tin nhắn trả lời cho Zalo
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
    throw new Error(
      error.response?.data?.message || "Failed to send Zalo message"
    );
  }
};

export const informationForwardingSynthesisService = async (
  userId = "7365147034329534561",
  dataCustomer
) => {
  const url = `${ZALO_API_BASE_URL}/v3.0/oa/message/cs`;
  const payload = {
    recipient: { user_id: userId },
    message: { text: dataCustomer },
  };
  const headers = {
    access_token: ACCESS_TOKEN,
    "Content-Type": "application/json",
  };

  try {
    const response = await axios.post(url, payload, { headers });
    console.log("Đã gửi tin nhắn");
    console.log(response);
    return response.data;
  } catch (error) {
    console.error(
      "Zalo API Error (sentMessageForUserByIdService):",
      error.response?.data
    );
    throw new Error(
      error.response?.data?.message || "Failed to send Zalo message"
    );
  }
};

/**
 * Hàm mới: Lấy lịch sử hội thoại của user
 */
export const getConversationHistoryService = (userId) => {
  return conversationService.getConversationHistory(userId);
};

/**
 * Hàm mới: Xóa lịch sử hội thoại của user
 */
export const clearConversationHistoryService = (userId) => {
  conversationService.clearHistory(userId);
  // Đồng thời xóa cả chat session nếu có
  if (chatSessions.has(userId)) {
    chatSessions.delete(userId);
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
