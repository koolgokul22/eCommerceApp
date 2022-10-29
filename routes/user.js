const express = require("express");
const router = express.Router();

//Controllers Import
const {
  signUp,
  login,
  logout,
  forgotPassword,
  resetPassword,
  userProfile,
  updatePassword,
  updateUserProfile,

  //Admin Controllers
  adminGetAllUsers,
  adminGetUserById,
  adminUpdateUserDetails,
  adminDeleteUser,

  //Manager Controllers
  managerGetAllUsers,
} = require("../controllers/userController");

//Middlewares Import
const {
  isLoggedIn,
  isAdmin,
  isManager,
} = require("../middlewares/userMiddleware");

//User Routes
router.route("/signUp").post(signUp);
router.route("/login").post(login);
router.route("/logout").get(logout);
router.route("/forgotpassword").post(forgotPassword);
router.route("/password/reset/:token").post(resetPassword);
router.route("/userProfile").get(isLoggedIn, userProfile);
router.route("/password/update").post(isLoggedIn, updatePassword);
router.route("/userProfile/update").post(isLoggedIn, updateUserProfile);

//Admin Routes
router.route("/admin/users").get(isLoggedIn, isAdmin, adminGetAllUsers);
router
  .route("/admin/user/:id")
  .get(isLoggedIn, isAdmin, adminGetUserById)
  .put(isLoggedIn, isAdmin, adminUpdateUserDetails)
  .delete(isLoggedIn, isAdmin, adminDeleteUser);

//Manager Routes
router.route("/manager/users").get(isLoggedIn, isManager, managerGetAllUsers);

module.exports = router;
