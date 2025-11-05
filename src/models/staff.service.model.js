import { DataTypes } from "sequelize";

const init = (sequelize) => {
  const StaffService = sequelize.define(
    "StaffService",
    {
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
      },
      service_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "services",
          key: "service_id",
        },
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
    },
    {
      tableName: "staff_services",
      timestamps: false,
    }
  );

  return StaffService;
};

export default init;
