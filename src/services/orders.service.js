// src/services/orders.service.js

import { Op } from "sequelize";
import db from "../models/index.js";
// Import tất cả các model liên quan
const {
  Orders,
  OrderDetails,
  Products,
  Cart,
  Vouchers,
  Users,
  sequelize, // Import đối tượng sequelize để dùng transaction
} = db;

// Import các service khác để dùng (ví dụ: xoá giỏ hàng)
import { clearCartService } from "./cart.service.js";
// (Bạn cũng có thể import service Vouchers và Memberships nếu cần)

/**
 * ----------------------------------------
 * SERVICE: TẠO MỚI ĐƠN HÀNG (CHECKOUT)
 * (Đây là logic quan trọng và phức tạp nhất)
 * ----------------------------------------
 */
export const createOrderService = async (userId, orderData) => {
  const t = await sequelize.transaction(); // Bắt đầu 1 transaction

  const {
    delivery_address,
    cart_items, // VD: [{ product_id: 'uuid', quantity: 2 }, ...]
    voucher_id = null, // ID của voucher (nếu có)
    discount_amount = 0, // Số tiền đã giảm (nếu có)
  } = orderData;

  // 1. Kiểm tra đầu vào
  if (!delivery_address) throw new Error("Địa chỉ giao hàng là bắt buộc.");
  if (!cart_items || cart_items.length === 0) {
    throw new Error("Giỏ hàng không được rỗng.");
  }

  try {
    // 2. Lấy giá sản phẩm thực tế từ DB (Không tin tưởng giá client)
    const productIds = cart_items.map((item) => item.product_id);
    const productsInDB = await Products.findAll({
      where: { product_id: { [Op.in]: productIds } },
      attributes: ["product_id", "price", "status"],
      transaction: t,
    });

    const productMap = new Map();
    productsInDB.forEach((p) => productMap.set(p.product_id, p));

    // 3. Tính toán tổng tiền (Subtotal) và chuẩn bị data cho OrderDetails
    let subtotal = 0;
    const orderDetailsList = [];

    for (const item of cart_items) {
      const product = productMap.get(item.product_id);

      if (!product) {
        throw new Error(`Sản phẩm ID ${item.product_id} không tồn tại.`);
      }
      if (product.status !== "active") {
        throw new Error(`Sản phẩm ${product.product_name} không khả dụng.`);
      }

      const unit_price = parseFloat(product.price); // Lấy giá từ DB
      const quantity = parseInt(item.quantity, 10);
      subtotal += unit_price * quantity;

      orderDetailsList.push({
        product_id: item.product_id,
        quantity: quantity,
        unit_price: unit_price, // "Snapshot" giá tại thời điểm mua
      });
    }

    // 4. Tính tổng tiền cuối cùng (sau khi trừ voucher)
    // (Giả sử shipping_fee = 0 cho đơn giản)
    const finalTotalPrice = Math.max(0, subtotal - parseFloat(discount_amount));

    // 5. Tạo đơn hàng (Orders)
    const newOrder = await Orders.create(
      {
        user_id: userId,
        total_price: finalTotalPrice,
        status: "pending", // Trạng thái đầu tiên
        delivery_address: delivery_address,
        // (Bạn có thể thêm các trường như voucher_id, subtotal, discount_amount vào model Orders)
      },
      { transaction: t }
    );

    // 6. Thêm order_id vào OrderDetails và Bulk Create
    const newOrderId = newOrder.order_id;
    const detailsWithOrderId = orderDetailsList.map((detail) => ({
      ...detail,
      order_id: newOrderId,
    }));

    await OrderDetails.bulkCreate(detailsWithOrderId, { transaction: t });

    // 7. Cập nhật Voucher (tăng usage_count)
    if (voucher_id) {
      await Vouchers.increment("usage_count", {
        by: 1,
        where: { voucher_id: voucher_id },
        transaction: t,
      });
    }

    // 8. Dọn dẹp giỏ hàng
    // (Giả định 'clearCart' đã được sửa để chấp nhận transaction)
    await clearCartService(userId, t);
    // Nếu clearCartService không nhận 't', bạn có thể xoá thủ công:
    // await Cart.destroy({ where: { user_id: userId }, transaction: t });

    // 9. Commit transaction nếu mọi thứ thành công
    await t.commit();

    // Trả về đơn hàng mới (chưa bao gồm chi tiết)
    return newOrder;
  } catch (error) {
    // 10. Rollback nếu có bất kỳ lỗi nào
    await t.rollback();
    throw new Error(`Tạo đơn hàng thất bại: ${error.message}`);
  }
};

