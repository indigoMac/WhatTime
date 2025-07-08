import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { config } from "dotenv";
import path from "path";

// Load environment variables
config();

// Import routes
import authRoutes from "./routes/auth";
import meetingsRoutes from "./routes/meetings";
import { ApiResponse } from "./types";

const app = express();
const PORT = process.env.API_PORT || 8000;

// Security middleware
app.use(helmet());

// CORS configuration
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Serve static files from public directory
app.use(express.static(path.join(__dirname, "..", "public")));

// Health check endpoint
app.get("/health", (req: any, res: any) => {
  res.json({
    success: true,
    data: {
      status: "healthy",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || "development",
    },
  } as ApiResponse<{
    status: string;
    timestamp: string;
    environment: string;
  }>);
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/meetings", meetingsRoutes);
app.use("/api", meetingsRoutes); // Add direct access to response endpoints

// Debug endpoint for React component logging
app.post("/api/debug", (req: any, res: any) => {
  const { timestamp, message, data, location } = req.body;
  console.log(`🔍 ${location} DEBUG [${timestamp}]: ${message}`);
  if (data) {
    console.log(`🔍 ${location} DEBUG Data:`, JSON.stringify(data, null, 2));
  }
  res.json({ success: true });
});

// 404 handler
app.use("*", (req: any, res: any) => {
  res.status(404).json({
    success: false,
    error: "Route not found",
  } as ApiResponse);
});

// Global error handler
app.use((error: Error, req: any, res: any, next: any) => {
  console.error("Global error handler:", error);

  res.status(500).json({
    success: false,
    error:
      process.env.NODE_ENV === "production"
        ? "Internal server error"
        : error.message,
  } as ApiResponse);
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(
    `🌐 Frontend URL: ${process.env.FRONTEND_URL || "http://localhost:3000"}`
  );
});

export default app;
