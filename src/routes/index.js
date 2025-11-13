import routeForArticle from "./article.route.js";
import routeForBrand from "./brands.route.js";
import routeForCart from "./cart.route.js";
import routeForCategory from "./category.route.js";
import routeForMembership from "./memberships.route.js";
import routeForAdminOrder from "./admin.orders.route.js";
import routeForOrder from "./orders.route.js";
import routeForProduct from "./products.route.js";
import routeForPromotion from "./promotion.route.js";
import routeForAdminVoucher from "./admin.vouchers.route.js";
import routeForVoucher from "./vouchers.route.js";
import routeForUser from "./users.route.js";
import routeForWebhook from "./zalo.webhook.route.js";

const mainRouter = (server) => {
  server.use("/api/articles", routeForArticle);
  server.use("/api/users", routeForUser);
  server.use("/api/brands", routeForBrand);
  server.use("/api/cart", routeForCart);
  server.use("/api/categories", routeForCategory);
  server.use("/api/memberships", routeForMembership);
  server.use("/api/orders", routeForOrder);
  server.use("/api/admin/orders", routeForAdminOrder);
  server.use("/api/products", routeForProduct);
  server.use("/api/promotions", routeForPromotion);
  server.use("/api/admin/voucher", routeForAdminVoucher);
  server.use("/api/voucher", routeForVoucher);
  server.use("/zalo/webhook", routeForWebhook);
};

export default mainRouter;
