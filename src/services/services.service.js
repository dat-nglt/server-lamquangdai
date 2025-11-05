import db from "../models/index.js";

// Lấy tất cả dịch vụ với nhân viên đảm nhận
export const getAllServicesWithStaffService = async () => {
  try {
    const services = await db.Services.findAll({
      attributes: [
        "service_id",
        "name",
        "description",
        "base_price",
        "price_unit",
        "is_free",
        "requires_quote",
        "performance_benefit",
        "warranty_period",
        "service_type",
        "created_at",
      ],
      include: [
        {
          model: db.StaffServices,
          attributes: [
            "staff_service_id",
            "proficiency_level",
            "is_certified",
            "certification_date",
            "years_of_experience",
            "notes",
          ],
          include: [
            {
              model: db.Staff,
              attributes: [
                "staff_id",
                "name",
                "email",
                "phone",
                "specialization",
                "experience_years",
                "is_available",
                "rating",
                "address",
              ],
            },
          ],
        },
      ],
      order: [["created_at", "ASC"]],
    });

    return services;
  } catch (error) {
    throw new Error(`Lỗi khi lấy danh sách dịch vụ: ${error.message}`);
  }
};

// Lấy dịch vụ theo ID với nhân viên đảm nhận
export const getServiceByIdWithStaffService = async (serviceId) => {
  try {
    const service = await db.Services.findOne({
      where: { service_id: serviceId },
      attributes: [
        "service_id",
        "name",
        "description",
        "base_price",
        "price_unit",
        "is_free",
        "requires_quote",
        "performance_benefit",
        "warranty_period",
        "service_type",
        "created_at",
      ],
      include: [
        {
          model: db.StaffServices,
          attributes: [
            "staff_service_id",
            "proficiency_level",
            "is_certified",
            "certification_date",
            "years_of_experience",
            "notes",
          ],
          include: [
            {
              model: db.Staff,
              attributes: [
                "staff_id",
                "name",
                "email",
                "phone",
                "specialization",
                "experience_years",
                "is_available",
                "rating",
                "address",
              ],
            },
          ],
        },
      ],
    });

    if (!service) {
      throw new Error("Không tìm thấy dịch vụ");
    }

    return service;
  } catch (error) {
    throw new Error(`Lỗi khi lấy thông tin dịch vụ: ${error.message}`);
  }
};

// Lấy dịch vụ theo loại với nhân viên
export const getServicesByTypeWithStaffService = async (serviceType) => {
  try {
    const services = await db.Services.findAll({
      where: { service_type: serviceType },
      attributes: [
        "service_id",
        "name",
        "description",
        "base_price",
        "price_unit",
        "is_free",
        "requires_quote",
        "performance_benefit",
        "warranty_period",
        "service_type",
      ],
      include: [
        {
          model: db.StaffServices,
          attributes: [
            "staff_service_id",
            "proficiency_level",
            "is_certified",
            "certification_date",
          ],
          include: [
            {
              model: db.Staff,
              attributes: [
                "staff_id",
                "name",
                "specialization",
                "experience_years",
                "is_available",
                "rating",
              ],
              where: { is_available: true },
            },
          ],
        },
      ],
      order: [["name", "ASC"]],
    });

    return services;
  } catch (error) {
    throw new Error(`Lỗi khi lấy dịch vụ theo loại: ${error.message}`);
  }
};
