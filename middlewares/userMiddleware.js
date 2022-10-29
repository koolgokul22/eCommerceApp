const User = require("../models/User");
const BigPromise = require("./bigPromise");
const CustomerError = require("../utils/customError");
const JWT = require("jsonwebtoken");

exports.isLoggedIn = BigPromise(async (req, res, next) => {
  const token =
    req.cookies.token || req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return next(new CustomerError("Please login to access this page", 401));
  }

  //we are getting the user id from this JWT token
  //As of now , we are including only the id in the payload
  const user = await JWT.verify(token, process.env.JWT_SECRET);

  req.user = await User.findById(user.id);

  next();
});

exports.isAdmin = BigPromise(async (req, res, next) => {
  const role = req.user.role;

  if (role != "admin") {
    return next(
      new CustomerError("You are not allowed to access this resource", 403)
    );
  }

  next();
});

exports.isManager = BigPromise(async (req, res, next) => {
  const role = req.user.role;

  if (role != "manager") {
    return next(
      new CustomerError("You are not allowed to access this resource", 403)
    );
  }

  next();
});
