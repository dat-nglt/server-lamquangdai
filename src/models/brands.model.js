import { DataTypes } from "sequelize";

const init = (sequelize) => {
  const Brands = sequelize.define(
    "Brands",
    {
      brand_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      brand_name: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      logo_url: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
    },
    {
      tableName: "brands",
      timestamps: false,
    }
  );

  Brands.associate = (db) => {
    Brands.hasMany(db.Products, { foreignKey: "brand_id" });
  };

  return Brands;
};

export default init;