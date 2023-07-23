import Course from "../models/course.model.js";
import express from "express";

const router = express.Router();

//CREATE
router.post("/", async (req, res) => {
    const newCourse = new Course(req.body);

    try {
        const savedCourse = await newCourse.save();
        res.status(200).json(savedCourse);
    } catch(err) {
        res.status(500).json(err);
    }
})

//UPDATE 
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

//GET  PRODUCT
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

//GET ALL CourseS
router.get('/', async (req, res) => {
    try {
        const courses = await Course.find();
        res.status(200).json(courses);
    } catch(err) {
        res.status(200).json(err);
    }
})

export default router