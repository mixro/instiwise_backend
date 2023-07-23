import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
import roomRoute from "./routes/Rooms.js";
import lessonRoute from "./routes/Lessons.js";
import courseRoute from "./routes/Courses.js";
import cors from "cors";
import bodyParser from "body-parser";
import path from "path"
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

//mongoose connection
mongoose.set('strictQuery', true)
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("connected to DB");
  } catch (error) {
    handleError(error);
  }
}

//middleware
app.use(cors({ origin: ["http://localhost:3000", "http://localhost:3001"], credentials: true }));
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

app.listen(process.env.PORT || 8800, () => {
  connectDB();
  console.log("Backend server is running!");
});