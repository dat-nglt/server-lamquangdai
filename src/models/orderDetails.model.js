  import { DataTypes } from "sequelize";

  const init = (sequelize) => {
    const OrderDetails = sequelize.define(
      "OrderDetails",
      {
        order_id: {
          type: DataTypes.UUID,
          allowNull: false,
          primaryKey: true,
          references: {
            model: "orders",
            key: "order_id",
          },
        },
        product_id: {
          type: DataTypes.UUID,
          allowNull: false,
          primaryKey: true,
          references: {
            model: "products",
            key: "product_id",
          },
        },
        quantity: {
          type: DataTypes.INTEGER,
          allowNull: false,
          validate: {
            min: 1,
          },
        },
        unit_price: {
          type: DataTypes.DECIMAL(12, 2),
          allowNull: false,
          validate: {
            min: 0,
          },
        },
      },
      {
        tableName: "order_details",
        timestamps: false,
      }
    );

    OrderDetails.associate = (db) => {
      OrderDetails.belongsTo(db.Orders, { foreignKey: "order_id" });
      OrderDetails.belongsTo(db.Products, { foreignKey: "product_id" });
    };

    return OrderDetails;
  };

  export default init;
