import Lesson from "../models/lesson.model.js";
import express from "express";
import moment from "moment";

const router = express.Router();

//CREATE
router.post("/", async (req, res) => {
    const newLesson = new Lesson(req.body);

    try {
        const savedLesson = await newLesson.save();

        res.status(200).json(savedLesson);
    } catch(err) {
        res.status(500).json(err);
    }
});

//UPDATE 
router.put("/:id", async (req, res) => {
    try {
        const updatedLesson = await Lesson.findByIdAndUpdate(
            req.params.id,
            {
                $set: req.body,
            },
            { new: true },
        );

        res.status(200).json(updatedLesson);
    } catch(err) {
        res.status(500).json(err);
    }
});

//GET  PRODUCT
router.get("/find/:id", async( req, res) => {
    try {
        const lesson = await Lesson.findById(req.params.id).populate('roomId courseId');

        res.status(200).json(lesson);
    } catch(err) {
        res.status(500).json(err);
    }
})

//DELETE
router.delete("/:id", async (req, res) => {
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