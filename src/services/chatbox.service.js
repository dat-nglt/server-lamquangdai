import axios from "axios";
import { handleChatService } from "./gemini.service.js";
import { GoogleGenAI } from "@google/genai";
import { SYSTEM_INSTRUCTION } from "../promts/contact.js";
import { extractPhoneNumber } from "../utils/extractPhoneNumber.js";

const ai = new GoogleGenAI({
  apiKey: "AIzaSyBAgHEF6i2FubocxwmVA692CzMZf3MIchM",
});
const ACCESS_TOKEN =
  "dS4U0JCNK0gSm1mEDXXQ2vpE5G8z02Llz84G2oaIFmM4gZHgJmvx8PI-It9M6MCjfxTmMLOdNGxudn9wAJav3TEK9LT-6cCrlebFH7CzHXQif4zAOmbqJw6DNXDTFdHvZkrW8tDYJ6c1hsO3KtnyTVx6Mpe3OcT1rVPUJmX3R3xsudrgAN0n1ltuUmyEItq6yFHe32jdNrRcqnWAFtOrLkZ54pi2NpWh__S1GL4k4qoxkGysJHCvRAMQ1JKGLpiwt8OSKmCBC0NzaG88F4C71CByLMyPJHauz_LIN0X1TIZ7bdnVAa8q9DdxU2aKUa9cwTT57WWFTalvrsS04LmiHUNpEJumL3LC_y8uCZ51FL2Vn3TUJXmYMf3CB0zyHWT7fVaSE7HX5tEazHu2IaLOMfxfIGfpKrb6H4QOu7yzCGzG2W";
const ZALO_API_BASE_URL = "https://openapi.zalo.me";
const chatSessions = new Map();

export const createChatSessionService = () => {
  const chat = ai.chats.create({
    model: "gemini-2.5-flash",
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
    },
  });
  return chat;
};

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
  const chatSession = getOrCreateChatSession(userId); // 2. Gửi tin nhắn vào session đó

  const response = await chatSession.sendMessage({ message: userMessage });
  return response.candidates[0].content.parts[0].text;
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

/**
 * Gọi API Zalo: Gửi tin nhắn tư vấn (CS) cho người dùng
 * API: /v3.0/oa/message/cs
 */
export const sentMessageForUserByIdService = async (
  userId,
  messageFromUser
) => {
  console.log(`Tin nhắn từ người dùng: ${messageFromUser}`);
  const phoneRegex = extractPhoneNumber(messageFromUser);
  console.log(phoneRegex);

  const messageFromAI = await handleChatService(messageFromUser, userId);
  if (!userId || !messageFromAI) {
    throw new Error("User ID and text message are required");
  }

  console.log(`Tin nhắn từ tư vấn viên AI: ${messageFromAI}`);

  const url = `${ZALO_API_BASE_URL}/v3.0/oa/message/cs`;

  const payload = {
    recipient: {
      user_id: userId,
    },
    message: {
      text: messageFromAI,
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
