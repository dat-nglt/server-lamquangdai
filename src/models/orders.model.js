import { DataTypes } from "sequelize";

const init = (sequelize) => {
  const Orders = sequelize.define(
    "Orders",
    {
      order_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      user_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "users",
          key: "user_id",
        },
      },
      order_date: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      total_price: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        validate: {
          min: 0,
        },
      },
      status: {
        type: DataTypes.ENUM(
          "pending",
          "confirmed",
          "shipping",
          "delivered",
          "cancelled"
        ),
        defaultValue: "pending",
      },
      delivery_address: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
    },
    {
      tableName: "orders",
      timestamps: false,
    }
  );

  Orders.associate = (db) => {
    Orders.belongsTo(db.Users, { foreignKey: "user_id" });
    Orders.hasMany(db.OrderDetails, { foreignKey: "order_id" });
  };

  return Orders;
};

export default init;
