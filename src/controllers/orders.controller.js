import { createOrderService, getAllOrdersService, getOrderDetailsService, getOrdersByUserIdService, updateOrderStatusService } from "../services/orders.service";

/**
 * ----------------------------------------
 * CONTROLLER: TẠO ĐƠN HÀNG (CHECKOUT)
 * (POST /api/orders)
 * ----------------------------------------
 */
export const createOrderController = async (req, res) => {
  try {
    // Giả sử middleware checkAuth đã gắn req.user.user_id
    const userId = req.user?.user_id;
    if (!userId) {
      return res.status(401).json({ message: "Yêu cầu xác thực." });
    }

    // req.body chứa (delivery_address, cart_items, voucher_id, discount_amount)
    const newOrder = await createOrderService(userId, req.body);

    res.status(201).json(newOrder);
  } catch (error) {
    // Xử lý lỗi (ví dụ: giỏ hàng rỗng, sản phẩm không tồn tại)
    res.status(400).json({ message: error.message });
  }
};

/**
 * ----------------------------------------
 * CONTROLLER: LẤY LỊCH SỬ ĐƠN HÀNG (CỦA TÔI)
 * (GET /api/orders/me)
 * ----------------------------------------
 */
export const getMyOrdersController = async (req, res) => {
  try {
    const userId = req.user?.user_id;
    if (!userId) {
      return res.status(401).json({ message: "Yêu cầu xác thực." });
    }

    // req.query chứa (page, limit, status)
    const result = await getOrdersByUserIdService(userId, req.query);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * ----------------------------------------
 * CONTROLLER: LẤY CHI TIẾT 1 ĐƠN HÀNG (CỦA TÔI)
 * (GET /api/orders/me/:id)
 * ----------------------------------------
 */
export const getMyOrderDetailsController = async (req, res) => {
  try {
    const userId = req.user?.user_id;
    const { id: orderId } = req.params;

    if (!userId) {
      return res.status(401).json({ message: "Yêu cầu xác thực." });
    }

    const order = await getOrderDetailsService(orderId, userId);

    if (!order) {
      // (Không tìm thấy, có thể do sai ID hoặc đơn hàng này không phải của user)
      return res.status(404).json({ message: "Không tìm thấy đơn hàng." });
    }

    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * ----------------------------------------
 * CONTROLLER: USER TỰ HUỶ ĐƠN HÀNG
 * (PATCH /api/orders/me/:id/cancel)
 * ----------------------------------------
 */
export const cancelMyOrderController = async (req, res) => {
  try {
    const userId = req.user?.user_id;
    const { id: orderId } = req.params;

    if (!userId) {
      return res.status(401).json({ message: "Yêu cầu xác thực." });
    }

    const updatedOrder = await updateOrderStatusService(
      orderId,
      "cancelled",
      userId
    );
    res.status(200).json(updatedOrder);
  } catch (error) {
    // Lỗi từ service (ví dụ: không được phép huỷ)
    if (
      error.message.includes("không có quyền") ||
      error.message.includes("chỉ có thể huỷ")
    ) {
      return res.status(403).json({ message: error.message }); // 403 Forbidden
    }
    if (error.message.includes("Không tìm thấy")) {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: error.message });
  }
};

// ----------------------------------------
// --- CÁC ROUTE CỦA ADMIN ---
// (Giả sử các route này được bảo vệ bằng middleware checkAdmin)
// ----------------------------------------

/**
 * ----------------------------------------
 * CONTROLLER: LẤY TẤT CẢ ĐƠN HÀNG (Admin)
 * (GET /api/admin/orders)
 * ----------------------------------------
 */
export const getAllOrdersController = async (req, res) => {
  try {
    // req.query (page, limit, status, user_id)
    const result = await getAllOrdersService(req.query);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * ----------------------------------------
 * CONTROLLER: LẤY CHI TIẾT 1 ĐƠN HÀNG (Admin)
 * (GET /api/admin/orders/:id)
 * ----------------------------------------
 */
export const getOrderDetailsController = async (req, res) => {
  try {
    const { id: orderId } = req.params;
    // Gọi hàm chi tiết nhưng không truyền userId
    const order = await getOrderDetailsService(orderId, null);

    if (!order) {
      return res.status(404).json({ message: "Không tìm thấy đơn hàng." });
    }
    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * ----------------------------------------
 * CONTROLLER: CẬP NHẬT TRẠNG THÁI (Admin)
 * (PATCH /api/admin/orders/:id/status)
 * ----------------------------------------
 */
export const updateOrderStatusController = async (req, res) => {
  try {
    const { id: orderId } = req.params;
    const { status } = req.body;

    if (!status) {
      return res
        .status(400)
        .json({ message: "Trạng thái (status) là bắt buộc." });
    }

    // Gọi hàm cập nhật, không truyền userId
    const updatedOrder = await updateOrderStatusService(
      orderId,
      status,
      null
    );
    res.status(200).json(updatedOrder);
  } catch (error) {
    if (error.message.includes("Không tìm thấy")) {
      return res.status(404).json({ message: error.message });
    }
    if (error.message.includes("Trạng thái không hợp lệ")) {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: error.message });
  }
};
