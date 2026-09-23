require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/database");
const studentRoutes = require("./routes/studentRoutes");

const app = express();

// Connect to MongoDB Atlas
connectDB();

// Body parser
app.use(express.json());

// CORS: only allow the deployed Netlify frontend (and localhost for local dev)
// to call this API, instead of allowing every domain.
const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:5500",
  "http://127.0.0.1:5500",
  "http://localhost:3000",
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (e.g. curl, Postman, server-to-server)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
  })
);

// Health check route (useful to confirm Render deployment is alive)
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Student Management API is running",
  });
});

// API routes
app.use("/api/students", studentRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// Global error handler (keeps internal error details out of the response)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: "Something went wrong on the server" });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
