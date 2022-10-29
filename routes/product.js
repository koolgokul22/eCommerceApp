const express = require("express");
const router = express.Router();

//Controllers Import
const {
  adminAddProduct,
  getProducts,
  adminGetAllProducts,
  getProductById,
  adminUpdateProduct,
  adminDeleteProduct,
  addReview,
  deleteReview,
  getReviewsByProductId,
} = require("../controllers/productController");

//Middlewares Import
const {
  isAdmin,
  isLoggedIn,
  isManager,
} = require("../middlewares/userMiddleware");

//User routes
router.route("/products").get(isLoggedIn, getProducts);
router.route("/product/:id").get(isLoggedIn, getProductById);

//not tested
router.route("/review").put(isLoggedIn, addReview); //PUT beacuse we are not adding a new product object , just updating the existing product obj
router.route("/review/:id").delete(isLoggedIn, deleteReview); //not tested
router.route("reviews/:id").get(isLoggedIn, getReviewsByProductId); //not tested

//Admin routes
router.route("/admin/product/add").post(isLoggedIn, isAdmin, adminAddProduct);
router.route("/admin/products").get(isLoggedIn, isAdmin, adminGetAllProducts);
router
  .route("/admin/product/:id")
  .put(isLoggedIn, isAdmin, adminUpdateProduct)
  .delete(isLoggedIn, isAdmin, adminDeleteProduct);

module.exports = router;
