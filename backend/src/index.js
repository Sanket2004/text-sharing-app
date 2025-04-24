import http from "http";
import { Server } from "socket.io";
import app from "./app.js";
import configureSocket from "./services/socketService.js";
import "dotenv/config";
import connectDB from "./config/db.js";

connectDB();

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST"],
  },
});

configureSocket(io);

const PORT = process.env.PORT;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
