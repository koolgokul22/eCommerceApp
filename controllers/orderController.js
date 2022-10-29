const BigPromise = require("../middlewares/bigPromise");
const { findById } = require("../models/Order");
const Order = require("../models/Order");
const Product = require("../models/Product");
const CustomError = require("../utils/customError");

//User Controllers
exports.createOrder = BigPromise(async (req, res, next) => {
  const {
    shippingInfo,
    orderItems,
    paymentInfo,
    taxAmount,
    shippingAmount,
    totalAmount,
  } = req.body;

  const orderRes = await Order.create({
    orderItems,
    shippingAmount,
    shippingInfo,
    paymentInfo,
    taxAmount,
    totalAmount,
    user: req.user._id,
  });

  res.status(200).json({
    success: true,
    orderRes,
  });
});

exports.getOrderById = BigPromise(async (req, res, next) => {
  const order = Order.findById(req.params.id).populate("user", "name email"); // populate(param1, param2) -> param-1 which property of model is to be populated , param-2 space-separated properties to be displayed

  if (!order) {
    return next(new CustomError("Order not found!", 401));
  }

  res.status(200).json({
    success: true,
    order,
  });
});

exports.getUserOrders = BigPromise(async (req, res, next) => {
  const orders = await Order.find({ user: req.user._id });

  res.status(200).json({
    success: true,
    orders,
  });
});

//Admin Controllers
exports.adminGetAllOrders = BigPromise(async (req, res, next) => {
  const orders = await Order.find();

  res.status(200).json({
    success: true,
    orders,
  });
});

exports.adminUpdateOrder = BigPromise(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (order.orderStatus === "Delivered") {
    return next(new CustomError("Order is already marked for delivered", 401));
  }

  order.orderStatus = req.body.orderStatus;

  order.orderItems.forEach(async (item) => {
    await _updateProductStock(item.product, item.quantity);
  });

  await Order.save();

  res.status(200).json({
    success: true,
  });
});

exports.adminDeleteOrder = BigPromise(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  await order.remove;

  res.status(200).json({
    success: true,
  });
});

async function _updateProductStock(productId, quantity) {
  const product = await Product.findById(productId);

  product.stock = product.stock - quantity;

  await product.save({ validateBeforeSave: false });
}
