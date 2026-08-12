import path from "path";
import dotenv from "dotenv";
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });
dotenv.config();

import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import swaggerUi from "swagger-ui-express";
import { fail } from "@herdshare/shared";
import { openApiSpec } from "./openapi";
import authRoutes from "./routes/auth";
import farmRoutes from "./routes/farms";
import animalRoutes from "./routes/animals";
import investmentRoutes from "./routes/investments";
import walletRoutes from "./routes/wallet";
import paymentRoutes from "./routes/payments";
import adminRoutes from "./routes/admin";
import notificationRoutes from "./routes/notifications";
import reportRoutes from "./routes/reports";

const corsOrigins = (
  process.env.CORS_ORIGIN ||
  "http://localhost:3000,https://multivariable-api-git-main-sheriii.vercel.app"
)
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

const app = express();
const port = Number(process.env.PORT || process.env.API_PORT || 4000);

app.use(helmet());
app.use(
  cors({
    origin: corsOrigins,
    credentials: true,
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "herdshare-api", ts: new Date().toISOString() });
});

app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(openApiSpec));
app.get("/api/docs.json", (_req, res) => res.json(openApiSpec));

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/api/v1/auth", authLimiter, authRoutes);
app.use("/api/v1/farms", farmRoutes);
app.use("/api/v1/animals", animalRoutes);
app.use("/api/v1/investments", investmentRoutes);
app.use("/api/v1/wallet", walletRoutes);
app.use("/api/v1/payments", paymentRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/notifications", notificationRoutes);
app.use("/api/v1/reports", reportRoutes);

app.use((_req, res) => {
  res.status(404).json(fail("NOT_FOUND", "Route not found"));
});

app.use(
  (
    err: Error,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    console.error(err);
    res.status(500).json(fail("INTERNAL_ERROR", "Unexpected server error"));
  }
);

app.listen(port, "0.0.0.0", () => {
  console.log(`HerdShare API listening on http://0.0.0.0:${port}`);
  console.log(`OpenAPI docs at http://localhost:${port}/api/docs`);
});
