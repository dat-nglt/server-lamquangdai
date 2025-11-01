import { v4 as uuidv4 } from "uuid";

/** @type {import('sequelize-cli').Migration} */
export const up = async (queryInterface, Sequelize) => {
  // Dùng Hướng dẫn lập trình Node.js làm nội dung mẫu
  const sampleContent = `
    <p>Trong bài viết này, chúng ta sẽ cùng nhau tìm hiểu về các khái niệm cơ bản của Node.js.</p>
    <h2>Node.js là gì?</h2>
    <p>Node.js là một nền tảng JavaScript phía máy chủ, xây dựng trên V8 JavaScript engine của Chrome.</p>
    <ul>
      <li>Không đồng bộ (Asynchronous)</li>
      <li>Phi chặn (Non-blocking I/O)</li>
      <li>Hướng sự kiện (Event-driven)</li>
    </ul>
    <p>Đây là những đặc điểm khiến Node.js trở nên cực kỳ mạnh mẽ cho các ứng dụng thời gian thực.</p>
  `;

  // Tạo 3 bài viết mẫu
  const articlesData = [
    {
      article_id: uuidv4(), // Phải tự tạo UUID vì bulkInsert không dùng defaultValue
      title: "Hướng dẫn lập trình Node.js cho người mới bắt đầu",
      content: sampleContent,
      image_url: "https://picsum.photos/seed/nodejs/800/400",
      created_at: new Date(), // Phải tự tạo ngày
      views: Math.floor(Math.random() * 1000) + 50, // 50-1050 views
    },
    {
      article_id: uuidv4(),
      title: "Sequelize ORM: Những điều cần biết khi làm việc với CSDL",
      content: sampleContent.replace(/Node.js/g, "Sequelize"), // Thay thế nội dung
      image_url: "https://picsum.photos/seed/sequelize/800/400",
      created_at: new Date(new Date().setDate(new Date().getDate() - 1)), // 1 ngày trước
      views: Math.floor(Math.random() * 2000) + 100, // 100-2100 views
    },
    {
      article_id: uuidv4(),
      title: "Top 5 Framework JavaScript phổ biến nhất 2025",
      content: sampleContent.replace(/Node.js/g, "JavaScript"), // Thay thế nội dung
      image_url: "https://picsum.photos/seed/js/800/400",
      created_at: new Date(new Date().setDate(new Date().getDate() - 2)), // 2 ngày trước
      views: Math.floor(Math.random() * 500) + 10, // 10-510 views
    },
  ];

  // Chèn dữ liệu vào bảng 'articles'
  await queryInterface.bulkInsert("articles", articlesData, {});
  console.log("✅ Seeded articles table");
};

export const down = async (queryInterface, Sequelize) => {
  // Xóa toàn bộ dữ liệu trong bảng 'articles'
  await queryInterface.bulkDelete("articles", null, {});
  console.log("❌ Emptied articles table");
};
