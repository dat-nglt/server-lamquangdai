import { QueryTypes } from "sequelize"; // 👈 Cần import

/** @type {import('sequelize-cli').Migration} */
export const up = async (queryInterface, Sequelize) => {
  console.log(
    "Seeding order_details... matching orders to their products..."
  );

  try {
    // --- BƯỚC 1: LẤY CÁC SẢN PHẨM MẪU ---
    // (Giả định đã chạy seed-products)
    const products = await queryInterface.sequelize.query(
      `SELECT product_id, product_name, price FROM "products" WHERE product_name IN (
        'iPhone 15 Pro Max 256GB',
        'Tai nghe Sony WH-1000XM5',
        'Máy lạnh Daikin Inverter 1.5 HP'
      )`,
      { type: QueryTypes.SELECT }
    );

    // Tạo một map để dễ tra cứu: { 'Tên SP': { id: '...', price: '...' } }
    const productMap = products.reduce((acc, p) => {
      acc[p.product_name] = { id: p.product_id, price: p.price };
      return acc;
    }, {});

    // --- BƯỚC 2: LẤY CÁC ĐƠN HÀNG MẪU ---
    // (Giả định đã chạy seed-orders)
    const orders = await queryInterface.sequelize.query(
      `SELECT order_id, total_price FROM "orders" WHERE status != 'cancelled'`,
      { type: QueryTypes.SELECT }
    );
    
    // Tạo một map để dễ tra cứu: { 'total_price': 'order_id' }
    const orderMap = orders.reduce((acc, o) => {
      // Dùng toFixed(2) để đảm bảo key là string "123.00"
      acc[parseFloat(o.total_price).toFixed(2)] = o.order_id;
      return acc;
    }, {});

    if (products.length === 0 || orders.length === 0) {
      console.warn("⚠️  Không tìm thấy products hoặc orders. Bỏ qua seeding 'order_details'.");
      return;
    }

    // --- BƯỚC 3: TẠO DỮ LIỆU LIÊN KẾT ---
    // Chúng ta sẽ liên kết các đơn hàng với sản phẩm dựa trên giá
    // (vì trong các seeder trước, chúng ta đã cố tình đặt giá trị này khớp nhau)
    
    const orderDetailsData = [];

    // 1. Khớp "Đơn hàng iPhone" với "Sản phẩm iPhone"
    const iphoneProd = productMap['iPhone 15 Pro Max 256GB'];
    const iphoneOrderId = orderMap[parseFloat(iphoneProd.price).toFixed(2)]; // 32990000.00
    
    if (iphoneOrderId && iphoneProd) {
      orderDetailsData.push({
        order_id: iphoneOrderId,
        product_id: iphoneProd.id,
        quantity: 1,
        unit_price: iphoneProd.price, // Giá tại thời điểm mua
      });
    }

    // 2. Khớp "Đơn hàng Tai nghe" với "Sản phẩm Tai nghe"
    const sonyProd = productMap['Tai nghe Sony WH-1000XM5'];
    const sonyOrderId = orderMap[parseFloat(sonyProd.price).toFixed(2)]; // 8490000.00

    if (sonyOrderId && sonyProd) {
      orderDetailsData.push({
        order_id: sonyOrderId,
        product_id: sonyProd.id,
        quantity: 1,
        unit_price: sonyProd.price,
      });
    }
    
    // 3. Khớp "Đơn hàng Máy lạnh" với "Sản phẩm Máy lạnh"
    const daikinProd = productMap['Máy lạnh Daikin Inverter 1.5 HP'];
    const daikinOrderId = orderMap[parseFloat(daikinProd.price).toFixed(2)]; // 13700000.00

    if (daikinOrderId && daikinProd) {
      orderDetailsData.push({
        order_id: daikinOrderId,
        product_id: daikinProd.id,
        quantity: 1,
        unit_price: daikinProd.price,
      });
    }

    // --- BƯỚC 4: CHÈN DỮ LIỆU ---
    if (orderDetailsData.length === 0) {
       console.warn("⚠️  Không thể khớp bất kỳ order nào với product. Đã bỏ qua.");
       return;
    }

    await queryInterface.bulkInsert("order_details", orderDetailsData, {});
    console.log(`✅ Seeded ${orderDetailsData.length} order_details`);

  } catch (error) {
    console.error("❌ Lỗi khi seeding 'order_details':", error.message);
    console.error(
      "Vui lòng đảm bảo bạn đã chạy seeders 'users', 'products', và 'orders' trước."
    );
  }
};

export const down = async (queryInterface, Sequelize) => {
  // Xóa toàn bộ dữ liệu trong bảng 'order_details'
  await queryInterface.bulkDelete("order_details", null, {});
  console.log("❌ Emptied order_details table");
};