import { handleChatService } from "../services/geminiService";

export const createChatSessionController = async (req, res) => {
  try {
    const { userMessage } = req.body;
    const response = await handleChatService(userMessage);
    res.status(200).json(response);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
};
