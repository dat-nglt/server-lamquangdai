import {
  addItemToCartService,
  clearCartService,
  getCartByUserIdService,
  removeItemFromCartService,
  updateItemQuantityService,
} from "../services/cart.service";

// Hàm trợ giúp để lấy userId (giả định từ middleware auth)
const getUserIdFromRequest = (req) => {
  if (!req.user || !req.user.user_id) {
    // Đây là lỗi 500 vì middleware lẽ ra phải chặn nếu không auth
    throw new Error("Không tìm thấy thông tin xác thực người dùng.");
  }
  return req.user.user_id;
};

/**
 * ----------------------------------------
 * CONTROLLER: LẤY GIỎ HÀNG CỦA TÔI
 * (GET /api/cart)
 * ----------------------------------------
 */
export const getMyCartController = async (req, res) => {
  try {
    const userId = getUserIdFromRequest(req);
    const cartItems = await getCartByUserIdService(userId);
    res.status(200).json(cartItems);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * ----------------------------------------
 * CONTROLLER: THÊM MỤC VÀO GIỎ
 * (POST /api/cart)
 * ----------------------------------------
 */
export const addItemController = async (req, res) => {
  try {
    const userId = getUserIdFromRequest(req);
    const { product_id, quantity } = req.body;

    // 1. Validate input
    if (!product_id || !quantity) {
      return res.status(400).json({
        message: "product_id và quantity là bắt buộc",
      });
    }

    const qty = parseInt(quantity, 10);
    if (isNaN(qty) || qty <= 0) {
      return res.status(400).json({
        message: "Số lượng (quantity) phải là một số lớn hơn 0",
      });
    }

    // 2. Gọi service
    const item = await addItemToCartService({
      userId,
      productId: product_id,
      quantity: qty,
    });

    // 3. Trả về (200 OK vì nó có thể là create hoặc update)
    res.status(200).json(item);
  } catch (error) {
    // 4. Xử lý lỗi (ví dụ: sản phẩm không tồn tại)
    if (
      error.message.includes("Sản phẩm không tồn tại") ||
      error.message.includes("không khả dụng")
    ) {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: error.message });
  }
};

/**
 * ----------------------------------------
 * CONTROLLER: CẬP NHẬT SỐ LƯỢNG MỤC
 * (PUT /api/cart/:productId)
 * ----------------------------------------
 */
export const updateItemController = async (req, res) => {
  try {
    const userId = getUserIdFromRequest(req);
    const { productId } = req.params; // Lấy từ URL
    const { quantity } = req.body; // Lấy từ body

    // 1. Validate
    if (quantity === undefined) {
      return res
        .status(400)
        .json({ message: "Số lượng (quantity) là bắt buộc" });
    }

    const qty = parseInt(quantity, 10);
    if (isNaN(qty) || qty < 0) {
      return res.status(400).json({
        message: "Số lượng (quantity) phải là một số không âm (>= 0)",
      });
    }

    // 2. Gọi service
    const updatedItem = await updateItemQuantityService({
      userId,
      productId,
      quantity: qty,
    });

    // 3. Trả về
    if (updatedItem) {
      res.status(200).json(updatedItem);
    } else {
      // (Nếu service trả về null, nghĩa là số lượng = 0 và đã bị xoá)
      res.status(204).send(); // 204 No Content
    }
  } catch (error) {
    if (error.message.includes("Sản phẩm không có trong giỏ hàng")) {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: error.message });
  }
};

/**
 * ----------------------------------------
 * CONTROLLER: XOÁ 1 MỤC KHỎI GIỎ
 * (DELETE /api/cart/:productId)
 * ----------------------------------------
 */
export const removeItemController = async (req, res) => {
  try {
    const userId = getUserIdFromRequest(req);
    const { productId } = req.params;

    const deletedCount = await removeItemFromCartService({
      userId,
      productId,
    });

    if (deletedCount === 0) {
      return res
        .status(404)
        .json({ message: "Sản phẩm không có trong giỏ hàng" });
    }

    res.status(204).send(); // Xoá thành công
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * ----------------------------------------
 * CONTROLLER: XOÁ SẠCH GIỎ HÀNG
 * (DELETE /api/cart)
 * ----------------------------------------
 */
export const clearMyCartController = async (req, res) => {
  try {
    const userId = getUserIdFromRequest(req);
    await clearCartService(userId);
    res.status(204).send(); // Luôn thành công (kể cả khi giỏ đã rỗng)
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
