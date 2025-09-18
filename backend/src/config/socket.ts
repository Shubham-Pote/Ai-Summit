// src/config/socket.ts
import { Server, ServerOptions } from "socket.io";
import http from "http";
import cors from "cors";
import env from "dotenv";

import { socketAuth } from "../middleware/socket.middleware";   // ← NEW

env.config();

/**
 * Builds and returns a fully-configured Socket.IO server.
 *
 * – CORS mirrors your REST API origins.
 * – Supports websocket & polling transports.
 * – JWT authentication is delegated to reusable socketAuth middleware,
 *   so every namespace inherits it automatically.
 */
export function createSocketServer(httpServer: http.Server): Server {
  const ioOptions: Partial<ServerOptions> = {
    cors: {
      origin: process.env.CORS_ORIGIN?.split(",") ?? "*",
      methods: ["GET", "POST"],
      credentials: true
    },
    transports: ["websocket", "polling"]
  };

  const io = new Server(httpServer, ioOptions);

  // Global auth gate
  io.use(socketAuth);                                // ← UPDATED

  io.on("connection", (socket) => {
    console.info(
      `[socket] ${socket.id} connected as ${socket.data.user?.id}`
    );

    socket.on("disconnect", (reason) => {
      console.info(`[socket] ${socket.id} disconnected: ${reason}`);
    });
  });

  return io;
}
