import { google } from "googleapis";
import fs from "fs";

const auth = new google.auth.GoogleAuth({
    credentials: JSON.parse(fs.readFileSync("google-sheet-key.json")),
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

const sheets = google.sheets({ version: "v4", auth });

export const appendJsonToSheet = async (sheetName, jsonData) => {
    // Chuyển JSON → array theo đúng thứ tự cột trong sheet
    const row = [
        jsonData.tenKhachHang || "",
        jsonData.soDienThoai || "",
        jsonData.nhuCau || "",
        "ZALO OA - ChatAI",
        new Date().toLocaleString("vi-VN"),
    ];

    const range = `${sheetName}!A1`;

    await sheets.spreadsheets.values.append({
        spreadsheetId: "1NyOabylt4AJlHzhXuQCTwsgg4rOCDwx_podtTwFMe5w",
        range,
        valueInputOption: "RAW",
        requestBody: {
            values: [row],
        },
    });

    return true;
};
