const express = require("express");
const router = express.Router();

//Controllers Import
const {
  sendRazorpayKey,
  sendStripeKey,
  captureRazorpayPayment,
  captureStripePayment,
} = require("../controllers/paymentController");

//Middlewares Import
const { isLoggedIn } = require("../middlewares/userMiddleware");

//RazporPay routes
router.route("/razorpayKey").get(isLoggedIn, sendRazorpayKey);
router.route("/payment/razorpay").post(isLoggedIn, captureRazorpayPayment);

//Stripe routes
router.route("/payment/stripe").post(isLoggedIn, captureStripePayment);
router.route("/stripeKey").get(isLoggedIn, sendStripeKey);

module.exports = router;
