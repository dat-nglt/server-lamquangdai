import {
  getAllMessageByUserIdService,
  getAllRecentlyMessageService,
  handleChatService,
  sentMessageForUserByIdService,
} from "../services/chatbox.service.js";

export const createChatSessionController = async (req, res) => {
  try {
    const { userMessage, userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const response = await handleChatService(userMessage, userId); // Truyền cả hai
    res.status(200).json(response);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Lấy danh sách hội thoại gần đây
 * Tham số lấy từ query string: /api/chats/recent?offset=0&count=5
 */
export const getAllRecentlyMessageController = async (req, res) => {
  try {
    // Lấy offset và count từ query string
    const { offset, count } = req.query;

    const recentlyMessageDataFromOA = await getAllRecentlyMessageService(
      offset,
      count
    );
    res.status(200).json(recentlyMessageDataFromOA);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Lấy lịch sử tin nhắn của một người dùng
 * Tham số lấy từ URL params và query string: /api/chats/:userId?offset=0&count=10
 */
export const getAllMessageByUserIdController = async (req, res) => {
  try {
    // Lấy userId từ URL param (ví dụ: /api/chats/123456)
    const { userId } = req.params;
    // Lấy offset và count từ query string
    const { offset, count } = req.query;

    const userMessageDataFromOA = await getAllMessageByUserIdService(
      userId,
      offset,
      count
    );
    res.status(200).json(userMessageDataFromOA);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Gửi tin nhắn cho một người dùng
 * Tham số lấy từ URL params và body: POST /api/chats/:userId
 * Body: { "text": "Nội dung tin nhắn" }
 */
export const sentMessageForUserByIdController = async (req, res) => {
  try {
    const { text, userId } = req.body;

    if (!text) {
      return res
        .status(400)
        .json({ message: "Text message is required in body" });
    }

    const sentMessage = await sentMessageForUserByIdService(userId, text);
    res.status(200).json(sentMessage);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
