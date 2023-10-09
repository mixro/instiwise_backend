import Lesson from "../models/lesson.model.js";
import express from "express";
import moment from "moment";
import { verifyTokenAndAdmin } from "./verifyToken.js";
import Room from "../models/room.model.js";
import Course from "../models/course.model.js";

const router = express.Router();

//FUCTIONS
const getRoomIdByName = async (roomName) => {
  try {
      const room = await Room.findOne({ roomName: roomName });

      if (room) {
          return room._id;
      } else {
          console.warn(`Room not found with name: ${roomName}`);
          return null;
      }
  } catch (err) {
      console.error("Error fetching room ID:", err);
      return null;
  }
};

const getCourseIdByName = async (name) => {
  try {
      const course = await Course.findOne({ name: name });

      if (course) {
          return course._id;
      } else {
          console.warn(`Course not found with name: ${name}`);
          return null;
      }
  } catch (err) {
      console.error("Error fetching course ID:", err);
      return null;
  }
};

//CREATE MULTIPLE LESSONS
router.post("/multiple", verifyTokenAndAdmin, async (req, res) => {
  const lessonsData = req.body; // Array of lesson data objects

  const savedLessons = [];

  for (const lessonData of lessonsData) {
      // Lookup room and course IDs based on their names
      const roomId = await getRoomIdByName(lessonData.roomId);
      const courseId = await getCourseIdByName(lessonData.courseId);

      if (!roomId || !courseId) {
          // If roomId or courseId not found, skip this lesson and continue to the next one
          console.warn(`Skipping lesson due to missing room or course: ${lessonData.name}`);
          continue;
      }

      // Create a new lesson with the retrieved IDs
      const newLesson = new Lesson({
          ...lessonData,
          roomId,
          courseId,
      });

      try {
          const savedLesson = await newLesson.save();
          savedLessons.push(savedLesson);
      } catch (err) {
          console.error(`Error saving lesson ${lessonData.name}:`, err);
      }
  }

  res.status(200).json(savedLessons);
});


//CREATE
router.post("/", verifyTokenAndAdmin, async (req, res) => {
    const newLesson = new Lesson(req.body);

    try {
        const savedLesson = await newLesson.save();

        res.status(200).json(savedLesson);
    } catch(err) {
        res.status(500).json(err);
    }
});


//UPDATE 
router.put("/:id", verifyTokenAndAdmin, async (req, res) => {
    try {
        const updatedLesson = await Lesson.findByIdAndUpdate(
            req.params.id,
            {
                $set: req.body,
            },
        );

        res.status(200).json(updatedLesson);
    } catch(err) {
        res.status(500).json(err);
    }
});

//GET  LESSON
router.get("/find/:id", verifyTokenAndAdmin, async( req, res) => {
    try {
        const lesson = await Lesson.findById(req.params.id).populate('roomId courseId');

        res.status(200).json(lesson);
    } catch(err) {
        res.status(500).json(err);
    }
})

//DELETE
router.delete("/:id", verifyTokenAndAdmin, async (req, res) => {
    try {
        const lesson = await Lesson.findByIdAndDelete(req.params.id);

        res.status(200).json(`The lesson with id ${lesson._id} has been deleted..`);
    } catch(err) {
        res.status(500).json(err);
    }
});

//GET ALL LESSONS
router.get('/', async (req, res) => {
    try {
        const lessons = await Lesson.find().populate('roomId courseId');

        res.status(200).json(lessons);
    } catch(err) {
        res.status(200).json(err);
    }
})

// GET LESSONS FOR A PARTICULAR ROOM
router.get('/room/:id', async (req, res) => {
  try {
    const roomId = req.params.id;
    const lessonsInRoom = await Lesson.find({ roomId }).populate('roomId courseId');

    res.status(200).json(lessonsInRoom);
  } catch (error) {
    res.status(500).json({ message: 'Error getting lessons for the room', error: error.message });
  }
});

// GET LESSONS FOR A PARTICULAR COURSE
router.get('/course/:id', async (req, res) => {
  try {
    const courseId = req.params.id;
    const lessonsForCourse = await Lesson.find({ courseId }).populate('roomId courseId');

    res.status(200).json(lessonsForCourse);
  } catch (error) {
    res.status(500).json({ message: 'Error getting lessons for the course', error: error.message });
  }
});

// GET LESSONS FOR THE CURRENT DAY
router.get('/currentday', async (req, res) => {
  try {
    const currentDay = moment().format('dddd'); // Get the current day in long format (e.g., "Monday")

    const lessonsForCurrentDay = await Lesson.find({ day: currentDay }).populate('roomId courseId');

    res.status(200).json(lessonsForCurrentDay);
  } catch (error) {
    res.status(500).json({ message: 'Error getting lessons for the current day', error: error.message });
  }
});


// GET ONGOING LESSONS
router.get('/ongoing', async (req, res) => {
  try {
    const currentTime = moment(); // Get the current time as a moment object

    const currentTimeString = currentTime.format('HH:mm'); // Get the current time in 24-hour format (HH:mm)

    const currentDay = currentTime.format('dddd'); // Get the current day in long format (e.g., "Monday")

    const ongoingLessons = await Lesson.find({
      day: { $eq: currentDay },
      start: { $lte: currentTimeString },
      end: { $gte: currentTimeString },
    }).populate('roomId courseId');

    res.json(ongoingLessons);
  } catch (error) {
    res.status(500).json({ message: 'Error getting ongoing lessons', error: error.message });
  }
});


//GET UPCOMING LESSONS
router.get('/upcoming', async (req, res) => {
  try {
    const currentTime = moment(); // Get the current time as a moment object

    const currentTimeString = currentTime.format('HH:mm'); // Get the current time in 24-hour format (HH:mm)

    const currentDay = currentTime.format('dddd'); // Get the current day in long format (e.g., "Monday")

    const upcomingLessons = await Lesson.find({
      day: { $eq: currentDay },
      start: { $gt: currentTimeString },
    }).populate('roomId courseId');

    // Exclude ongoing lessons from upcoming lessons
    const ongoingLessons = await Lesson.find({
      day: { $eq: currentDay },
      start: { $lte: currentTimeString },
      end: { $gte: currentTimeString },
    }).populate('roomId courseId');

    const currentTimeMinutes = getTimeInMinutes(currentTimeString);

    const filteredUpcomingLessons = upcomingLessons.filter((lesson) => {
      const startMinutes = getTimeInMinutes(lesson.start);

      // Check if the lesson is not ongoing
      return !ongoingLessons.some((ongoingLesson) => ongoingLesson._id.equals(lesson._id)) && startMinutes > currentTimeMinutes;
    });
    
    res.json(filteredUpcomingLessons);
  } catch (error) {
    res.status(500).json({ message: 'Error getting upcoming lessons', error: error.message });
  }
});

// Helper function to convert time string (HH:mm) to minutes
const getTimeInMinutes = (timeString) => {
  const [hours, minutes] = timeString.split(':');
  return parseInt(hours) * 60 + parseInt(minutes);
};

  
  
export default router