/**
 * ----------------------------------------
 * SERVICE: LẤY LỊCH SỬ ĐƠN HÀNG (CHO USER)
 * ----------------------------------------
 */
export const getOrdersByUserIdService = async (userId, queryParams) => {
  const { page = 1, limit = 10, status } = queryParams;
  const offset = (page - 1) * limit;
  const whereClause = { user_id: userId };

  if (status) whereClause.status = status;

  try {
    const { count, rows } = await Orders.findAndCountAll({
      where: whereClause,
      order: [["order_date", "DESC"]],
      limit: parseInt(limit),
      offset: offset,
    });

    return {
      totalItems: count,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      orders: rows,
    };
  } catch (error) {
    throw new Error(`Không thể lấy lịch sử đơn hàng: ${error.message}`);
  }
};

/**
 * ----------------------------------------
 * SERVICE: LẤY TẤT CẢ ĐƠN HÀNG (CHO ADMIN)
 * ----------------------------------------
 */
export const getAllOrdersService = async (queryParams) => {
  const { page = 1, limit = 10, status, user_id } = queryParams;
  const offset = (page - 1) * limit;
  const whereClause = {};

  if (status) whereClause.status = status;
  if (user_id) whereClause.user_id = user_id;

  try {
    const { count, rows } = await Orders.findAndCountAll({
      where: whereClause,
      include: [{ model: Users, attributes: ["email", "full_name"] }],
      order: [["order_date", "DESC"]],
      limit: parseInt(limit),
      offset: offset,
    });

    return {
      totalItems: count,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      orders: rows,
    };
  } catch (error) {
    throw new Error(`Không thể lấy danh sách đơn hàng: ${error.message}`);
  }
};

/**
 * ----------------------------------------
 * SERVICE: LẤY CHI TIẾT 1 ĐƠN HÀNG
 * ----------------------------------------
 */
export const getOrderDetailsService = async (orderId, userId = null) => {
  try {
    const whereClause = { order_id: orderId };

    // Nếu userId được cung cấp (user đang xem),
    // đảm bảo họ chỉ xem được đơn hàng của chính mình.
    if (userId) {
      whereClause.user_id = userId;
    }

    const order = await Orders.findOne({
      where: whereClause,
      include: [
        {
          model: Users,
          attributes: ["user_id", "email", "full_name"],
        },
        {
          model: OrderDetails,
          include: [
            {
              // Lấy cả thông tin sản phẩm trong chi tiết
              model: Products,
              attributes: ["product_name", "image_url"],
            },
          ],
        },
      ],
    });

    return order; // Trả về null nếu không tìm thấy (do sai orderId hoặc sai userId)
  } catch (error) {
    throw new Error(`Không thể lấy chi tiết đơn hàng: ${error.message}`);
  }
};

/**
 * ----------------------------------------
 * SERVICE: CẬP NHẬT TRẠNG THÁI ĐƠN HÀNG
 * ----------------------------------------
 */
export const updateOrderStatusService = async (
  orderId,
  status,
  userId = null
) => {
  try {
    const order = await Orders.findByPk(orderId);
    if (!order) {
      throw new Error("Không tìm thấy đơn hàng.");
    }

    // Nếu userId được cung cấp (user tự huỷ đơn)
    if (userId) {
      if (order.user_id !== userId) {
        throw new Error("Bạn không có quyền thực hiện hành động này.");
      }
      // User chỉ được phép huỷ khi đơn đang 'pending'
      if (status === "cancelled" && order.status === "pending") {
        order.status = "cancelled";
        await order.save();
        return order;
      } else {
        throw new Error(
          'Bạn chỉ có thể huỷ đơn hàng khi đang ở trạng thái "Chờ xử lý".'
        );
      }
    }

    // Nếu Admin cập nhật (userId = null)
    // (Giả sử đã có middleware checkAdmin ở controller)
    const validStatuses = [
      "pending",
      "confirmed",
      "shipping",
      "delivered",
      "cancelled",
    ];
    if (!validStatuses.includes(status)) {
      throw new Error("Trạng thái không hợp lệ.");
    }

    order.status = status;
    await order.save();

    // (Logic nâng cao: Nếu status = 'delivered', cộng điểm
    // cho 'Memberships' tại đây)
    // if (status === 'delivered') {
    //   await membershipService.addPointsToUser(order.user_id, ...);
    // }

    return order;
  } catch (error) {
    throw new Error(error.message);
  }
};
