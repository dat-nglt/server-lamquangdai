import { sequelize } from "../configs/database.js";
import { DataTypes } from "sequelize";

// 1. Import tất cả các hàm định nghĩa model
import User from "./user.model.js";
import Articles from "./articles.model.js";
import Brands from "./brands.model.js";
import Categories from "./category.model.js";
import Cart from "./cart.model.js";
import Memberships from "./memberships.model.js";
import OrderDetails from "./orderDetails.model.js";
import Orders from "./orders.model.js";
import Products from "./products.model.js";
import Promotions from "./promotions.model.js";
import Staff from "./staff.model.js";
import Services from "./services.model.js";

const db = {};

// 2. Gom tất cả các hàm định nghĩa vào một mảng
// Việc này giúp dễ dàng thêm/bớt model sau này
const modelDefiners = [
  User,
  Articles,
  Brands,
  Categories,
  Cart,
  Memberships,
  OrderDetails,
  Orders,
  Products,
  Promotions,
  Staff,
  Services,
];

// 3. Khởi tạo từng model và lưu vào object `db`
// Chú ý: Sử dụng `model.name` (ví dụ: 'User', 'Articles') làm key
// thay vì 'UserModel', 'ArticlesModel' để truy cập chuẩn hơn (db.User, db.Articles)
modelDefiners.forEach((modelDefiner) => {
  const model = modelDefiner(sequelize, DataTypes);
  db[model.name] = model;
});

// 4. (QUAN TRỌNG) Gọi hàm .associate() của mỗi model
// Sau khi TẤT CẢ model đã được khởi tạo, chúng ta lặp qua chúng
// và gọi hàm .associate() (nếu có) để thiết lập các mối quan hệ.
// Điều này TRÁNH được lỗi 'circular dependency'.
Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

// 5. Thêm instance `sequelize` vào object `db`
// Điều này tiện lợi khi bạn cần dùng transaction hoặc các hàm của sequelize
db.sequelize = sequelize;

// 6. Export object `db` đã hoàn chỉnh
export default db;
