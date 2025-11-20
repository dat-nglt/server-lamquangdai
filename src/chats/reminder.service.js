import logger from "../utils/logger.js";
import { getValidAccessToken, sendZaloMessage } from "./zalo.service.js";

const REMINDER_MESSAGE = "Dạ không biết em có thể giúp gì thêm cho mình không ạ";

/**
 * Thiết lập reminder job để kiểm tra và gửi tin nhắn nhắc nhở sau một khoảng thời gian
 * @param {object} redisClient - Redis client
 * @param {string} UID - User ID
 * @param {string} messageFromAI - Tin nhắn cuối cùng từ AI
 * @param {object} zaloChatQueue - BullMQ queue
 */
export const setupReminderJob = async (redisClient, UID, zaloChatQueue) => {
    const lastSentKey = `last-sent-${UID}`;
    const reminderJobId = `reminder-${UID}`;

    try {
        await redisClient.set(lastSentKey, Date.now());
        await redisClient.expire(lastSentKey, 7200);

        await zaloChatQueue.add(
            "reminder-check",
            { UID },
            {
                jobId: reminderJobId,
                delay: 10000, // 10 giây
                // delay: 3600000, // 1 giờ
            }
        );
        logger.info(`[Reminder Service] Đã thiết lập reminder job cho UID: ${UID} (chưa có số điện thoại)`);
    } catch (error) {
        logger.error(`[Reminder Service] Lỗi khi thiết lập reminder job cho UID ${UID}:`, error.message);
    }
};

/**
 * Xử lý công việc kiểm tra reminder và gửi tin nhắn nhắc nhở
 * @param {object} redisClient - Redis client
 * @param {string} UID - User ID
 */
export const handleReminderCheck = async (redisClient, UID) => {
    const lastSentKey = `last-sent-${UID}`;
    const lastReceivedKey = `last-received-${UID}`;
    const reminderSentKey = `reminder-sent-${UID}`;
    const hasPhoneKey = `has-phone-${UID}`;

    try {
        const lastSent = await redisClient.get(lastSentKey);
        const lastReceived = await redisClient.get(lastReceivedKey);
        const reminderSent = await redisClient.get(reminderSentKey);
        const hasPhone = await redisClient.get(hasPhoneKey);

        logger.info(`[Reminder Service] Kiểm tra reminder cho UID: ${UID}`, {
            lastSent,
            lastReceived,
            reminderSent,
            hasPhone,
        });

        // Nếu đã có số điện thoại => bỏ qua
        if (hasPhone === "true") {
            logger.info(`[Reminder Service] Bỏ qua reminder cho UID: ${UID} (đã có số điện thoại)`);
            return;
        }

        // Nếu chưa gửi reminder, chưa có số điện thoại, và chưa có phản hồi mới => gửi reminder
        if (!reminderSent && lastSent && (!lastReceived || parseInt(lastReceived) < parseInt(lastSent))) {
            const accessToken = await getValidAccessToken();
            if (accessToken) {
                await sendZaloMessage(UID, REMINDER_MESSAGE, accessToken);
                logger.info(`[Reminder Service] Đã gửi tin nhắn reminder cho UID: ${UID}`);
                await redisClient.set(reminderSentKey, "true");
            } else {
                logger.error(`[Reminder Service] Không thể lấy access token để gửi reminder cho UID: ${UID}`);
            }
        } else {
            logger.info(`[Reminder Service] Không cần gửi reminder cho UID: ${UID}`, {
                alreadySent: !!reminderSent,
                userResponded: lastReceived && parseInt(lastReceived) >= parseInt(lastSent),
            });
        }
    } catch (error) {
        logger.error(`[Reminder Service] Lỗi khi xử lý reminder check cho UID ${UID}:`, error.message);
    }
};

/**
 * Cập nhật thời gian tin nhắn cuối cùng được nhận từ người dùng
 * @param {object} redisClient - Redis client
 * @param {string} UID - User ID
 */
export const updateLastReceivedTime = async (redisClient, UID) => {
    const lastReceivedKey = `last-received-${UID}`;
    try {
        await redisClient.set(lastReceivedKey, Date.now());
        await redisClient.expire(lastReceivedKey, 7200);
        logger.info(`[Reminder Service] Cập nhật thời gian tin nhắn cuối cùng cho UID: ${UID}`);
    } catch (error) {
        logger.error(`[Reminder Service] Lỗi khi cập nhật last-received cho UID ${UID}:`, error.message);
    }
};
