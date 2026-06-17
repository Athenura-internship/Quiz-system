import mongoose from "mongoose";

let isConnected = false;

const connectDB = async () => {
  if (isConnected) {
    console.log("=> Using existing database connection");
    return;
  }

  try {
    const mongoUri = process.env.MONGO_URL || process.env.MONGO_URI;

    if (!mongoUri) {
      console.warn("⚠️ MongoDB connection variable (MONGO_URL) is missing from environment variables.");
      return;
    }

    const conn = await mongoose.connect(mongoUri);
    isConnected = conn.connections[0].readyState === 1;
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    throw error;
  }
};
export default connectDB;
