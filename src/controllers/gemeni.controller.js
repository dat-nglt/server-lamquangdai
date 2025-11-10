import { handleChatService } from "../services/gemini.service.js";

export const createChatSessionController = async (req, res) => {
  try {
    // Lấy cả userMessage và userId từ body
    const { userMessage, userId } = req.body;

    // Đây chính là lỗi bạn gặp trong Postman!
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
