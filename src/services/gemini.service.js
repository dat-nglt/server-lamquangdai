// ... (Tất cả import và thiết lập API_KEY, ai) ...

export const createChatSessionService = () => {
  const chat = ai.chats.create({
    model: "gemini-2.5-flash",
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
    },
  });
  return chat;
};

// --- PHẦN MỚI: QUẢN LÝ SESSION ---

// Sử dụng Map để lưu trữ session (userId => chatSession)
// Đây là bộ nhớ tạm (in-memory), server restart sẽ mất.
// Để dùng thật, hãy thay bằng Redis hoặc Database.
const chatSessions = new Map();

/**
 * Lấy session hiện có hoặc tạo mới nếu chưa có
 */
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

// --- PHẦN CẬP NHẬT: XỬ LÝ CHAT ---

export const handleChatService = async (userMessage, userId) => {
  // 1. Lấy đúng session của user
  const chatSession = getOrCreateChatSession(userId); // 2. Gửi tin nhắn vào session đó

  const response = await chatSession.sendMessage({ message: userMessage });
  return response;
};
