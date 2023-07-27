import { createServer } from "http";
import { Server } from "socket.io";
import express from "express";
const app = express();

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: 'http://localhost:3000',
    credentials: true,
  },
});

export const getIoInstance = () => io;

export { io, httpServer, app };