const express = require("express");
const router = express.Router();

//Controllers Import
const { home } = require("../controllers/homeController");

router.route("/").get(home);

module.exports = router;
