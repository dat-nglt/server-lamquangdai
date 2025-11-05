import { DataTypes } from "sequelize";

export default {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("services", {
      service_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      base_price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      price_unit: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      is_free: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      requires_quote: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      performance_benefit: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      warranty_period: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      service_type: {
        type: DataTypes.ENUM(
          "installation",
          "maintenance",
          "cleaning",
          "consultation"
        ),
        allowNull: false,
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("services");
  },
};
