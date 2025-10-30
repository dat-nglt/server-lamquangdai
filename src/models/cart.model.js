import { DataTypes } from 'sequelize';



const init = (sequelize) => {
  const Cart = sequelize.define('Cart', {
    cart_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'user_id'
      }
    },
    product_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'products',
        key: 'product_id'
      }
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1
      }
    },
    added_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'cart',
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ['user_id', 'product_id']
      }
    ]
  });

  Cart.associate = (db) => {
    Cart.belongsTo(db.Users, { foreignKey: 'user_id' });
    Cart.belongsTo(db.Products, { foreignKey: 'product_id' });
  };

  return Cart;
};

export default init;