const mongoose = require("mongoose");
const dbConnect = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("Succesfully Connected to MongoDB");
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

module.exports = dbConnect;
