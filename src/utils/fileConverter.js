import { exec } from "child_process";
import { promisify } from "util";
import { existsSync, unlinkSync } from "fs";
import path from "path";
import logger from "./logger.js";

const execPromise = promisify(exec);

const SUPPORTED_FORMATS = [".pdf", ".doc", ".docx"];

/**
 * Kiểm tra xem file có định dạng được hỗ trợ không
 * @param {string} fileName - Tên file
 * @returns {boolean} True nếu định dạng được hỗ trợ
 */
export const isSupportedFormat = (fileName) => {
    const fileExtension = fileName.toLowerCase().substring(fileName.lastIndexOf("."));
    return SUPPORTED_FORMATS.includes(fileExtension);
};

/**
 * Chuyển đổi file sang định dạng PDF (sử dụng LibreOffice)
 * @param {Buffer} fileBuffer - Buffer của file gốc
 * @param {string} fileName - Tên file gốc
 * @returns {Promise<{buffer: Buffer, newFileName: string}>} Buffer PDF và tên file mới
 */
export const convertFileToPDF = async (fileBuffer, fileName) => {
    const fileExtension = fileName.toLowerCase().substring(fileName.lastIndexOf("."));

    // Nếu đã là PDF, không cần chuyển đổi
    if (fileExtension === ".pdf") {
        logger.info(`[FileConverter] File đã là PDF: ${fileName}`);
        return { buffer: fileBuffer, newFileName: fileName };
    }

    try {
        // Tạo tên file tạm thời
        const tempDir = "/tmp"; // Hoặc process.env.TEMP
        const tempInputFile = path.join(tempDir, `temp_${Date.now()}_${fileName}`);
        const tempOutputFile = path.join(tempDir, `temp_${Date.now()}_${fileName.replace(fileExtension, ".pdf")}`);
        const newFileName = fileName.replace(fileExtension, ".pdf");

        // Ghi file tạm thời
        const fs = await import("fs/promises");
        await fs.writeFile(tempInputFile, fileBuffer);
        logger.info(`[FileConverter] Đã ghi file tạm thời: ${tempInputFile}`);

        // Chuyển đổi sang PDF sử dụng LibreOffice
        logger.info(`[FileConverter] Bắt đầu chuyển đổi ${fileName} sang PDF...`);

        try {
            await execPromise(
                `libreoffice --headless --convert-to pdf --outdir ${tempDir} ${tempInputFile}`,
                { timeout: 30000 } // 30 giây timeout
            );
        } catch (error) {
            logger.error(`[FileConverter] Lỗi chuyển đổi LibreOffice:`, error.message);
            throw new Error(`Failed to convert file: ${error.message}`);
        }

        // Đọc file PDF đã chuyển đổi
        const convertedBuffer = await fs.readFile(tempOutputFile);
        logger.info(`[FileConverter] Chuyển đổi thành công: ${newFileName}`);

        // Xóa file tạm thời
        try {
            if (existsSync(tempInputFile)) {
                unlinkSync(tempInputFile);
            }
            if (existsSync(tempOutputFile)) {
                unlinkSync(tempOutputFile);
            }
            logger.info(`[FileConverter] Đã xóa file tạm thời`);
        } catch (cleanupError) {
            logger.warn(`[FileConverter] Lỗi khi xóa file tạm thời:`, cleanupError.message);
        }

        return { buffer: convertedBuffer, newFileName };
    } catch (error) {
        logger.error(`[FileConverter] Lỗi chuyển đổi file ${fileName}:`, error.message);
        throw new Error(`File conversion failed: ${error.message}`);
    }
};

/**
 * Chuyển đổi file nếu cần thiết
 * @param {Buffer} fileBuffer - Buffer của file
 * @param {string} fileName - Tên file
 * @returns {Promise<{buffer: Buffer, newFileName: string, wasConverted: boolean}>}
 */
export const ensureSupportedFormat = async (fileBuffer, fileName) => {
    if (isSupportedFormat(fileName)) {
        logger.info(`[FileConverter] File đã có định dạng hỗ trợ: ${fileName}`);
        return { buffer: fileBuffer, newFileName: fileName, wasConverted: false };
    }

    logger.warn(`[FileConverter] File không hỗ trợ: ${fileName}. Đang chuyển đổi sang PDF...`);
    const result = await convertFileToPDF(fileBuffer, fileName);
    return { ...result, wasConverted: true };
};
