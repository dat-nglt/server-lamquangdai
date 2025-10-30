import { DataTypes } from "sequelize";

const init = (sequelize) => {
  const Users = sequelize.define(
    "Users",
    {
      user_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      full_name: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      phone: {
        type: DataTypes.STRING(15),
        allowNull: false,
        unique: true,
      },
      email: {
        type: DataTypes.STRING(100),
        allowNull: true,
        validate: {
          isEmail: true,
        },
      },
      password: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      address: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      role: {
        type: DataTypes.ENUM("customer", "admin"),
        defaultValue: "customer",
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: "users",
      timestamps: false,
    }
  );

  Users.associate = (db) => {
    Users.hasMany(db.Orders, { foreignKey: "user_id" });
    Users.hasMany(db.Cart, { foreignKey: "user_id" });
    Users.hasOne(db.Memberships, { foreignKey: "user_id" });
  };

  return Users;
};

export default init;
