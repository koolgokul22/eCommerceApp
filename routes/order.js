const express = require("express");
const router = express.Router();

//Controllers Import
const {
  createOrder,
  getOrderById,
  getUserOrders,
  adminGetAllOrders,
  adminUpdateOrder,
  adminDeleteOrder,
} = require("../controllers/orderController");

//Middlewares Import
const { isLoggedIn, isAdmin } = require("../middlewares/userMiddleware");

//User routes
router.route("/order/create").post(isLoggedIn, createOrder);
router.route("/order/myOrders").get(isLoggedIn, getUserOrders);
router.route("/order/:id").get(isLoggedIn, getOrderById);

//Admin routes
router.route("/admin/orders").get(isLoggedIn, isAdmin, adminGetAllOrders);
router
  .route("/admin/order/:id")
  .put(isLoggedIn, isAdmin, adminUpdateOrder)
  .delete(isLoggedIn, isAdmin, adminDeleteOrder);

module.exports = router;
