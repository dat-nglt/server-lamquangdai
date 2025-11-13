import { DataTypes } from "sequelize";

const init = (sequelize) => {
  const ZaloTokens = sequelize.define(
    "ZaloTokens",
    {
      // Có thể dùng ID cố định hoặc UUID, nhưng vì chỉ có 1 dòng nên ID không quá quan trọng
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      access_token: {
        type: DataTypes.TEXT, // Bắt buộc TEXT vì token dài
        allowNull: false,
      },
      refresh_token: {
        type: DataTypes.TEXT, // Bắt buộc TEXT
        allowNull: false,
      },
      access_token_expires_at: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      refresh_token_expires_at: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    },
    {
      tableName: "zalo_tokens",
      timestamps: true, // Vẫn nên giữ để debug xem token cập nhật lúc nào
    }
  );

  return ZaloTokens;
};

export default init;
