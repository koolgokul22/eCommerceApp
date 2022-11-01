const User = require("../models/User");
const BigPromise = require("../middlewares/bigPromise");
const CustomError = require("../utils/customError");
const cookieToken = require("../utils/cookieToken");
const emailSender = require("../utils/emailSender");
const cloudinary = require("cloudinary").v2;
const crypto = require("crypto");

//User Controllers
exports.signUp = BigPromise(async (req, res, next) => {
  let photoUploadResponse;
  if (!req.files) {
    return next(new CustomError("Please provide a profile photo", 400));
  }

  const file = req.files.profilePicture; //In frontend the input field (variable)  name should be profilePicture
  photoUploadResponse = await cloudinary.uploader.upload(file.tempFilePath, {
    folder: "users",
    width: 150,
    crop: "scale",
  });

  const { name, email, password } = req.body;

  if (!email) {
    return next(new CustomError("Email is required", 400));
  }
  if (!name) {
    return next(new CustomError("Name is required", 400));
  }
  if (!password) {
    return next(new CustomError("Password is required", 400));
  }

  const user = await User.create({
    name,
    email,
    password,
    photo: {
      id: photoUploadResponse.public_id,
      secure_url: photoUploadResponse.secure_url,
    },
  });

  cookieToken(user, res);
});

exports.login = BigPromise(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email) {
    return next(new CustomError("Email is required", 400));
  }

  if (!password) {
    return next(new CustomError("Password is required", 400));
  }

  const user = await User.findOne({ email }).select("+password"); //In model, we have omitted password. Now we want passowrd field also . SO selecr("+password")

  if (!user) {
    return next(
      new CustomError("User does not exist. Please check your email", 400)
    );
  }

  const isPasswordMatch = await user.comparePassword(password);
  if (!isPasswordMatch) {
    return next(
      new CustomError(
        "Password does not match. Please check your password",
        400
      )
    );
  }
  cookieToken(user, res);
});

exports.logout = BigPromise(async (req, res, next) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
});

exports.forgotPassword = BigPromise(async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return next(new CustomError("Email is required", 400));
  }

  const user = await User.findOne({ email });

  if (!user) {
    return next(new CustomError("Email does not exist", 400));
  }

  const forgotPasswordToken = await user.getForgotPasswordToken();

  await user.save({ validateBeforeSave: false });

  const forgotPasswordUrl = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/password/reset/${forgotPasswordToken}`;

  const message = `Copy paste this link in your browser
 \n \n 
 ${forgotPasswordUrl}`;

  try {
    await emailSender({
      receiver: user.email,
      subject: "E-Commerce App - forgot password",
      messageBody: message,
    });

    res.status(200).json({
      success: true,
      message: "Email sent successfully",
    });
  } catch (error) {
    user.forgotPasswordToken = undefined;
    user.forgotPasswordExpiry = undefined;

    await user.save({ validateBeforeSave: false });

    return next(new CustomError(error.message, 500));
  }
});

exports.resetPassword = BigPromise(async (req, res, next) => {
  const token = req.params.token;

  const encryptedToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  const user = await User.findOne({
    encryptedToken,
    forgotPasswordExpiry: { $gt: Date.now() },
  });

  if (!user) {
    return next(new CustomError("Invalid token or token expired"), 400);
  }

  if (req.body.password !== req.body.confirmPassword) {
    return next(new CustomError("Passwords don't match", 400));
  }

  user.password = req.body.password;

  user.forgotPasswordExpiry = undefined;
  user.forgotPasswordToken = undefined;

  await user.save();

  //send a JSON response or JWTtoken

  cookieToken(user, res);
});

exports.userProfile = BigPromise(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  res.status(200).json({
    success: true,
    user,
  });
});

exports.updatePassword = BigPromise(async (req, res, next) => {
  if (!req.body.oldPassword || !req.body.newPassword) {
    return next(
      new CustomError("Please enter old password and new Password", 400)
    );
  }
  const userId = req.user.id;
  const user = await User.findById(userId).select("+password");

  if (!user) {
    return next(new CustomError("User does not exist"), 500);
  }

  // User will be sending old password, new password in req body
  const isPasswordMatch = await user.comparePassword(req.body.oldPassword);

  if (!isPasswordMatch) {
    return next(new CustomError("Old password is incorrect", 400));
  }

  user.password = req.body.newPassword;
  await user.save();

  //send the new token
  cookieToken(user, res);
});

exports.updateUserProfile = BigPromise(async (req, res, next) => {
  const newData = {
    name: req.body.name,
    email: req.body.email,
  };
  const userId = req.user.id;

  if (req.files) {
    const user = await User.findById(userId);
    const imageId = user.photo.id;

    //deleted image response
    const deletedImage = await cloudinary.uploader.destroy(imageId);

    //uploading the new photo
    const uploadedImage = await cloudinary.uploader.upload(
      req.files.photo.tempFilePath,
      {
        folder: "users",
        width: 150,
        crop: "scale",
      }
    );

    newData.photo = {
      id: uploadedImage.public_id,
      secure_url: uploadedImage.secure_url,
    };
  }

  const user = await User.findByIdAndUpdate(userId, newData, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({
    success: true,
  });
});

//Admin Controllers (can only be used by admins)
//prefixed with 'admin'
exports.adminGetAllUsers = BigPromise(async (req, res, next) => {
  const users = await User.find({}); //users[] returns all the users in the DB

  res.status(200).json({
    success: true,
    users,
  });
});

exports.adminGetUserById = BigPromise(async (req, res, next) => {
  const userId = req.params.id;

  const user = await User.findById(userId);

  if (!user) {
    return next(new CustomError("User does not exist!", 400));
  }
  res.status(200).json({
    success: true,
    user,
  });
});

//main purpose of this controller is to change the role of the user
exports.adminUpdateUserDetails = BigPromise(async (req, res, next) => {
  const userId = req.params.id;
  const newData = {
    name: req.body.name,
    email: req.body.email,
    role: req.body.role,
  };

  const user = await User.findByIdAndUpdate(userId, newData, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({
    success: true,
  });
});

//delete data from DB and photo from Cloudinary
exports.adminDeleteUser = BigPromise(async (req, res, next) => {
  const userId = req.param.id;

  const user = await User.findById(userId);
  if (!user) {
    return next(new CustomError("User does not exist", 400));
  }

  const photoId = user.photo.id;
  await cloudinary.uploader.destroy(photoId);

  console.log(await user.remove());

  res.status(200).json({
    success: true,
  });
});
//Manager Controllers (can only be used by managers)
//prefixed with 'manager'
exports.managerGetAllUsers = BigPromise(async (req, res, next) => {
  const users = await User.find({ role: "user" }, { name: 1, email: 1 });

  res.status(200).json({
    success: true,
    users,
  });
});
