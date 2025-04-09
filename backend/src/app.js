import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import job from "./config/cron.js";

job.start();

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => res.status(200).json({ status: "healthy" }));

export default app;
