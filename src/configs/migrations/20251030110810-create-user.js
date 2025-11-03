"use strict";

/** @type {import('sequelize-cli').Migration} */
export const up = async (queryInterface, Sequelize) => {
  await queryInterface.createTable("users", {
    user_id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    zalo_id: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    full_name: {
      type: Sequelize.STRING(100),
      allowNull: false,
    },
    phone: {
      type: Sequelize.STRING(15),
      allowNull: true,
    },
    email: {
      type: Sequelize.STRING(100),
      allowNull: true,
    },
    password: {
      type: Sequelize.STRING(255),
      allowNull: true,
    },
    address: {
      type: Sequelize.TEXT,
      allowNull: true,
    },
    avatar: {
      type: Sequelize.STRING(500),
      allowNull: true,
    },
    gender: {
      type: Sequelize.ENUM("male", "female", "other"),
      allowNull: true,
    },
    date_of_birth: {
      type: Sequelize.DATE,
      allowNull: true,
    },
    role: {
      type: Sequelize.ENUM("customer", "admin"),
      defaultValue: "customer",
    },
    is_followed_oa: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    },
    last_login: {
      type: Sequelize.DATE,
      allowNull: true,
    },
    login_method: {
      type: Sequelize.ENUM("zalo", "email", "phone"),
      defaultValue: "zalo",
    },
    zalo_user_info: {
      type: Sequelize.JSON,
      allowNull: true,
    },
    status: {
      type: Sequelize.ENUM("active", "inactive", "banned"),
      defaultValue: "active",
    },
    email_verified: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    },
    phone_verified: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    },
    created_at: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW,
      allowNull: false,
    },
    updated_at: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW,
      allowNull: false,
    },
  });

  // ✅ Thêm index UNIQUE
  await queryInterface.addIndex("users", ["zalo_id"], {
    unique: true,
    name: "users_zalo_id_unique_idx",
  });

  await queryInterface.addIndex("users", ["phone"], {
    unique: true,
    name: "users_phone_unique_idx",
  });

  await queryInterface.addIndex("users", ["email"], {
    unique: true,
    name: "users_email_unique_idx",
  });

  // ✅ Index không unique
  await queryInterface.addIndex("users", ["role"], {
    name: "users_role_idx",
  });

  await queryInterface.addIndex("users", ["status"], {
    name: "users_status_idx",
  });

  await queryInterface.addIndex("users", ["is_followed_oa"], {
    name: "users_is_followed_oa_idx",
  });
};

export const down = async (queryInterface, Sequelize) => {
  await queryInterface.dropTable("users");
  await queryInterface.sequelize.query(
    'DROP TYPE IF EXISTS "enum_users_gender";'
  );
  await queryInterface.sequelize.query(
    'DROP TYPE IF EXISTS "enum_users_role";'
  );
  await queryInterface.sequelize.query(
    'DROP TYPE IF EXISTS "enum_users_login_method";'
  );
  await queryInterface.sequelize.query(
    'DROP TYPE IF EXISTS "enum_users_status";'
  );
};
