import { Op } from "sequelize";
import { v4 as uuidv4 } from "uuid";

/** @type {import('sequelize-cli').Migration} */
export default {
  up: async (queryInterface, Sequelize) => {
    console.log("Bắt đầu seed dữ liệu tổng hợp...");
    const now = new Date();

    try {
      // ===== 1. TẠO ID TRƯỚC KHI SEED =====
      console.log("Đang tạo UUID...");

      // Services IDs
      const SERVICE_IDS = {
        INSTALL: uuidv4(),
        MAINTENANCE: uuidv4(),
        CLEANING: uuidv4(),
        CONSULTATION: uuidv4(),
      };

      // Staff IDs
      const STAFF_IDS = {
        AN: uuidv4(),
        BINH: uuidv4(),
        CUONG: uuidv4(),
        DUNG: uuidv4(),
        EM: uuidv4(),
        PHUONG: uuidv4(),
      };

      // ===== 2. SEED DỊCH VỤ =====
      console.log("Đang seed dịch vụ...");
      const servicesData = [
        {
          service_id: SERVICE_IDS.INSTALL,
          name: "Lắp đặt điều hòa",
          description:
            "Lắp đặt chuyên nghiệp theo tiêu chuẩn kỹ thuật, bảo hành dài hạn",
          base_price: null,
          price_unit: null,
          is_free: false,
          requires_quote: true,
          performance_benefit: null,
          warranty_period: "12 tháng",
          service_type: "installation",
          created_at: now,
          updated_at: now,
        },
        {
          service_id: SERVICE_IDS.MAINTENANCE,
          name: "Bảo trì, sửa chữa",
          description:
            "Bảo trì định kỳ và sửa chữa 24/7 với linh kiện chính hãng",
          base_price: null,
          price_unit: null,
          is_free: false,
          requires_quote: true,
          performance_benefit: null,
          warranty_period: "6 tháng",
          service_type: "maintenance",
          created_at: now,
          updated_at: now,
        },
        {
          service_id: SERVICE_IDS.CLEANING,
          name: "Vệ sinh điều hòa",
          description:
            "Vệ sinh chuyên sâu, tăng 30% hiệu suất, kéo dài tuổi thọ máy",
          base_price: 150000.0,
          price_unit: "VNĐ/máy",
          is_free: false,
          requires_quote: false,
          performance_benefit: "Tăng 30% hiệu suất làm lạnh",
          warranty_period: null,
          service_type: "cleaning",
          created_at: now,
          updated_at: now,
        },
        {
          service_id: SERVICE_IDS.CONSULTATION,
          name: "Tư vấn thiết kế",
          description:
            "Tư vấn hệ thống điều hòa tối ưu cho biệt thự, văn phòng, căn hộ",
          base_price: null,
          price_unit: null,
          is_free: true,
          requires_quote: false,
          performance_benefit: "Tiết kiệm 20% chi phí vận hành",
          warranty_period: null,
          service_type: "consultation",
          created_at: now,
          updated_at: now,
        },
      ];

      await queryInterface.bulkInsert("services", servicesData, {});
      console.log(`✅ Đã seed ${servicesData.length} dịch vụ.`);

      // ===== 3. SEED NHÂN VIÊN =====
      console.log("Đang seed nhân viên...");
      const staffData = [
        {
          staff_id: STAFF_IDS.AN,
          name: "Nguyễn Văn An",
          email: "nguyen.van.an@company.com",
          phone: "0912345678",
          specialization: "installation",
          experience_years: 5,
          is_available: true,
          rating: 4.8,
          created_at: now,
          updated_at: now,
        },
        {
          staff_id: STAFF_IDS.BINH,
          name: "Trần Thị Bình",
          email: "tran.thi.binh@company.com",
          phone: "0923456789",
          specialization: "maintenance",
          experience_years: 7,
          is_available: true,
          rating: 4.9,
          created_at: now,
          updated_at: now,
        },
        {
          staff_id: STAFF_IDS.CUONG,
          name: "Lê Văn Cường",
          email: "le.van.cuong@company.com",
          phone: "0934567890",
          specialization: "cleaning",
          experience_years: 3,
          is_available: true,
          rating: 4.7,
          created_at: now,
          updated_at: now,
        },
        {
          staff_id: STAFF_IDS.DUNG,
          name: "Phạm Thị Dung",
          email: "pham.thi.dung@company.com",
          phone: "0945678901",
          specialization: "consultation",
          experience_years: 8,
          is_available: true,
          rating: 4.9,
          created_at: now,
          updated_at: now,
        },
        {
          staff_id: STAFF_IDS.EM,
          name: "Hoàng Văn Em",
          email: "hoang.van.em@company.com",
          phone: "0956789012",
          specialization: "general",
          experience_years: 4,
          is_available: true,
          rating: 4.6,
          created_at: now,
          updated_at: now,
        },
        {
          staff_id: STAFF_IDS.PHUONG,
          name: "Vũ Thị Phương",
          email: "vu.thi.phuong@company.com",
          phone: "0967890123",
          specialization: "maintenance",
          experience_years: 6,
          is_available: true,
          rating: 4.8,
          created_at: now,
          updated_at: now,
        },
      ];

      await queryInterface.bulkInsert("staff", staffData, {});
      console.log(`✅ Đã seed ${staffData.length} nhân viên.`);

      // ===== 4. SEED QUAN HỆ NHÂN VIÊN - DỊCH VỤ =====
      console.log("Đang seed quan hệ nhân viên - dịch vụ...");
      const staffServicesData = [];

      // Mapping chuyên môn nhân viên với dịch vụ
      const staffSpecializations = {
        [STAFF_IDS.AN]: "installation",
        [STAFF_IDS.BINH]: "maintenance",
        [STAFF_IDS.CUONG]: "cleaning",
        [STAFF_IDS.DUNG]: "consultation",
        [STAFF_IDS.EM]: "general",
        [STAFF_IDS.PHUONG]: "maintenance",
      };

      const serviceTypes = {
        [SERVICE_IDS.INSTALL]: "installation",
        [SERVICE_IDS.MAINTENANCE]: "maintenance",
        [SERVICE_IDS.CLEANING]: "cleaning",
        [SERVICE_IDS.CONSULTATION]: "consultation",
      };

      // Tạo các cặp nhân viên - dịch vụ
      Object.entries(staffSpecializations).forEach(
        ([staffId, specialization]) => {
          Object.entries(serviceTypes).forEach(([serviceId, serviceType]) => {
            if (
              specialization === "general" ||
              specialization === serviceType
            ) {
              staffServicesData.push({
                staff_service_id: uuidv4(),
                staff_id: staffId,
                service_id: serviceId,
                proficiency_level:
                  specialization === "general" ? "intermediate" : "expert",
                is_certified: specialization !== "general",
                certification_date: specialization !== "general" ? now : null,
                created_at: now,
              });
            }
          });
        }
      );

      await queryInterface.bulkInsert("staff_services", staffServicesData, {});
      console.log(
        `✅ Đã seed ${staffServicesData.length} quan hệ nhân viên - dịch vụ.`
      );

      console.log("🎉 Seed dữ liệu tổng hợp hoàn tất thành công!");
    } catch (error) {
      console.error("❌ Lỗi khi seed dữ liệu:", error.message);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    console.log("Đang hoàn tác seed dữ liệu...");

    try {
      // Xoá theo thứ tự ngược để tránh lỗi khóa ngoại
      await queryInterface.bulkDelete("staff_services", null, {});
      console.log("✅ Đã xóa dữ liệu staff_services");

      await queryInterface.bulkDelete("staff", null, {});
      console.log("✅ Đã xóa dữ liệu staff");

      await queryInterface.bulkDelete("services", null, {});
      console.log("✅ Đã xóa dữ liệu services");

      console.log("🗑️ Đã hoàn tác toàn bộ dữ liệu seed thành công!");
    } catch (error) {
      console.error("❌ Lỗi khi hoàn tác:", error.message);
      throw error;
    }
  },
};
