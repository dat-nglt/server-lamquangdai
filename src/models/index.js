import { sequelize } from "../config/database.js";
import User from "./User.js";

const models = {
  User,
};
if (process.env.NODE_ENV === "development") {
  sequelize
    .sync({ alter: true })
    .then(() => console.log("✅ Database synced"))
    .catch(console.error);
}

export { sequelize };
export default models;
