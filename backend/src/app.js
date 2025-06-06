import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import job from "./config/cron.js";

job.start();

dotenv.config();
const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
  })
);

app.use(express.json());

app.get("/api/health", (req, res) =>
  res.status(200).json({ status: "healthy" })
);

export default app;
