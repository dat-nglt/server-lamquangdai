# Hướng Dẫn Cài Đặt Chuyển Đổi File

## Vấn Đề Hiện Tại
Server không thể chuyển đổi file XLSX, PPTX, etc. sang PDF.

## Giải Pháp 1: Cài Đặt LibreOffice (Khuyến Nghị)

### Trên Ubuntu/Debian:
\`\`\`bash
sudo apt-get update
sudo apt-get install -y libreoffice
sudo apt-get install -y unoconv
\`\`\`

### Trên CentOS/RHEL:
\`\`\`bash
sudo yum install -y libreoffice
sudo yum install -y libreoffice-headless
\`\`\`

### Kiểm Tra Cài Đặt:
\`\`\`bash
libreoffice --version
unoconv --version
\`\`\`

## Giải Pháp 2: Sử Dụng Dịch Vụ Chuyển Đổi Trực Tuyến

Nếu không muốn cài LibreOffice, có thể sử dụng:
- CloudConvert API (có API key)
- Zamzar API
- Online-Convert API

## Giải Pháp 3: Chỉ Hỗ Trợ Các Định Dạng Có Sẵn

Hiện tại chỉ hỗ trợ: PDF, DOC, DOCX
- Yêu cầu người dùng chuyển đổi file trước khi gửi

## Định Dạng Được Hỗ Trợ

**Trực tiếp:** .pdf, .doc, .docx
**Có thể chuyển đổi (với LibreOffice):** .xlsx, .xls, .ppt, .pptx, .odt, .ods, .odp, .rtf, .txt
\`\`\`
