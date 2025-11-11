import axios from "axios";
import { GoogleGenerativeAI } from "@google/genai";
import { SYSTEM_INSTRUCTION } from "../promts/contact.js";
import { extractPhoneNumber } from "../utils/extractPhoneNumber.js";

// Cài đặt 'dotenv' (npm install dotenv) và tạo file .env
import "dotenv/config";

// --- PHẦN SỬA LỖI BẢO MẬT ---
// TUYỆT ĐỐI KHÔNG VIẾT KEY TRỰC TIẾP VÀO ĐÂY
// Hãy lưu chúng trong file .env
const API_KEY = process.env.GEMINI_API_KEY;
const ACCESS_TOKEN = process.env.ZALO_ACCESS_TOKEN; // DÙNG TOKEN MỚI SAU KHI THU HỒI
const ZALO_API_BASE_URL = "https://openapi.zalo.me";

// Kiểm tra biến môi trường
if (!API_KEY) {
  throw new Error("GEMINI_API_KEY chưa được thiết lập trong file .env");
}
if (!ACCESS_TOKEN) {
  throw new Error("ZALO_ACCESS_TOKEN chưa được thiết lập trong file .env");
}

// --- PHẦN SỬA LỖI SDK & TÊN MODEL ---

// 1. Khởi tạo AI đúng cách
const genAI = new GoogleGenerativeAI(API_KEY);

// 2. Lấy model MỘT LẦN và cấu hình nó
// Tên model đúng là "gemini-1.5-flash-latest"
const chatModel = genAI.getGenerativeModel({
  model: "gemini-1.5-flash-latest",
  systemInstruction: SYSTEM_INSTRUCTION,
});

/**
 * Hàm này TẠO một phiên chat MỚI.
 * Đã sửa lại để dùng cú pháp SDK chính xác.
 */
export const createChatSessionService = () => {
  console.log("[Chat] Đang tạo session mới với cú pháp SDK đúng...");

  // 3. Cú pháp đúng là model.startChat()
  const chat = chatModel.startChat({
    history: [], // Bắt đầu với lịch sử trống
  });
  return chat;
};

// --- QUẢN LÝ SESSION ---

// CẢNH BÁO: Giải pháp 'in-memory' này chỉ dùng cho development.
// Khi restart server, tất cả session sẽ mất.
// Khi chạy > 1 server (scale), session sẽ không đồng bộ.
// Giải pháp Production: Dùng Redis, Firestore, hoặc CSDL.
const chatSessions = new Map();

const getOrCreateChatSession = (userId) => {
  // 1. Kiểm tra xem đã có session cho user này chưa
  if (chatSessions.has(userId)) {
    console.log(`[Chat] Đang lấy session cho user: ${userId}`);
    return chatSessions.get(userId);
  }

  // 2. Nếu chưa, tạo một session mới
  console.log(`[Chat] Tạo session MỚI cho user: ${userId}`);
  const newChatSession = createChatSessionService();
  chatSessions.set(userId, newChatSession); // Lưu lại để dùng lần sau
  return newChatSession;
};

// --- XỬ LÝ CHAT (Hàm này đã tốt) ---
export const handleChatService = async (userMessage, userId) => {
  // 1. Lấy đúng session của user
  const chatSession = getOrCreateChatSession(userId);

  try {
    // 2. Gửi tin nhắn vào session đó
    const result = await chatSession.sendMessage(userMessage);
    const response = result.response;

    // 3. Kiểm tra phản hồi an toàn (Đã tối ưu)
    if (
      response &&
      response.candidates &&
      response.candidates[0]?.content?.parts[0]?.text
    ) {
      return response.candidates[0].content.parts[0].text;
    } else {
      // Xử lý trường hợp bị chặn an toàn
      console.warn(`[AI] Phản hồi rỗng/bị chặn cho user: ${userId}`);
      return "Cảm ơn anh/chị đã tin tưởng liên hệ đến Lâm Quang Đại, anh chị vui lòng để lại số điện thoại để em chuyển tiếp đến bộ phận kinh doanh hỗ trợ mình thêm ạ";
    }
  } catch (error) {
    // 4. Bắt lỗi từ API Gemini (Đã tối ưu)
    console.error(`[AI Error] Lỗi khi gọi Gemini cho user ${userId}:`, error);
    return "Cảm ơn anh/chị đã tin tưởng liên hệ đến Lâm Quang Đại, anh chị vui lòng để lại số điện thoại để em chuyển tiếp đến bộ phận kinh doanh hỗ trợ mình thêm ạ";
  }
};

// --- DỊCH VỤ GỬI TIN ZALO ---
export const sentMessageForUserByIdService = async (
  userId,
  messageFromUser
) => {
  // 1. Validate input (Đã tối ưu)
  if (!userId || !messageFromUser) {
    console.error("Không xác định người người nhận và nội dung tin nhắn");
    throw new Error("UID and Text message are required");
  }

  console.log(`UID [${userId}]: ${messageFromUser}`);

  // 2. Xử lý làm giàu context (Giữ nguyên logic của bạn)
  const phoneNumbers = extractPhoneNumber(messageFromUser);
  let contextMessage = messageFromUser;

  if (phoneNumbers.length > 0) {
    console.log(`[Data] Phát hiện SĐT: ${phoneNumbers.join(", ")}`);
    contextMessage = `
      Người dùng nói: "${messageFromUser}".
      (Thông tin hệ thống: Đã phát hiện SĐT trong tin nhắn là: ${phoneNumbers[0]})
    `;
  }

  // --- PHẦN SỬA LỖI LOGIC ---
  // Gọi AI với `contextMessage` đã được làm giàu,
  // chứ KHÔNG phải `messageFromUser` gốc.
  const messageFromAI = await handleChatService(contextMessage, userId);

  // 3. Gửi tin nhắn trả lời cho Zalo
  console.log(`AI to [${userId}]: ${messageFromAI}`);

  const url = `${ZALO_API_BASE_URL}/v3.0/oa/message/cs`;
  const payload = {
    recipient: { user_id: userId },
    message: { text: messageFromAI },
  };
  const headers = {
    access_token: ACCESS_TOKEN, // Đọc từ process.env
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
