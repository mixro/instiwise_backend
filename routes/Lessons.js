import Lesson from "../models/lesson.model.js";
import express from "express";

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
})

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
        const lesson = await Lesson.findById(req.params.id);
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

//GET ALL LessonS
router.get('/', async (req, res) => {
    try {
        const lessons = await Lesson.find();
        res.status(200).json(lessons);
    } catch(err) {
        res.status(200).json(err);
    }
})

export default router