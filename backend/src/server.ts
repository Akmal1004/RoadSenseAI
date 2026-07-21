import cors from "cors";
import dotenv from "dotenv";
import express, { Request, Response } from "express";
import { aiRouter } from "./routes/ai";
import { routesRouter } from "./routes/routes";
import { searchRouter } from "./routes/search";

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

const allowedOriginsEnv = process.env.ALLOWED_ORIGINS || "";
const allowedOrigins = allowedOriginsEnv
  ? allowedOriginsEnv.split(",").map((o) => o.trim())
  : ["http://localhost:5173", "http://localhost:3000", "http://localhost:8081"];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, Postman)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes("*") || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, true); // Permissive for dev setup
    },
    credentials: true
  })
);

app.use(express.json());

// Request logging middleware
app.use((req, _res, next) => {
  console.log(`[RoadSense Backend] ${new Date().toISOString()} ${req.method} ${req.originalUrl}`);
  next();
});

// Health check endpoint
app.get("/api/health", (_req: Request, res: Response) => {
  res.json({
    status: "ok",
    service: "RoadSenseAI Common Backend",
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || "development"
  });
});

// API Routes
app.use("/api/search", searchRouter);
app.use("/api/routes", routesRouter);
app.use("/api/ai", aiRouter);

// 404 Handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({ success: false, error: "Endpoint not found" });
});

app.listen(port, () => {
  console.log(`====================================================`);
  console.log(`🚦 RoadSenseAI Common Backend Server running on port ${port}`);
  console.log(`🔗 Health Check: http://localhost:${port}/api/health`);
  console.log(`====================================================`);
});
