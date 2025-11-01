// src/services/cart.service.js

import db from "../models/index.js";

// Import các model cần thiết
const { Cart, Products } = db;

/**
 * ----------------------------------------
 * SERVICE: LẤY GIỎ HÀNG CỦA NGƯỜI DÙNG
 * ----------------------------------------
 */
export const getCartByUserIdService = async (userId) => {
  try {
    const cartItems = await Cart.findAll({
      where: { user_id: userId },
      // Lấy kèm thông tin sản phẩm (tên, giá, ảnh)
      include: [
        {
          model: Products,
          attributes: ["product_name", "price", "image_url", "status"],
        },
      ],
      order: [["added_at", "DESC"]],
    });
    return cartItems;
  } catch (error) {
    throw new Error(`Không thể lấy giỏ hàng: ${error.message}`);
  }
};

/**
 * ----------------------------------------
 * SERVICE: THÊM SẢN PHẨM VÀO GIỎ HÀNG
 * (Xử lý logic "tăng số lượng nếu đã tồn tại")
 * ----------------------------------------
 */
export const addItemToCartService = async ({ userId, productId, quantity }) => {
  try {
    // 1. Kiểm tra sản phẩm có tồn tại không
    const product = await Products.findByPk(productId);
    if (!product) {
      throw new Error("Sản phẩm không tồn tại.");
    }
    // (Tuỳ chọn: Kiểm tra trạng thái sản phẩm, tồn kho,...)
    if (product.status !== "active") {
      throw new Error("Sản phẩm hiện không khả dụng.");
    }

    // 2. Tìm hoặc Tạo mới (Find or Create)
    // Dùng findOrCreate để xử lý đồng thời logic của unique index
    const [cartItem, created] = await Cart.findOrCreate({
      where: {
        user_id: userId,
        product_id: productId,
      },
      defaults: {
        quantity: quantity,
      },
    });

    // 3. Nếu 'created' là false (tức là đã tìm thấy), thì cộng dồn số lượng
    if (!created) {
      cartItem.quantity += parseInt(quantity, 10);
      await cartItem.save();
    }

    return cartItem;
  } catch (error) {
    throw new Error(error.message); // Ném lỗi (ví dụ: "Sản phẩm không tồn tại")
  }
};

/**
 * ----------------------------------------
 * SERVICE: CẬP NHẬT SỐ LƯỢNG (SET SỐ LƯỢNG CỤ THỂ)
 * ----------------------------------------
 */
export const updateItemQuantityService = async ({
  userId,
  productId,
  quantity,
}) => {
  try {
    const cartItem = await Cart.findOne({
      where: {
        user_id: userId,
        product_id: productId,
      },
    });

    if (!cartItem) {
      throw new Error("Sản phẩm không có trong giỏ hàng.");
    }

    // Nếu số lượng <= 0, xoá sản phẩm khỏi giỏ
    if (quantity <= 0) {
      await cartItem.destroy();
      return null; // Trả về null để báo hiệu đã xoá
    }

    // Nếu số lượng > 0, cập nhật
    cartItem.quantity = quantity;
    await cartItem.save();

    return cartItem;
  } catch (error) {
    throw new Error(error.message);
  }
};

/**
 * ----------------------------------------
 * SERVICE: XOÁ 1 MỤC KHỎI GIỎ HÀNG
 * ----------------------------------------
 */
export const removeItemFromCartService = async ({ userId, productId }) => {
  try {
    const deletedRowCount = await Cart.destroy({
      where: {
        user_id: userId,
        product_id: productId,
      },
    });
    return deletedRowCount; // 0 hoặc 1
  } catch (error) {
    throw new Error(`Không thể xoá mục: ${error.message}`);
  }
};

/**
 * ----------------------------------------
 * SERVICE: XOÁ SẠCH GIỎ HÀNG (SAU KHI ĐẶT HÀNG)
 * ----------------------------------------
 */
export const clearCartService = async (userId) => {
  try {
    const deletedRowCount = await Cart.destroy({
      where: {
        user_id: userId,
      },
    });
    return deletedRowCount;
  } catch (error) {
    throw new Error(`Không thể dọn dẹp giỏ hàng: ${error.message}`);
  }
};
