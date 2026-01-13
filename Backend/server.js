import "dotenv/config";
import dns from "dns";
import express from "express";
import cors from "cors";
import connectDB from "./src/config/db.js";

import authRoutes from "./src/routes/auth.routes.js";
import sendEmailRoutes from "./src/routes/sendemail.routes.js";
import campaignRoutes from "./src/routes/campaign.routes.js";
import marketingRoutes from "./src/routes/marketing.routes.js";
import uploadRoutes from "./src/routes/upload.routes.js";
import templateRoutes from "./src/routes/template.routes.js";
import profileRoutes from "./src/routes/profile.routes.js";
import segmentRoutes from "./src/routes/segment.routes.js";
import passport from "./src/config/passport.config.js";

dns.setDefaultResultOrder('ipv4first');

const app = express();

app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:5174"],
  credentials: true
}));

app.use(express.json());
app.use(passport.initialize());

import { startSmtpServer } from "./src/config/smtpServer.js";

// 🔥 CONNECT DB FIRST
await connectDB();

// 🔥 START SMTP SERVER
startSmtpServer();

import campaignListRoutes from "./src/routes/campaigns/index.js";

// 🔥 ROUTES AFTER DB
app.use("/api/upload", uploadRoutes);
app.use("/api/templates", templateRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/campaigns-list", campaignListRoutes);
app.use("/api", sendEmailRoutes);
app.use("/api", campaignRoutes);
app.use("/api/marketing", marketingRoutes);
app.use("/api/segments", segmentRoutes);

// 🔥 GLOBAL ERROR HANDLER
app.use((err, req, res, next) => {
  console.error('[GLOBAL ERROR]', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

app.listen(process.env.PORT || 8000, () => {
  console.log(`Server is running on port ${process.env.PORT || 8000}`);
});
