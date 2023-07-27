import mongoose from "mongoose";
import express from "express";
import dotenv from "dotenv";
dotenv.config();
import roomRoute from "./routes/Rooms.js";
import lessonRoute from "./routes/Lessons.js";
import courseRoute from "./routes/Courses.js";
import cors from "cors";
import bodyParser from "body-parser";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import moment from "moment-timezone";
import { io, httpServer, app } from "./socket.js";
import { sendUpdatedFreeRooms, sendUpdatedInUseRooms, sendUpdatedOngoingCourse, sendUpdatedOngoingLessons, sendUpdatedUpcomingLessons } from "./controller.js";

// Setting time zone to East Africa Time (Africa/Nairobi)
moment.tz.setDefault("Africa/Nairobi");

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

//mongoose connection
mongoose.set('strictQuery', true);
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to DB");
  } catch (error) {
    handleError(error);
  }
}

// Define the handleError function
const handleError = (error) => {
  console.error("Database connection error:", error);
  process.exit(1);
}

//middleware
app.use(cors({ origin: ["http://localhost:3000", "http://localhost:3001",], credentials: true }));
app.use(express.json());

//body parser 
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }))

//routes
app.use("/api/rooms", roomRoute);
app.use("/api/lessons", lessonRoute);
app.use("/api/courses", courseRoute);

//static files
app.use(express.static(path.join(__dirname, "public")));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Create Websocket
io.on('connection', (socket) => {
  console.log('A client connected.');

  socket.on('chat message', (message) => {
    console.log('Received message:', message);

    const responseMessage = "Server says: Hello, frontend!";
    io.emit('chat message', responseMessage);
  });

  socket.on('requestData', () => {
    console.log('Received request for free rooms data from the frontend.');
    sendUpdatedFreeRooms(socket); 
    sendUpdatedInUseRooms(socket);
    sendUpdatedOngoingCourse(socket);
    sendUpdatedOngoingLessons(socket);
    sendUpdatedUpcomingLessons(socket);
  });

  socket.on('disconnect', () => {
    console.log('A client disconnected.');
  });
});

const PORT = process.env.OFFLINE_PORT || 8800;
httpServer.listen(PORT, () => {
  connectDB();
  console.log("Backend server is running!");
  console.log(`WebSocket server is running on port ${PORT}`);
});
