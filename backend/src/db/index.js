require("dotenv").config();
const mongoose = require("mongoose");

const connectToDatabase = async () => {
  try {
    const mongoURI = process.env.MONGO_URI;
    if (!mongoURI) {
      throw new Error("MONGO_URI environment variable is not defined");
    }

    console.log("Attempting to connect to MongoDB...");

    mongoose.set('strictQuery', false);

    const connectOptions = {
      // Keep connection attempts reasonable in production
      serverSelectionTimeoutMS: 10000,
    };

    // Do not force TLS here; the driver will decide based on the URI.
    // - For local/VPS MongoDB (mongodb://), no TLS is used.
    // - For Atlas (mongodb+srv://), the driver enables TLS automatically.
    await mongoose.connect(mongoURI, connectOptions);

    console.log("✅ Connected to MongoDB successfully!");
    console.log("Database:", mongoose.connection.db.databaseName);
  } catch (error) {
    console.error("❌ Failed to connect to MongoDB:", error.message);
    console.log("Server will continue running without MongoDB connection.");
    console.log("Note: Database operations will not work until MongoDB is available.");
  }
};

module.exports = { connectToDatabase };
