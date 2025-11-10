export const extractPhoneNumber = (messageFromUser) => {
  // Kiểm tra nếu đầu vào không phải là chuỗi
  if (typeof tinNhan !== "string" || tinNhan.length === 0) {
    return [];
  }

  // Khuôn mẫu Regex (tìm SĐT di động 10 số, bắt đầu bằng 0, +84, hoặc 84)
  const phoneRegex = /\b((0|\+84|84)[35789]\d{8})\b/g;

  // Thực hiện trích xuất
  const ketQua = tinNhan.match(phoneRegex);

  // Hàm .match() sẽ trả về null nếu không tìm thấy gì.
  // Chúng ta sẽ trả về mảng rỗng [] cho thống nhất.
  if (ketQua) {
    return ketQua;
  } else {
    return [];
  }
};
