// config/db.js
import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB подключен успешно");
  } catch (err) {
    console.error("Ошибка подключения к MongoDB:", err.message);
    process.exit(1);
  }
};

export default connectDB;
