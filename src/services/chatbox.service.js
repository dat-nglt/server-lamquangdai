import axios from "axios";

// Nên lưu trữ token trong biến môi trường (process.env.ZALO_ACCESS_TOKEN)
// Để đơn giản, chúng ta tạm hardcode (KHÔNG KHUYẾN KHÍCH TRONG PRODUCTION)
const ACCESS_TOKEN =
  "T-Rt0ntYgsjsv_KC6EsXQdRf_00JzTDgA9ZyGXEPetrtmlvoHPduIqdVeI1UhguaPVUQJb_rptrmjUDR6jZCGYE5wLCD_UvqOQhMOstyusLa_j5tLRNgNKItm4KlyULSGep1Hr7Vt7yuW-903VRYVGkkvaqkpyH4GOxlSMxEj1jcfk0HM_hg9sQmp4vRiizYCVdF30IizY9khgi-1U-F3m6Rj3SpdBKG1ShjFYlAxL8laDeu6PNGBIxI-XujYzOmC8dk6rJjoJmnc-WqMztN6cw8-n9Rt_9wRe3P4GNzqI0JlUvF8iUmH16Ov6nytxj2Q9okUcI3cL1WyxmuMAAr0d3dx6vDeTHA9yEFUokVZcTF_e1LPgQhErmoRLuV-gjh"; // Thay bằng token thật của bạn
const ZALO_API_BASE_URL = "https://openapi.zalo.me";

/**
 * Gọi API Zalo: Lấy danh sách các hội thoại gần đây
 * API: /v2.0/oa/listrecentchat
 */
export const getAllRecentlyMessageService = async (offset = 0, count = 5) => {
  // Đảm bảo count không vượt quá 10 (theo tài liệu)
  const validCount = Math.min(Number(count) || 5, 10);
  const validOffset = Number(offset) || 0;

  const url = `${ZALO_API_BASE_URL}/v2.0/oa/listrecentchat`;

  const params = {
    data: JSON.stringify({
      offset: validOffset,
      count: validCount,
    }),
  };

  const headers = {
    access_token: ACCESS_TOKEN,
  };

  try {
    const response = await axios.get(url, { params, headers });
    // Trả về dữ liệu từ Zalo
    return response.data;
  } catch (error) {
    // Ghi lại lỗi chi tiết từ Zalo
    console.error(
      "Zalo API Error (getAllRecentlyMessageService):",
      error.response?.data
    );
    // Ném lỗi để controller bắt
    throw new Error(
      error.response?.data?.message || "Failed to fetch recent chats"
    );
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
export const sentMessageForUserByIdService = async (userId, textMessage) => {
  if (!userId || !textMessage) {
    throw new Error("User ID and text message are required");
  }

  const url = `${ZALO_API_BASE_URL}/v3.0/oa/message/cs`;

  const payload = {
    recipient: {
      user_id: userId,
    },
    message: {
      text: textMessage,
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
