import { getAllServicesWithStaffService, getServiceByIdWithStaffService, getServicesByTypeWithStaffService } from "../services/services.service.js";

// Lấy tất cả dịch vụ với nhân viên
export const getAllServicesWithStaffController = async (req, res) => {
  try {
    console.log("🔄 Đang lấy danh sách dịch vụ với nhân viên...");

    const services = await getAllServicesWithStaffService();

    // Format dữ liệu response
    const formattedServices = services.map((service) => {
      const serviceData = service.toJSON();

      return {
        id: serviceData.service_id,
        ten_dich_vu: serviceData.name,
        mo_ta: serviceData.description,
        gia_co_ban: serviceData.base_price,
        don_vi_tinh: serviceData.price_unit,
        mien_phi: serviceData.is_free,
        can_bao_gia: serviceData.requires_quote,
        loi_ich_hieu_suat: serviceData.performance_benefit,
        thoi_gian_bao_hanh: serviceData.warranty_period,
        loai_dich_vu: serviceData.service_type,
        nhan_vien_dam_nhan: serviceData.StaffServices.map((staffService) => ({
          id_nhan_vien: staffService.Staff.staff_id,
          ten_nhan_vien: staffService.Staff.name,
          email: staffService.Staff.email,
          so_dien_thoai: staffService.Staff.phone,
          chuyen_mon: staffService.Staff.specialization,
          so_nam_kinh_nghiem: staffService.Staff.experience_years,
          kha_dung: staffService.Staff.is_available,
          danh_gia: staffService.Staff.rating,
          dia_chi: staffService.Staff.address,
          muc_do_thanh_thao: staffService.proficiency_level,
          da_chung_nhan: staffService.is_certified,
          ngay_chung_nhan: staffService.certification_date,
          so_nam_kinh_nghiem_dich_vu: staffService.years_of_experience,
          ghi_chu: staffService.notes,
        })),
        tong_so_nhan_vien: serviceData.StaffServices.length,
      };
    });

    res.status(200).json({
      success: true,
      message: `Lấy danh sách ${formattedServices.length} dịch vụ thành công`,
      data: formattedServices,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Lỗi controller:", error.message);
    res.status(500).json({
      success: false,
      message: error.message,
      data: null,
      timestamp: new Date().toISOString(),
    });
  }
};

// Lấy chi tiết dịch vụ theo ID
export const getServiceDetailController = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🔄 Đang lấy chi tiết dịch vụ ID: ${id}`);

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Thiếu ID dịch vụ",
        data: null,
      });
    }

    const service = await getServiceByIdWithStaffService(id);
    const serviceData = service.toJSON();

    // Format response
    const formattedService = {
      id: serviceData.service_id,
      ten_dich_vu: serviceData.name,
      mo_ta: serviceData.description,
      gia_co_ban: serviceData.base_price,
      don_vi_tinh: serviceData.price_unit,
      mien_phi: serviceData.is_free,
      can_bao_gia: serviceData.requires_quote,
      loi_ich_hieu_suat: serviceData.performance_benefit,
      thoi_gian_bao_hanh: serviceData.warranty_period,
      loai_dich_vu: serviceData.service_type,
      ngay_tao: serviceData.created_at,
      nhan_vien_dam_nhan: serviceData.StaffServices.map((staffService) => ({
        id_nhan_vien: staffService.Staff.staff_id,
        ten_nhan_vien: staffService.Staff.name,
        email: staffService.Staff.email,
        so_dien_thoai: staffService.Staff.phone,
        chuyen_mon: staffService.Staff.specialization,
        so_nam_kinh_nghiem: staffService.Staff.experience_years,
        kha_dung: staffService.Staff.is_available,
        danh_gia: staffService.Staff.rating,
        dia_chi: staffService.Staff.address,
        muc_do_thanh_thao: staffService.proficiency_level,
        da_chung_nhan: staffService.is_certified,
        ngay_chung_nhan: staffService.certification_date,
        so_nam_kinh_nghiem_dich_vu: staffService.years_of_experience,
        ghi_chu: staffService.notes,
      })),
      thong_ke: {
        tong_so_nhan_vien: serviceData.StaffServices.length,
        so_nhan_vien_chuyen_sau: serviceData.StaffServices.filter(
          (ss) => ss.proficiency_level === "chuyen_sau"
        ).length,
        so_nhan_vien_da_chung_nhan: serviceData.StaffServices.filter(
          (ss) => ss.is_certified
        ).length,
      },
    };

    res.status(200).json({
      success: true,
      message: "Lấy thông tin dịch vụ thành công",
      data: formattedService,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Lỗi controller:", error.message);

    if (error.message === "Không tìm thấy dịch vụ") {
      return res.status(404).json({
        success: false,
        message: error.message,
        data: null,
      });
    }

    res.status(500).json({
      success: false,
      message: error.message,
      data: null,
    });
  }
};

// Lấy dịch vụ theo loại
export const getServicesByTypeController = async (req, res) => {
  try {
    const { type } = req.params;
    console.log(`🔄 Đang lấy dịch vụ loại: ${type}`);

    const validTypes = [
      "installation",
      "maintenance",
      "cleaning",
      "consultation",
    ];
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message:
          "Loại dịch vụ không hợp lệ. Các loại hợp lệ: installation, maintenance, cleaning, consultation",
        data: null,
      });
    }

    const services = await getServicesByTypeWithStaffService(type);

    const formattedServices = services.map((service) => {
      const serviceData = service.toJSON();
      return {
        id: serviceData.service_id,
        ten_dich_vu: serviceData.name,
        mo_ta: serviceData.description,
        gia_co_ban: serviceData.base_price,
        don_vi_tinh: serviceData.price_unit,
        mien_phi: serviceData.is_free,
        nhan_vien_kha_dung: serviceData.StaffServices.filter(
          (ss) => ss.Staff.is_available
        ).map((ss) => ({
          id_nhan_vien: ss.Staff.staff_id,
          ten_nhan_vien: ss.Staff.name,
          chuyen_mon: ss.Staff.specialization,
          kinh_nghiem: ss.Staff.experience_years,
          danh_gia: ss.Staff.rating,
          muc_do_thanh_thao: ss.proficiency_level,
        })),
      };
    });

    res.status(200).json({
      success: true,
      message: `Lấy ${formattedServices.length} dịch vụ loại ${type} thành công`,
      data: formattedServices,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Lỗi controller:", error.message);
    res.status(500).json({
      success: false,
      message: error.message,
      data: null,
    });
  }
};
