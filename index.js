import mongoose from "mongoose";
import express from "express";
import dotenv from "dotenv";
dotenv.config();
import roomRoute from "./routes/Rooms.js";
import lessonRoute from "./routes/Lessons.js";
import userRoute from "./routes/User.js";
import authRoute from "./routes/Auth.js";
import courseRoute from "./routes/Courses.js";
import cors from "cors";
import bodyParser from "body-parser";
import moment from "moment-timezone";
import { createServer } from "http";
import { sendUpdatedFreeRooms, sendUpdatedInUseRooms, sendUpdatedOngoingCourse, sendUpdatedOngoingLessons, sendUpdatedUpcomingLessons } from "./controller.js";

// Setting time zone to East Africa Time (Africa/Nairobi)
moment.tz.setDefault("Africa/Nairobi");

const app = express();
const httpServer = createServer(app);

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
app.use(cors({ origin: ["http://localhost:3000", "http://localhost:3001", "https://instiwise.netlify.app", "https://instiwise-admin.netlify.app"], credentials: true }));
app.use(express.json());

//body parser 
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }))

//routes
app.use("/api/rooms", roomRoute);
app.use("/api/lessons", lessonRoute);
app.use("/api/courses", courseRoute);
app.use("/api/users", userRoute);
app.use("/api/auth", authRoute);

// SSE route for sending real-time updates
app.get("/sse", async (req, res) => {
  const allowedOrigins = [
    "http://localhost:3000",
    "http://localhost:3001",
    "https://instiwise.netlify.app",
    "https://instiwise-admin.netlify.app"
  ];

  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  } else {
    res.status(403).end();
    return;
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const sendUpdates = async () => {  
    const freeRooms = await sendUpdatedFreeRooms();
    const inUseRooms = await sendUpdatedInUseRooms();
    const ongoingCourses = await sendUpdatedOngoingCourse();
    const ongoingLessons = await sendUpdatedOngoingLessons();
    const upcomingLessons = await sendUpdatedUpcomingLessons();
  
    // Collect the data
    const updatedData = {
      freeRooms,
      inUseRooms,
      ongoingCourses,
      ongoingLessons,
      upcomingLessons
    };
  
    // Send a message to the client
    const message = `data: ${JSON.stringify(updatedData)}\n\n`;
    res.write(message);
  };
  
  await sendUpdates();

  const intervalId = setInterval(async () => {
    await sendUpdates();
  }, 60000); // Send updates every 1 seconds

  // Handle client disconnect
  req.on("close", () => {
    clearInterval(intervalId);
  });
});

const PORT = process.env.OFFLINE_PORT || 8800;
httpServer.listen(PORT, () => {
  connectDB();
  console.log("Backend server is running!");
  console.log(`WebSocket server is running on port ${PORT}`);
});
