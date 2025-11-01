/** @type {import('sequelize-cli').Migration} */
export const up = async (queryInterface, Sequelize) => {
  const { DataTypes } = Sequelize;

  await queryInterface.createTable("vouchers", {
    voucher_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    code: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: true, // Cho phép voucher chung
      references: {
        model: "users", // Tên BẢNG
        key: "user_id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    },
    discount_type: {
      type: DataTypes.ENUM("percentage", "fixed_amount", "free_shipping"),
      allowNull: false,
      defaultValue: "fixed_amount",
    },
    discount_value: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    max_discount_amount: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    min_purchase_amount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    usage_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    applicability_scope: {
      type: DataTypes.ENUM("all_products", "specific_products"),
      allowNull: false,
      defaultValue: "all_products",
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    // Đồng bộ với model (có created_at và expires_at)
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    expires_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  });
};

export const down = async (queryInterface, Sequelize) => {
  await queryInterface.dropTable("vouchers");
};
