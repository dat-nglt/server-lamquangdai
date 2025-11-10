import axios from "axios";
import { handleChatService } from "./gemini.service.js";

// Nên lưu trữ token trong biến môi trường (process.env.ZALO_ACCESS_TOKEN)
// Để đơn giản, chúng ta tạm hardcode (KHÔNG KHUYẾN KHÍCH TRONG PRODUCTION)
const ACCESS_TOKEN =
  "dS4U0JCNK0gSm1mEDXXQ2vpE5G8z02Llz84G2oaIFmM4gZHgJmvx8PI-It9M6MCjfxTmMLOdNGxudn9wAJav3TEK9LT-6cCrlebFH7CzHXQif4zAOmbqJw6DNXDTFdHvZkrW8tDYJ6c1hsO3KtnyTVx6Mpe3OcT1rVPUJmX3R3xsudrgAN0n1ltuUmyEItq6yFHe32jdNrRcqnWAFtOrLkZ54pi2NpWh__S1GL4k4qoxkGysJHCvRAMQ1JKGLpiwt8OSKmCBC0NzaG88F4C71CByLMyPJHauz_LIN0X1TIZ7bdnVAa8q9DdxU2aKUa9cwTT57WWFTalvrsS04LmiHUNpEJumL3LC_y8uCZ51FL2Vn3TUJXmYMf3CB0zyHWT7fVaSE7HX5tEazHu2IaLOMfxfIGfpKrb6H4QOu7yzCGzG2W";
const ZALO_API_BASE_URL = "https://openapi.zalo.me";

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

/**
 * Gọi API Zalo: Gửi tin nhắn tư vấn (CS) cho người dùng
 * API: /v3.0/oa/message/cs
 */
export const sentMessageForUserByIdService = async (
  userId,
  messageFromUser
) => {
  // const messageFromUser = getAllMessageByUserIdService();
  const messageFromAI = handleChatService(messageFromUser, userId);
  if (!userId || !messageFromAI) {
    throw new Error("User ID and text message are required");
  }

  const url = `${ZALO_API_BASE_URL}/v3.0/oa/message/cs`;

  const payload = {
    recipient: {
      user_id: userId,
    },
    message: {
      text:
        messageFromAI == {}
          ? messageFromAI
          : "AI trả về kết quả rỗng, kiểm tra lại",
    },
  };

  const headers = {
    access_token: ACCESS_TOKEN,
    "Content-Type": "application/json",
  };

  try {
    // Lưu ý: Đây là request POST, payload được gửi làm đối số thứ hai
    const response = await axios.post(url, payload, { headers });
    return response.data;
  } catch (error) {
    console.error(
      "Zalo API Error (sentMessageForUserByIdService):",
      error.response?.data
    );
    throw new Error(error.response?.data?.message || "Failed to send message");
  }
};
