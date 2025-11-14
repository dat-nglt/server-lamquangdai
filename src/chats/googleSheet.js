import { google } from "googleapis";
import path from "path"; // Thêm thư viện path
import logger from "../utils/logger";

// 1. Xử lý đường dẫn file key an toàn hơn
// __dirname giúp định vị file dựa trên vị trí file code hiện tại, tránh lỗi khi chạy từ thư mục khác
const keyFilePath = path.join(process.cwd(), "src/chats/google-sheet-key.json");
// LƯU Ý: Đảm bảo đường dẫn trỏ đúng tới file key của bạn

// 2. Khởi tạo Auth
const auth = new google.auth.GoogleAuth({
    keyFile: keyFilePath, // Google tự động đọc file, không cần fs.readFileSync thủ công
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

const sheets = google.sheets({ version: "v4", auth });

// 3. Lấy Spreadsheet ID từ biến môi trường (Khuyên dùng) hoặc fallback về chuỗi cứng
const SPREADSHEET_ID =
    process.env.SPREADSHEET_ID ||
    "1NyOabylt4AJlHzhXuQCTwsgg4rOCDwx_podtTwFMe5w";

export const appendJsonToSheet = async (sheetName, jsonData) => {
    try {
        // logger.warn dùng cho cảnh báo, logger.info hợp lý hơn cho thông tin thường
        logger.info(`[Sheet] Chuẩn bị ghi dữ liệu vào sheet: ${sheetName}`);

        // 4. Xử lý ngày giờ chuẩn múi giờ Việt Nam bất kể server ở đâu
        const vietnamTime = new Date().toLocaleString("vi-VN", {
            timeZone: "Asia/Ho_Chi_Minh",
            hour12: false, // Dùng định dạng 24h (14:30 thay vì 2:30 PM) cho dễ nhìn
        });

        // 5. Chuẩn hóa dữ liệu SĐT để tránh mất số 0
        // Thêm dấu ' đằng trước để Excel/Sheet hiểu là văn bản
        const phone = jsonData.soDienThoai ? `'${jsonData.soDienThoai}` : "";

        const row = [
            jsonData.tenKhachHang || "",
            phone,
            jsonData.nhuCau || "",
            "ZALO OA - ChatAI",
            vietnamTime,
        ];

        const range = `${sheetName}!A:E`; // Chỉ định cột A đến E, Google tự tìm dòng trống

        const response = await sheets.spreadsheets.values.append({
            spreadsheetId: SPREADSHEET_ID,
            range,
            valueInputOption: "USER_ENTERED", // QUAN TRỌNG: Để giữ định dạng SĐT và Date
            insertDataOption: "INSERT_ROWS", // Đảm bảo không ghi đè
            requestBody: {
                values: [row],
            },
        });

        logger.info(
            `[Sheet] Đã ghi thành công vào dòng ${response.data.updates?.updatedRange}`
        );
        return true;
    } catch (error) {
        logger.error(`[Sheet] Lỗi khi ghi file: ${error.message}`);
        return false;
    }
};
