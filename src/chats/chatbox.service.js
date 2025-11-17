import { GoogleGenAI } from "@google/genai";
import { SYSTEM_INSTRUCTION_RESPONSE } from "../promts/promt.v4.response.js";
import logger from "../utils/logger.js";
import { notifyAdminQuotaExceeded } from "../utils/adminNotification.js";

const API_KEY = process.env.GEMENI_API_KEY;
if (!API_KEY) {
    throw new Error("GEMINI_API_KEY chưa được thiết lập trong file .env");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

// (Giữ nguyên createChatSessionService)
export const createChatSessionService = () => {
    const chat = ai.chats.create({
        model: "gemini-2.5-flash-lite",
        config: {
            systemInstruction: SYSTEM_INSTRUCTION_RESPONSE,
        },
    });
    return chat;
};

// (Giữ nguyên getOrCreateChatSession)
const chatSessions = new Map();
const getOrCreateChatSession = (UID) => {
    if (chatSessions.has(UID)) {
        // Nếu người dùng đã tồn tại session chat => tiến hành truy xuất tiếp và xử lý với UID
        logger.info(`[Chat Service] Đang lấy SESSION cho [${UID}]`);
        return chatSessions.get(UID);
    }

    // Nếu người dùng chưa tồn tại session chat => thực hiện tạo mới session chat với UID
    logger.info(`[Chat Service] Tạo SESSION MỚI cho [${UID}]`);
    const newChatSession = createChatSessionService();
    chatSessions.set(UID, newChatSession);
    return newChatSession;
};

// *** ĐÂY LÀ PHẦN QUAN TRỌNG ĐƯỢC CẬP NHẬT ***
export const handleChatService = async (userMessage, UID, accessToken = null) => {
    const chatSession = getOrCreateChatSession(UID);

    try {
        const responseFromAI = await chatSession.sendMessage({
            message: userMessage,
        });

        if (responseFromAI && responseFromAI.candidates?.[0]?.content?.parts?.[0]?.text) {
            // Trả về text nếu thành công
            return responseFromAI.candidates[0].content.parts[0].text;
        } else {
            // Trường hợp AI trả về rỗng hoặc bị chặn (lỗi "cứng")
            logger.warn(`[AI Warning] Phản hồi rỗng/bị chặn cho [${UID}]`);
            return "Cảm ơn anh/chị đã tin tưởng liên hệ đến Lâm Quang Đại, anh chị vui lòng để lại số điện thoại để em chuyển tiếp đến bộ phận kinh doanh hỗ trợ mình thêm ạ";
        }
    } catch (error) {
        // LOG TOÀN BỘ ERROR OBJECT ĐỂ DEBUG
        logger.error(`[AI Error] Lỗi khi gọi Gemini cho user ${UID}:`, {
            message: error.message,
            status: error.status,
            code: error.code,
            response: error.response?.data || error.response,
            stack: error.stack,
            fullError: JSON.stringify(error, Object.getOwnPropertyNames(error)),
        });

        const errorMessage = error.message || "";
        const errorStatus = error.status || error.response?.status || error.code;
        const errorObject = error.error || error;

        // KIỂM TRA LỖI 429 (QUOTA EXCEEDED) - GỬI THÔNG BÁO CHO ADMIN
        if (
            errorStatus === 429 ||
            errorStatus === "429" ||
            errorObject?.code === 429 ||
            (errorMessage && errorMessage.includes("RESOURCE_EXHAUSTED")) ||
            (errorMessage && errorMessage.includes("quota exceeded")) ||
            (error && error.status === "RESOURCE_EXHAUSTED")
        ) {
            logger.error(
                `[AI Error] Lỗi ${errorStatus || 429} (Hết hạn ngạch - Quota Exceeded). GỬI THÔNG BÁO CHO ADMIN.`
            );

            // Gửi thông báo cho ADMIN nếu có accessToken
            if (accessToken) {
                try {
                    await notifyAdminQuotaExceeded(UID, error, accessToken);
                } catch (notifyError) {
                    logger.error(`[AI Error] Không thể gửi thông báo cho ADMIN:`, notifyError.message);
                }
            }

            return "Dạ, hệ thống đang bảo trì tạm thời. Anh/chị vui lòng để lại số điện thoại để em chuyển tiếp đến bộ phận kinh doanh hỗ trợ trực tiếp mình ạ.";
        }

        // KIỂM TRA LỖI 503 (HOẶC LỖI MẠNG) - RETRY
        if (
            errorStatus === 503 ||
            errorStatus === "503" ||
            errorMessage.includes("503") ||
            errorMessage.includes("overloaded") ||
            errorMessage.includes("ECONNRESET") ||
            errorMessage.includes("ETIMEDOUT") ||
            errorMessage.includes("ENOTFOUND") ||
            error.code === "ECONNRESET" ||
            error.code === "ETIMEDOUT"
        ) {
            logger.error(`[AI Error] Lỗi ${errorStatus || "mạng"} (Quá tải yêu cầu || Mất kết nối). YÊU CẦU THỬ LẠI.`);
            throw new Error(
                `Lỗi ${errorStatus || "mạng"} (Quá tải yêu cầu || Mất kết nối). Sẽ thử lại tiến trình công việc ...`
            );
        }

        // Các lỗi khác (400, 401...) là lỗi "cứng", không retry, trả về mặc định
        logger.warn(`[AI Error] Lỗi không retry (${errorStatus}), trả về message mặc định`);
        return "Dạ, anh/chị vui lòng đợi chút để em kết nối lại với bộ phận kinh doanh hỗ trợ mình ạ.";
    }
};
