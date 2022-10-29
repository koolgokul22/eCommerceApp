const Product = require("../models/Product");
const cloudinary = require("cloudinary").v2;
const CustomError = require("../utils/customError");
const BigPromise = require("../middlewares/bigPromise");
const WhereClause = require("../utils/whereClause");

//User Controllers
exports.getProducts = BigPromise(async (req, res, next) => {
  const resultsPerPage = 6;
  const totalProductsCount = await Product.countDocuments(); //returns the count of all the products
  const productsObj = new WhereClause(Product.find(), req.query)
    .search()
    .filter(); //First search(get all the products) , then limit, filter the number of items
  let products = await productsObj.base;
  const filteredProductsCount = products.length;

  productsObj.paginator(resultsPerPage);

  products = await productsObj.base.clone();

  res.status(200).json({
    success: true,
    products,
    totalProductsCount,
    filteredProductsCount,
  });
});

exports.getProductById = BigPromise(async (req, res, next) => {
  const productId = req.params.id;
  const product = await Product.findById(productId);

  if (!product) {
    return next(new CustomError("Product not found", 400));
  }

  res.status(200).json({
    success: true,
    product,
  });
});

exports.addReview = BigPromise(async (req, res, next) => {
  const { rating, comment, productId } = req.body;

  const review = {
    user: req.user._id,
    name: req.user.name,
    rating: Number(rating),
    comment,
  };

  const product = await Product.findById(productId);

  const isAlreadyReviewed = product.reviews.find(
    (review) => review.user.toString() === req.user._id.toString() // WHY toString() -> because ID is an BSON object
  );

  if (isAlreadyReviewed) {
    product.reviews.forEach((review) => {
      if (review.user.toString() === req.user._id.toString()) {
        review.comment = comment;
        review.rating = rating;
      }
    });
  } else {
    //simply push the review to reviews array
    product.reviews.push(review);
    product.numberOfReviews = product.reviews.length;
  }

  //adjust ratings
  product.ratings =
    product.reviews.reduce((acc, item) => item.rating + acc, 0) /
    product.reviews.length;

  await product.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
  });
});

exports.deleteReview = BigPromise(async (req, res, next) => {
  const { prodId } = req.params.id;

  const product = await Product.findById(prodId);

  const reviews = product.reviews.filter(
    (review) => review.user.toString() === req.user_id.toString()
  );

  //adjust the ratings
  const noOfReviews = reviews.length;

  product.ratings =
    reviews.reduce((acc, item) => item.rating + acc, 0) / noOfReviews;

  await Product.findByIdAndUpdate(
    prodId,
    {
      reviews,
      ratings: product.ratings,
      numberOfReviews: numberOfReviews,
    },
    {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    }
  );

  res.status(200).json({
    success: true,
  });
});

exports.getReviewsByProductId = BigPromise(async (req, res, next) => {
  const { prodId } = req.params.id;

  const product = await Product.findById(prodId);

  //handle product == null or not present

  res.status(200).json({
    success: true,
    reviews: product.reviews,
  });
});

//Admin Controllers
exports.adminAddProduct = BigPromise(async (req, res, next) => {
  if (!req.files) {
    return next(new CustomError("Please upload product images", 400));
  }

  let productImages = []; //saving the product photos object in the array to save it to DB
  if (req.files) {
    let photos = req.files.productPhotos; //reference for the photos coming from the frontend (request body)
    if (
      typeof photos === "object" &&
      photos !== null &&
      !Array.isArray(photos)
    ) {
      photos = [photos]; //converting the object type to array type to iterate through for loop
    }

    //input field name (in fronted) should be passed as productPhotos
    for (let i = 0; i < photos.length; i++) {
      const uploadResponse = await cloudinary.uploader.upload(
        //frontend will handle all the compressions and resizings of images(otherwise add compressions and resizing config here)
        photos[i].tempFilePath,
        {
          folder: "Products", //put this inside env file to make it consistent
        }
      );

      productImages.push({
        id: uploadResponse.public_id,
        secure_url: uploadResponse.secure_url,
      });
    }

    req.body.photos = productImages;
    req.body.addedBy = req.user;

    const productRes = await Product.create(req.body);

    res.status(200).json({
      success: true,
      productRes,
    });
  }
});

exports.adminGetAllProducts = BigPromise(async (req, res, next) => {
  const products = await Product.find();

  res.status(200).json({
    success: true,
    products,
  });
});

exports.adminUpdateProduct = BigPromise(async (req, res, next) => {
  const productId = req.params.id;
  const product = await Product.findById(productId);

  if (!product) {
    return next(new CustomError("Product not found", 400));
  }

  let productImages = [];
  if (req.files) {
    /*
    1. Get the product id and delete it from cloudinary 
    2. Upload the new photos to cloudinary
    */
    for (let i = 0; i < product.photos.length; i++) {
      const res = await cloudinary.uploader.destroy(product.photos[i].id);
    }

    let photos = req.files.productPhotos;

    if (
      typeof photos === "object" &&
      photos !== null &&
      !Array.isArray(photos)
    ) {
      photos = [photos]; //converting the object type to array type to iterate through for loop
    }

    for (let i = 0; i < photos.length; i++) {
      const uploadRes = await cloudinary.uploader.upload(
        photos[i].tempFilePath,
        {
          folder: "Products", //put this inside env file to make it consistent
        }
      );

      productImages.push({
        id: uploadRes.public_id,
        secure_url: uploadRes.secure_url,
      });
    }

    req.body.photos = productImages;

    const updatedProductRes = await Product.findByIdAndUpdate(
      productId,
      req.body, //user must fill all the fields
      {
        new: true,
        runValidators: true,
        useFindAndModify: true,
      }
    );

    res.status(200).json({
      success: true,
      product: updatedProductRes,
    });
  }
});

exports.adminDeleteProduct = BigPromise(async (req, res, next) => {
  const productId = req.params.id;
  const product = await Product.findById(productId);

  if (!product) {
    return next(new CustomError("Product not found", 400));
  }

  //Delete the images stored on cloudinary
  for (let i = 0; i < product.photos.length; i++) {
    await cloudinary.uploader.destroy(product.photos[i].id);
  }

  await product.remove(); // we are calling remove on the product obj, not on the Product Model

  res.status(200).json({
    success: true,
    message: "Product was deleted successfully",
  });
});
