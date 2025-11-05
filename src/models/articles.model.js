import { DataTypes } from "sequelize";

const init = (sequelize) => {
  const Articles = sequelize.define(
    "Articles",
    {
      // 1. Thay đổi từ UUID sang INTEGER Auto Increment
      article_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      title: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      // 2. Thêm 'excerpt' từ sample
      excerpt: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      // 3. Đổi tên 'image_url' -> 'image' và dùng TEXT
      image_url: {
        type: DataTypes.TEXT, // Dùng TEXT để chứa URL dài như trong sample
        allowNull: true,
      },
      // 4. Thêm 'category' từ sample
      category: {
        type: DataTypes.STRING(100),
        allowNull: true, // Có thể cho phép null nếu bài viết chưa phân loại
      },
      // 5. Thêm 'read_time' (chuyển từ readTime)
      read_time: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      // 6. Thêm 'featured' từ sample
      featured: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      // 7. Thêm 'published_at' (từ 'date' trong sample)
      published_at: {
        type: DataTypes.DATE,
        allowNull: true, // Cho phép null (lưu làm bản nháp)
      },
      // Vẫn giữ lại 'views'
      views: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      // created_at và updated_at sẽ được Sequelize tự động quản lý
    },
    {
      tableName: "articles",
      // 8. Bật timestamps (tự động thêm created_at, updated_at)
      timestamps: true,
      // Đổi tên 'readTime' (JS) -> 'read_time' (DB)
      underscored: true, // Tự động chuyển camelCase (vd: readTime) sang snake_case (vd: read_time) trong DB
    }
  );

  return Articles;
};

export default init;
