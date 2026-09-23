const mongoose = require("mongoose");

// Connects the backend (Render) to MongoDB Atlas using the connection
// string supplied via the MONGODB_URI environment variable.
// The URI is never hard-coded here and never exposed to the frontend.
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Atlas connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    // Exit the process if the database connection fails, so Render
    // marks the deploy as failed rather than running a broken server.
    process.exit(1);
  }
};

module.exports = connectDB;
