import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createChatSession } from '../services/gemini.service';

const MessageSender = {
  USER: 'user',
  BOT: 'bot'
};

const Chatbot = () => {
  const [messages, setMessages] = useState([
    {
      text: 'Dạ em là Tấn Đạt, em có thể giúp gì cho anh/chị ạ?',
      sender: MessageSender.BOT,
    },
  ]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatSession, setChatSession] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    try {
      const session = createChatSession();
      setChatSession(session);
    } catch (error) {
      console.error("Failed to initialize chat session:", error);
      setMessages(prev => [...prev, {
        text: "Xin lỗi, đã có lỗi xảy ra khi kết nối với AI. Vui lòng thử lại sau.",
        sender: MessageSender.BOT
      }]);
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSendMessage = useCallback(async (e) => {
    e.preventDefault();
    if (userInput.trim() === '' || isLoading || !chatSession) return;

    const userMessage = { text: userInput, sender: MessageSender.USER };
    setMessages(prev => [...prev, userMessage]);
    setUserInput('');
    setIsLoading(true);

    try {
      const response = await chatSession.sendMessage({ message: userInput });
      const botMessage = { text: response.text, sender: MessageSender.BOT };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage = {
        text: 'Dạ, em xin lỗi. Hiện tại đã có lỗi xảy ra. Anh/chị vui lòng liên hệ hotline 0916.383.578 để được hỗ trợ trực tiếp ạ.',
        sender: MessageSender.BOT
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [userInput, isLoading, chatSession]);

  const SendIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="w-6 h-6"
    >
      <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
    </svg>
  );

  return (
    <div className="flex flex-col h-full bg-gray-800 rounded-lg shadow-2xl">
      <header className="bg-blue-600 text-white p-4 rounded-t-lg shadow-md">
        <h1 className="text-xl font-bold text-center">Tấn Đạt - Trợ lý ảo</h1>
      </header>
      <main className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-4">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex items-end gap-2 ${
                msg.sender === MessageSender.USER ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-xs md:max-w-md lg:max-w-lg p-3 rounded-2xl whitespace-pre-wrap ${
                  msg.sender === MessageSender.USER
                    ? 'bg-blue-500 text-white rounded-br-none'
                    : 'bg-gray-700 text-gray-200 rounded-bl-none'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-700 text-gray-200 p-3 rounded-2xl rounded-bl-none">
                <div className="flex items-center space-x-2">
                  <span className="text-sm">Tấn Đạt đang soạn tin...</span>
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse [animation-delay:-0.3s]"></div>
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse [animation-delay:-0.15s]"></div>
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </main>
      <footer className="p-4 border-t border-gray-700">
        <form onSubmit={handleSendMessage} className="flex items-center gap-3">
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Anh/chị cần tư vấn gì ạ..."
            className="flex-1 bg-gray-700 text-white px-4 py-2 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            disabled={isLoading}
          />
          <button
            type="submit"
            className="bg-blue-600 text-white p-3 rounded-full hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors duration-200"
            disabled={isLoading || userInput.trim() === ''}
          >
            <SendIcon />
          </button>
        </form>
      </footer>
    </div>
  );
};

export default Chatbot;