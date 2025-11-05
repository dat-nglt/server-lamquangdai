import { DataTypes } from "sequelize";

export default {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("staff_services", {
      staff_service_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      staff_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "staff",
          key: "staff_id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      service_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "services",
          key: "service_id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      proficiency_level: {
        type: DataTypes.ENUM("beginner", "intermediate", "expert"),
        defaultValue: "intermediate",
      },
      is_certified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      certification_date: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    });

    await queryInterface.addIndex(
      "staff_services",
      ["staff_id", "service_id"],
      {
        unique: true,
        name: "staff_service_unique",
      }
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("staff_services");
  },
};
