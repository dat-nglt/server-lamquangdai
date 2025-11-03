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
      zalo_id: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: "ID người dùng từ Zalo Mini App",
      },
      full_name: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      phone: {
        type: DataTypes.STRING(15),
        allowNull: true,
        validate: {
          is: /^[0-9+\-() ]+$/, // Kiểm tra định dạng số điện thoại
        },
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
        allowNull: true, // Cho phép null (user login qua Zalo)
      },
      address: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      avatar: {
        type: DataTypes.STRING(500),
        allowNull: true,
        comment: "URL avatar từ Zalo hoặc upload",
      },
      gender: {
        type: DataTypes.ENUM("male", "female", "other"),
        allowNull: true,
      },
      date_of_birth: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      role: {
        type: DataTypes.ENUM("customer", "admin"),
        defaultValue: "customer",
      },
      is_followed_oa: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        comment: "Trạng thái quan tâm Official Account",
      },
      last_login: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      login_method: {
        type: DataTypes.ENUM("zalo", "email", "phone"),
        defaultValue: "zalo",
      },
      zalo_user_info: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: "Lưu thông tin nguyên bản từ Zalo API",
      },
      status: {
        type: DataTypes.ENUM("active", "inactive", "banned"),
        defaultValue: "active",
      },
      email_verified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      phone_verified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
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
      tableName: "users",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      indexes: [
        { unique: true, fields: ["zalo_id"], name: "users_zalo_id_unique_idx" },
        { unique: true, fields: ["phone"], name: "users_phone_unique_idx" },
        { unique: true, fields: ["email"], name: "users_email_unique_idx" },
        { fields: ["role"], name: "users_role_idx" },
        { fields: ["status"], name: "users_status_idx" },
        { fields: ["is_followed_oa"], name: "users_is_followed_oa_idx" },
      ],
      comment: "Bảng lưu thông tin người dùng (Zalo + Email/Phone)",
    }
  );

  // 🧭 Associations
  Users.associate = (db) => {
    Users.hasMany(db.Orders, {
      foreignKey: "user_id",
      as: "orders",
    });
    Users.hasMany(db.Cart, {
      foreignKey: "user_id",
      as: "cart_items",
    });
    Users.hasOne(db.Memberships, {
      foreignKey: "user_id",
      as: "membership",
    });
  };

  // 🪄 Hook: tự động tạo membership sau khi tạo user
  Users.afterCreate(async (user) => {
    const { Memberships } = user.sequelize.models;
    try {
      await Memberships.create({
        user_id: user.user_id,
        points: 0,
        level: "bronze",
      });
    } catch (error) {
      console.error("⚠️ Failed to create membership for user:", error.message);
    }
  });

  return Users;
};

export default init;
