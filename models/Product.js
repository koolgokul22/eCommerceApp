const mongoose = require("mongoose");

const productSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please provide a product name"],
    trim: true,
    maxlength: [120, "Product name should not be more than 120 characters"],
  },
  price: {
    type: Number,
    required: [true, "Please provide product price"],
    maxlength: [6, "Product price cannot be more than 6 digits"],
  },
  description: {
    type: String,
    required: [true, "Please provdie product description"],
  },
  photos: [
    {
      id: {
        type: String,
        required: true,
      },
      secure_url: {
        type: String,
        required: true,
      },
    },
  ],
  category: {
    type: String,
    required: [
      true,
      "Please provide category from short-sleeves, long-sleeves, sweat-shirts, hoodies",
    ],
    enum: {
      values: ["shortsleeves", "longsleeves", "sweatshirts", "hoodies"],

      message:
        "Please select category only from short-sleeves, long-sleeves, sweat-shirts, hoodies",
    },
  },
  brand: {
    type: String,
    required: [true, "Please provide a brand name for product"],
  },
  stock: {
    type: Number,
    required: [true, "Please specify the stock quantity"],
  },
  ratings: {
    type: Number,
    default: 0,
  },
  numberOfReviews: {
    type: Number,
    default: 0,
  },
  reviews: [
    {
      user: {
        type: mongoose.Schema.ObjectId,
        ref: "User", //User model,
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
      rating: {
        type: Number,
        required: true,
      },
      comment: {
        type: String,
        required: true,
      },
    },
  ],
  addedBy: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now, //Don't write Date.now() , because it will be executed immediately. Just pass the reference of date.now
  },
});

module.exports = mongoose.model("Product", productSchema);
