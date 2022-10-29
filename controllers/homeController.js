const BigPromise = require("../middlewares/bigPromise");
exports.home = BigPromise((req, res) => {
  //If you don't want to use BigPromise , use async-await inside try catch`1
  res.status(200).json({
    success: true,
    greeting: "Hello there!",
  });
});
