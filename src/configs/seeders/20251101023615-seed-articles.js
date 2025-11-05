/** @type {import('sequelize-cli').Migration} */
export const up = async (queryInterface, Sequelize) => {
  // Nội dung mẫu về điện lạnh
  const content1 = `
    <h2>Hệ thống VRV/VRF là gì?</h2>
    <p>VRV (Variable Refrigerant Volume) và VRF (Variable Refrigerant Flow) là những hệ thống điều hòa không khí tiên tiến nhất hiện nay, cho phép điều khiển lưu lượng môi chất lạnh đến các dàn lạnh khác nhau.</p>
    
    <h3>Ưu điểm của hệ thống VRV/VRF:</h3>
    <ul>
      <li>Tiết kiệm năng lượng lên đến 30-40% so với hệ thống thông thường</li>
      <li>Khả năng kết nối nhiều dàn lạnh với một dàn nóng</li>
      <li>Điều khiển nhiệt độ độc lập cho từng khu vực</li>
      <li>Thiết kế linh hoạt, phù hợp cho tòa nhà văn phòng, trung tâm thương mại</li>
    </ul>
    
    <h3>Ứng dụng thực tế:</h3>
    <p>Hệ thống VRV/VRF thường được sử dụng trong các tòa nhà cao tầng, khách sạn, bệnh viện và trung tâm thương mại với diện tích lớn.</p>
  `;

  const content2 = `
    <h2>Quy trình thi công hệ thống điện lạnh chuyên nghiệp</h2>
    
    <h3>Giai đoạn 1: Khảo sát và thiết kế</h3>
    <p>Đội ngũ kỹ thuật sẽ khảo sát thực tế công trình, đo đạc và tư vấn giải pháp tối ưu nhất.</p>
    
    <h3>Giai đoạn 2: Thi công lắp đặt</h3>
    <ul>
      <li>Lắp đặt dàn nóng, dàn lạnh đúng vị trí kỹ thuật</li>
      <li>Đấu nối hệ thống ống đồng, đường điện</li>
      <li>Lắp đặt hệ thống ống gió, miệng gió</li>
    </ul>
    
    <h3>Giai đoạn 3: Vận hành và bàn giao</h3>
    <p>Chạy thử hệ thống, kiểm tra các thông số kỹ thuật và hướng dẫn vận hành cho khách hàng.</p>
  `;

  const content3 = `
    <h2>Bảo trì hệ thống máy lạnh trung tâm</h2>
    
    <p>Việc bảo trì định kỳ giúp kéo dài tuổi thọ thiết bị và tiết kiệm chi phí vận hành.</p>
    
    <h3>Các công việc bảo trì định kỳ:</h3>
    <ul>
      <li>Vệ sinh dàn nóng, dàn lạnh</li>
      <li>Kiểm tra áp suất gas, bổ sung khi cần thiết</li>
      <li>Bảo dưỡng hệ thống điện, board mạch điều khiển</li>
      <li>Kiểm tra hệ thống ống dẫn, cách nhiệt</li>
      <li>Vệ sinh hoặc thay thế lọc gió</li>
    </ul>
    
    <h3>Lợi ích của bảo trì định kỳ:</h3>
    <ul>
      <li>Tiết kiệm 15-20% điện năng tiêu thụ</li>
      <li>Giảm thiểu sự cố hỏng hóc đột xuất</li>
      <li>Đảm bảo chất lượng không khí trong nhà</li>
      <li>Tăng tuổi thọ thiết bị lên 30-40%</li>
    </ul>
  `;

  const content4 = `
    <h2>Xu hướng điện lạnh 2025: Công nghệ Inverter và IoT</h2>
    
    <p>Ngành điện lạnh đang phát triển mạnh mẽ với sự tích hợp của công nghệ số và trí tuệ nhân tạo.</p>
    
    <h3>Công nghệ Inverter:</h3>
    <p>Cho phép máy nén hoạt động linh hoạt, tiết kiệm điện năng và duy trì nhiệt độ ổn định.</p>
    
    <h3>IoT trong điện lạnh:</h3>
    <ul>
      <li>Điều khiển từ xa qua smartphone</li>
      <li>Giám sát và cảnh báo tự động</li>
      <li>Tích hợp với smart home</li>
      <li>Theo dõi tiêu thụ năng lượng thời gian thực</li>
    </ul>
    
    <h3>Gas thân thiện môi trường:</h3>
    <p>Các loại gas R32, R290 đang dần thay thế gas R22 với chỉ số GWP thấp hơn, ít ảnh hưởng đến môi trường.</p>
  `;

  const content5 = `
    <h2>Lựa chọn công suất máy lạnh phù hợp</h2>
    
    <p>Việc chọn công suất máy lạnh phù hợp với diện tích phòng là yếu tố quan trọng để đạt hiệu quả làm lạnh tối ưu.</p>
    
    <h3>Công thức tính công suất cơ bản:</h3>
    <p><strong>Công suất (BTU) = Diện tích phòng (m²) × 600 BTU</strong></p>
    
    <h3>Bảng tham khảo:</h3>
    <table border="1">
      <tr>
        <th>Diện tích phòng</th>
        <th>Công suất khuyến nghị</th>
        <th>Loại máy phù hợp</th>
      </tr>
      <tr>
        <td>15 m²</td>
        <td>9,000 BTU</td>
        <td>Máy lạnh 1 HP</td>
      </tr>
      <tr>
        <td>20-25 m²</td>
        <td>12,000 BTU</td>
        <td>Máy lạnh 1.5 HP</td>
      </tr>
      <tr>
        <td>30-35 m²</td>
        <td>18,000 BTU</td>
        <td>Máy lạnh 2 HP</td>
      </tr>
      <tr>
        <td>40-45 m²</td>
        <td>24,000 BTU</td>
        <td>Máy lạnh 2.5 HP</td>
      </tr>
    </table>
    
    <h3>Yếu tố ảnh hưởng khác:</h3>
    <ul>
      <li>Số lượng người trong phòng</li>
      <li>Hướng nắng, vật liệu xây dựng</li>
      <li>Thiết bị tỏa nhiệt trong phòng</li>
      <li>Số lượng cửa sổ</li>
    </ul>
  `;

  // Tạo 5 bài viết mẫu về điện lạnh - ĐÚNG với cấu trúc model
  const articlesData = [
    {
      // article_id sẽ tự động tăng
      title:
        "Hệ thống VRV VRF: Giải pháp điều hòa tối ưu cho tòa nhà thương mại",
      excerpt:
        "Khám phá công nghệ VRV/VRF - hệ thống điều hòa tiên tiến giúp tiết kiệm năng lượng và linh hoạt trong thiết kế.",
      content: content1,
      image_url: "https://picsum.photos/seed/vrv-system/800/400", // Đúng tên trường trong model
      category: "Hệ thống VRV/VRF",
      read_time: "8 phút đọc",
      featured: true,
      published_at: new Date(),
      views: Math.floor(Math.random() * 1500) + 200,
      created_at: new Date(), // Thêm created_at
      updated_at: new Date(), // Thêm updated_at
    },
    {
      title: "Quy trình thi công hệ thống điện lạnh chuyên nghiệp từ A-Z",
      excerpt:
        "Hướng dẫn chi tiết quy trình thi công hệ thống điện lạnh đạt chuẩn kỹ thuật và an toàn.",
      content: content2,
      image_url: "https://picsum.photos/seed/installation/800/400",
      category: "Thi công lắp đặt",
      read_time: "10 phút đọc",
      featured: true,
      published_at: new Date(new Date().setDate(new Date().getDate() - 1)),
      views: Math.floor(Math.random() * 1200) + 150,
      created_at: new Date(new Date().setDate(new Date().getDate() - 1)),
      updated_at: new Date(new Date().setDate(new Date().getDate() - 1)),
    },
    {
      title: "Bảo trì hệ thống máy lạnh: Hướng dẫn định kỳ và lợi ích",
      excerpt:
        "Tại sao cần bảo trì định kỳ và các bước thực hiện bảo dưỡng hệ thống máy lạnh chuyên nghiệp.",
      content: content3,
      image_url: "https://picsum.photos/seed/maintenance/800/400",
      category: "Bảo trì - Sửa chữa",
      read_time: "7 phút đọc",
      featured: false,
      published_at: new Date(new Date().setDate(new Date().getDate() - 2)),
      views: Math.floor(Math.random() * 1800) + 300,
      created_at: new Date(new Date().setDate(new Date().getDate() - 2)),
      updated_at: new Date(new Date().setDate(new Date().getDate() - 2)),
    },
    {
      title: "Xu hướng điện lạnh 2025: Công nghệ Inverter và IoT thống trị",
      excerpt:
        "Cập nhật những xu hướng công nghệ mới nhất trong ngành điện lạnh và điều hòa không khí.",
      content: content4,
      image_url: "https://picsum.photos/seed/trend2025/800/400",
      category: "Công nghệ mới",
      read_time: "6 phút đọc",
      featured: false,
      published_at: new Date(new Date().setDate(new Date().getDate() - 3)),
      views: Math.floor(Math.random() * 2000) + 400,
      created_at: new Date(new Date().setDate(new Date().getDate() - 3)),
      updated_at: new Date(new Date().setDate(new Date().getDate() - 3)),
    },
    {
      title: "Hướng dẫn chọn công suất máy lạnh phù hợp theo diện tích phòng",
      excerpt:
        "Bí quyết lựa chọn công suất máy lạnh chính xác để tiết kiệm điện và đạt hiệu quả làm lạnh tốt nhất.",
      content: content5,
      image_url: "https://picsum.photos/seed/capacity/800/400",
      category: "Tư vấn kỹ thuật",
      read_time: "5 phút đọc",
      featured: false,
      published_at: new Date(new Date().setDate(new Date().getDate() - 4)),
      views: Math.floor(Math.random() * 2500) + 500,
      created_at: new Date(new Date().setDate(new Date().getDate() - 4)),
      updated_at: new Date(new Date().setDate(new Date().getDate() - 4)),
    },
  ];

  // Chèn dữ liệu vào bảng 'articles'
  await queryInterface.bulkInsert("articles", articlesData, {});
  console.log("✅ Seeded articles table with HVAC content - CORRECTED FIELDS");
};

export const down = async (queryInterface, Sequelize) => {
  // Xóa toàn bộ dữ liệu trong bảng 'articles'
  await queryInterface.bulkDelete("articles", null, {});
  console.log("❌ Emptied articles table");
};
