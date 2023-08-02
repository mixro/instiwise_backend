import { sendUpdatedOngoingCourse } from "../controller.js";
import Course from "../models/course.model.js";
import Lesson from "../models/lesson.model.js";
import express from "express";
import moment from "moment";
import { getIoInstance } from "../socket.js";

const router = express.Router();

//CREATE COURSE
router.post("/", async (req, res) => {
    const newCourse = new Course(req.body);

    try {
        const savedCourse = await newCourse.save();

        res.status(200).json(savedCourse);
    } catch(err) {
        res.status(500).json(err);
    }
})

//UPDATE COURSE
router.put("/:id", async (req, res) => {
    try {
        const updatedCourse = await Course.findByIdAndUpdate(
            req.params.id,
            {
                $set: req.body,
            },
            { new: true },
        );

        res.status(200).json(updatedCourse);
    } catch(err) {
        res.status(500).json(err);
    }
});

//GET COURSE
router.get("/find/:id", async( req, res) => {
    try {
        const course = await Course.findById(req.params.id);

        res.status(200).json(course);
    } catch(err) {
        res.status(500).json(err);
    }
})

//DELETE
router.delete("/:id", async (req, res) => {
    try {
        const course = await Course.findByIdAndDelete(req.params.id);

        res.status(200).json(`The course with id ${course._id} has been deleted..`);
    } catch(err) {
        res.status(500).json(err);
    }
});

//GET ALL COURSE
router.get('/', async (req, res) => {
    try {
        const courses = await Course.find();

        res.status(200).json(courses);
    } catch(err) {
        res.status(200).json(err);
    }
})

//GET COURSES WITH ONGOING LESSONS
router.get("/ongoingCourses", async (req, res) => {
    try {
        const currentTime = moment();

        const currentDay = currentTime.format('dddd'); // Get the current day in long format (e.g., "Monday")
        const currentTimeString = currentTime.format('HH:mm'); // Get the current time in 24-hour format (HH:mm)
  
        // Find all lessons with ongoing status at the current time
        const ongoingLessons = await Lesson.find({
            day: { $eq: currentDay },
            start: { $lte: currentTimeString },
            end: { $gte: currentTimeString },
        });
    
        // Get distinct courseId values of lessons with ongoing status
        const courseIdsWithOngoingLessons = ongoingLessons.map((lesson) => lesson.courseId);
    
        // Find courses with the matching courseId values
        const coursesWithOngoingLessons = await Course.find({
            _id: { $in: courseIdsWithOngoingLessons },
        });
    
        //socket.io connections
        const io = getIoInstance();
        sendUpdatedOngoingCourse(io);

        res.status(200).json(coursesWithOngoingLessons);
    } catch (err) {
      res.status(500).json(err);
      console.log(err);
    }
});


export default router