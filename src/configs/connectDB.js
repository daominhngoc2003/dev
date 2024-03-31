import mongoose from "mongoose";

const connectDB = async (url) => {
  try {
    if (url) {
      const conn = await mongoose.connect(url);
      console.log(`MongoDB Connected: ${conn.connection.host}`);
    }
  } catch (error) {
    console.error(`MongoDB connection ERROR: ${error.message}!!!`);
    process.exit(1);
  }
};
export default connectDB;
