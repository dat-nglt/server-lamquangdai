import jwt from "jsonwebtoken";

/**
 * ----------------------------------------
 * 1. MIDDLEWARE: checkAuth
 * ----------------------------------------
 * - Xác thực token (JWT) của người dùng.
 * - Giải mã token và gắn thông tin user (payload) vào `req.user`.
 * - Nếu token không hợp lệ hoặc hết hạn, trả về lỗi 401.
 */
export const checkAuth = (req, res, next) => {
  try {
    // 1. Lấy token từ header
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({
        message: "Xác thực thất bại: Yêu cầu cần có token.",
      });
    }

    // 2. Kiểm tra định dạng "Bearer <token>"
    const token = authHeader.split(" ")[1]; // Tách lấy phần token
    if (!token) {
      return res.status(401).json({
        message: "Xác thực thất bại: Định dạng token không hợp lệ.",
      });
    }

    // 3. Xác thực token
    // (Bí mật này PHẢI giống hệt bí mật khi bạn tạo token lúc đăng nhập)
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

    // 4. Gắn thông tin user đã giải mã vào request
    // (Payload này nên chứa user_id và role)
    req.user = decodedToken; // Ví dụ: req.user = { user_id: '...', role: 'admin' }

    // 5. Cho phép đi tiếp
    next();
  } catch (error) {
    // 7. Xử lý lỗi (Token hết hạn, sai chữ ký,...)
    if (error.name === "TokenExpiredError") {
      return res
        .status(401)
        .json({ message: "Xác thực thất bại: Token đã hết hạn." });
    }
    return res
      .status(401)
      .json({ message: "Xác thực thất bại: Token không hợp lệ." });
  }
};

/**
 * ----------------------------------------
 * 2. MIDDLEWARE: checkAdmin
 * ----------------------------------------
 * - Middleware này PHẢI chạy SAU khi `checkAuth` đã chạy.
 * - Nó kiểm tra thông tin `req.user` (do checkAuth gắn vào).
 * - Nếu `req.user.role` không phải là 'admin', trả về lỗi 403 (Forbidden).
 */
export const checkAdmin = (req, res, next) => {
  // `checkAuth` phải chạy trước, nên `req.user` phải tồn tại
  if (!req.user) {
    return res.status(401).json({
      message: "Lỗi xác thực (chưa chạy checkAuth).",
    });
  }

  // 1. Kiểm tra quyền
  if (req.user.role !== "admin") {
    return res.status(403).json({
      message: "Truy cập bị từ chối: Yêu cầu quyền Quản trị viên (Admin).",
    });
  }

  // 2. Nếu là admin, cho phép đi tiếp
  next();
};
