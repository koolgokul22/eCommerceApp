require("dotenv").config();
const app = require("./app");
const connectWithDB = require("./config/db");
const cloudinary = require("cloudinary").v2;

//connect to DB
connectWithDB();

//cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

app.listen(process.env.PORT, () => {
  console.log(`===== Server running on PORT ${process.env.PORT} ... =====`);
});
