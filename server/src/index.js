import express from "express";
import cors from "cors";
import helmet from "helmet";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { router } from "./routes/api.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientDistPath = path.resolve(__dirname, "../../client/dist");

const app = express();
const PORT = process.env.PORT || 5000;

// Security & utility middleware
app.use(helmet({
  contentSecurityPolicy: false // Allow React SPA asset loading and API calls
}));

app.use(cors({
  origin: process.env.FRONTEND_ORIGIN || "*",
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]
}));

app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true, limit: "5mb" }));

// Mount API routes
app.use("/api/v1", router);

// Serve static frontend build if client/dist exists (production mode on Render / self-hosted)
if (fs.existsSync(clientDistPath)) {
  console.log(`[Static] Serving frontend SPA from ${clientDistPath}`);
  app.use(express.static(clientDistPath));

  // SPA fallback: any non-API route returns the index.html so client-side routing works on refresh
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api/")) {
      return next();
    }
    res.sendFile(path.join(clientDistPath, "index.html"));
  });
} else {
  // If client/dist is not built yet (dev mode without build)
  app.get("/", (req, res) => {
    res.json({
      name: "MADAD National Social Impact Platform API",
      tagline: "You explain your problem. MADAD finds the way forward.",
      version: "1.0.0",
      status: "operational",
      docs: "/api/v1/health"
    });
  });
}

// Fallback 404 for unhandled API routes
app.use("/api/*", (req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: "ROUTE_NOT_FOUND",
      message: `API endpoint ${req.method} ${req.originalUrl} does not exist.`
    }
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({
    success: false,
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: err.message || "An unexpected error occurred."
    }
  });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`===============================================`);
  console.log(` MADAD API Server running on port ${PORT}`);
  console.log(` Health check: http://localhost:${PORT}/api/v1/health`);
  console.log(` Mode: ${process.env.SUPABASE_URL ? "Supabase Live" : "Persistent File + In-Memory"}`);
  console.log(`===============================================`);
});
