import { DataTypes } from "sequelize";

const init = (sequelize) => {
  const Staff = sequelize.define(
    "Staff",
    {
      staff_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
      },
      phone: {
        type: DataTypes.STRING(20),
        allowNull: false,
      },
      specialization: {
        type: DataTypes.ENUM(
          "installation",
          "maintenance",
          "cleaning",
          "consultation",
          "general"
        ),
        defaultValue: "general",
      },
      experience_years: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      is_available: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      rating: {
        type: DataTypes.DECIMAL(3, 2),
        defaultValue: 0.0,
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: "staff",
      timestamps: false,
    }
  );

  return Staff;
};

export default init;
