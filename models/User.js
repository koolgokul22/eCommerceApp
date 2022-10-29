const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const userSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please provide a name"],
    maxlength: [40, "Name should be less than 40 characters"],
  },
  email: {
    type: String,
    required: [true, "Please provide an email"],
    validate: [validator.isEmail, "Please enter a valid email"],
    unique: true,
  },
  password: {
    type: String,
    required: [true, "Please provide a password"],
    minlength: [8, "Password should be atleast 6 characters"],
    select: false,
  },
  role: {
    type: String,
    default: "user",
  },
  photo: {
    id: {
      type: String,
      required: true,
    },
    secure_url: {
      type: String,
      required: true,
    },
  },
  forgotPasswordToken: String,
  forgotPasswordExpiry: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

//encrypt the password before saving to DB - HOOKS
//we are using pre hook here
//pre hook does not accept arrow functions
userSchema.pre("save", async function (next) {
  //'this' can be used to access all the properties of schema

  //if password is not modified , then don't do anything and return next()
  if (!this.isModified("password")) {
    return next();
  }
  this.password = await bcrypt.hash(this.password, 10);
});

//compares the password with the user password and saved password
userSchema.methods.comparePassword = async function (userPassword) {
  return await bcrypt.compare(userPassword, this.password);
};

//create and return jwt tokens
userSchema.methods.getJWTToken = async function () {
  return await jwt.sign(
    {
      id: this._id,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRY,
    }
  );
};

//generate forgot password token
userSchema.methods.getForgotPasswordToken = async function () {
  //generate a long random string
  const forgotToken = await crypto.randomBytes(20).toString("hex");

  //getting a hash and storing it in DB - make sure to get the hash on backend and compare
  this.forgotPasswordToken = crypto
    .createHash("sha256")
    .update(forgotToken)
    .digest("hex");

  //time of token
  this.forgotPasswordExpiry =
    Date.now() + process.env.FORGOT_PASSWORD_TOKEN_EXPIRY_DURATION * 60 * 1000; // 10 mins validity

  return forgotToken;
};

module.exports = mongoose.model("User", userSchema);
