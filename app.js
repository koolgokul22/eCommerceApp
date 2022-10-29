require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const fileUploader = require("express-fileupload");

//swagger Imports
const swaggerUI = require("swagger-ui-express");
const YAML = require("yamljs");

const app = express();

//swaggerUI configurations
const swaggerDocument = YAML.load("./swagger.yaml");
app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerDocument));

//regular middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//cookies and fileUploader middleware
app.use(cookieParser());
app.use(
  fileUploader({
    useTempFiles: true,
    tempFileDir: "/temp/",
  })
);

//temporary  checking
app.set("view engine", "ejs");

//morgan middleware
app.use(morgan("tiny"));

//import all routes here
const home = require("./routes/home");
const user = require("./routes/user");
const product = require("./routes/product");
const payment = require("./routes/payment");
const order = require("./routes/order");

//router middleware
app.use("/api/v1", home);
app.use("/api/v1", user);
app.use("/api/v1", product);
app.use("/api/v1", payment);
app.use("/api/v1", order);

//for testing signup
app.get("/signuptest", (req, res) => {
  res.render("signuptest");
});

module.exports = app;
