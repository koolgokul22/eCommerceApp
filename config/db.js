const mongoose = require("mongoose");

const connectWithDB = () =>
  mongoose
    .connect(process.env.DB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(
      console.log(
        "(_)(_)(_)(_)(_) Connected to DB successfully ... (_)(_)(_)(_)(_)"
      )
    )
    .catch((error) => {
      console.log("!-!-!-!-!- Unable to connect to DB -!-!-!-!-!");
      console.log(error);
      console.log("X-X-X-X-X- Exiting application -X-X-X-X-X");
      process.exit(1);
    });

module.exports = connectWithDB;
