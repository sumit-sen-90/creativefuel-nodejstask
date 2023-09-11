const mongoose = require("mongoose");
const { DB_CONN } = process.env;
mongoose.set("debug", true);

exports.connect = () => {
  // Connecting to the database
  mongoose
    .connect(DB_CONN)
    .then(() => {
      console.log("Successfully connected to database");
    })
    .catch((error) => {
      console.log("database connection failed. exiting now...");
      console.error(error);
      process.exit(1);
    });
};
