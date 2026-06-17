import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Explicitly define path to ensure dotenv finds the file in the current directory
dotenv.config({ path: path.join(__dirname, ".env") });

console.log("DEBUG ENV -> MONGO_URL loaded as:", process.env.MONGO_URL ? process.env.MONGO_URL : "UNDEFINED");


import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import authRouter from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import quizRoutes from "./routes/quizRoutes.js";
import leaderboardRoutes from "./routes/leaderboardRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";
import cookieParser from "cookie-parser";

// Connect Database
await connectDB();

const app = express();

// Init Middleware
app.use(cors());
app.use(express.json());
app.use(cookieParser());

app.use("/auth", authRouter);
app.use("/admin", adminRoutes);
app.use("/quiz", quizRoutes);
app.use("/leaderboard", leaderboardRoutes);
app.use("/contact", contactRoutes);

// Handle 404
app.use((req, res) => {
  res.status(404).json({ message: "❌ Route not found" });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("🔥 GLOBAL ERROR:", err.stack);
  res.status(err.status || 500).json({
    message: err.message || "Internal server error",
    error: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
});

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
    console.log(`📡 Local: http://localhost:${PORT}`);
  });
}

export default app;
