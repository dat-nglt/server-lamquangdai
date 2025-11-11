/**
 * Trạng thái của service, được "ẩn" (private) bên trong module này.
 * Biến này sẽ nằm trong BỘ NHỚ RAM của ứng dụng.
 */
const conversations = new Map();
const maxHistoryLength = 20;

// --- Định nghĩa các hàm ---

/**
 * Lấy lịch sử trò chuyện cho một người dùng.
 */
const getConversationHistory = (userId) => {
  return conversations.get(userId) || [];
};

/**
 * Thêm một tin nhắn vào lịch sử của người dùng.
 */
const addMessage = (userId, role, message) => {
  if (!conversations.has(userId)) {
    conversations.set(userId, []);
  }

  const history = conversations.get(userId);
  const messageEntry = {
    role,
    message,
    timestamp: new Date().toISOString(),
  };

  history.push(messageEntry);

  // Giới hạn độ dài lịch sử
  if (history.length > maxHistoryLength) {
    history.splice(0, history.length - maxHistoryLength);
  }

  return history;
};

/**
 * Lấy lịch sử đã định dạng (string).
 */
const getFormattedHistory = (userId) => {
  const history = getConversationHistory(userId);
  return history.map((entry) => `${entry.role}: ${entry.message}`).join("\n");
};

/**
 * Xóa lịch sử của một người dùng.
 * (Hữu ích nếu bạn muốn "xóa sau khi lấy thông tin")
 */
const clearHistory = (userId) => {
  conversations.delete(userId);
};

/**
 * Đếm số lượng cuộc trò chuyện đang hoạt động (có trong bộ nhớ).
 */
const getActiveConversationsCount = () => {
  return conversations.size;
};

// --- Tạo và Export Service ---

/**
 * Tập hợp tất cả các hàm thành một đối tượng "service" duy nhất.
 */
const conversationService = {
  getConversationHistory,
  addMessage,
  getFormattedHistory,
  clearHistory,
  getActiveConversationsCount,
};

/**
 * Export đối tượng service để các file khác có thể import và sử dụng.
 */
export { conversationService };
export default conversationService;
