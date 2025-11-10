import { GoogleGenAI } from "@google/genai";
import { SYSTEM_INSTRUCTION } from "../promts/contact";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

export const createChatSessionService = () => {
  const chat = ai.chats.create({
    model: "gemini-2.5-flash",
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
    },
  });
  return chat;
};

export const handleChatService = async (userMessage) => {
  const chatSession = createChatSessionService();
  const response = await chatSession.sendMessage({ message: userMessage });
  return response;
};
