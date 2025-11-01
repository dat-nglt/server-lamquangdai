import { DataTypes } from "sequelize";

const init = (sequelize) => {
  const Vouchers = sequelize.define(
    "Vouchers",
    {
      voucher_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      // Mã code mà người dùng sẽ nhập (ví dụ: 'SALE20', 'WELCOME50K')
      code: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true, // Đảm bảo mã voucher là duy nhất
      },
      // Mô tả voucher
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      // Liên kết với user.
      // Nếu 'user_id' là NULL, đây là voucher chung.
      // Nếu có giá trị, đây là voucher gán riêng cho user đó.
      user_id: {
        type: DataTypes.UUID,
        allowNull: true, // Cho phép null để tạo voucher chung
        references: {
          model: "users", // Tên bảng 'users'
          key: "user_id",
        },
      },
      // Loại giảm giá: 'percentage' (phần trăm), 'fixed_amount' (số tiền cố định), 'free_shipping' (miễn phí vận chuyển)
      discount_type: {
        type: DataTypes.ENUM("percentage", "fixed_amount", "free_shipping"),
        allowNull: false,
        defaultValue: "fixed_amount",
      },
      // Giá trị của mã giảm giá
      // Ví dụ: 20 (nếu type là 'percentage') hoặc 50000 (nếu type là 'fixed_amount')
      discount_value: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          min: 0,
        },
      },
      // Giảm giá tối đa (rất quan trọng khi dùng type 'percentage')
      // Ví dụ: Giảm 20% nhưng tối đa 50.000 VNĐ
      max_discount_amount: {
        type: DataTypes.INTEGER,
        allowNull: true, // Có thể không cần nếu là 'fixed_amount'
        validate: {
          min: 0,
        },
      },
      // Yêu cầu giá trị đơn hàng tối thiểu để áp dụng voucher
      min_purchase_amount: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        validate: {
          min: 0,
        },
      },
      // Tổng số lượng voucher này có thể được sử dụng
      // Ví dụ: Chỉ có 100 mã 'SALE20'
      quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
        validate: {
          min: 1, // Ít nhất phải có 1
        },
      },
      // Số lần voucher này đã được sử dụng (để so sánh với 'quantity')
      usage_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        validate: {
          min: 0,
        },
      },

      // 'all_products': Áp dụng cho toàn bộ đơn hàng.
      // 'specific_products': Chỉ áp dụng cho các sản phẩm được liệt kê trong bảng trung gian.
      applicability_scope: {
        type: DataTypes.ENUM("all_products", "specific_products"),
        allowNull: false,
        defaultValue: "all_products", // Mặc định là áp dụng cho tất cả
      },

      // Trạng thái (có thể dùng để admin bật/tắt voucher)
      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      // Ngày voucher bắt đầu có hiệu lực (thêm 'created_at' vì nó quan trọng)
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      // Ngày voucher hết hạn (quan trọng)
      expires_at: {
        type: DataTypes.DATE,
        allowNull: false, // Voucher luôn phải có ngày hết hạn
      },
    },
    {
      tableName: "vouchers",
      timestamps: false, // Giữ nguyên style giống như file 'Memberships' của bạn
    }
  );

  Vouchers.associate = (db) => {
    // Một voucher CÓ THỂ thuộc về một User (cho trường hợp voucher riêng)
    // Mối quan hệ này là 'belongsTo' vì foreign key 'user_id' nằm trong bảng Vouchers
    Vouchers.belongsTo(db.Users, {
      foreignKey: "user_id",
      as: "user", // Đặt bí danh để dễ truy vấn
    });

    Vouchers.belongsToMany(db.Products, {
      through: db.VoucherProducts, // Tên Model của bảng trung gian
      foreignKey: "voucher_id", // Khóa ngoại trỏ đến Vouchers
      otherKey: "product_id", // Khóa ngoại trỏ đến Products
      as: "applicableProducts", // Bí danh khi truy vấn
    });
  };

  return Vouchers;
};

export default init;
