import Room from "../models/room.model.js";
import express from "express";

const router = express.Router();

//CREATE
router.post("/", async (req, res) => {
    const newRoom = new Room(req.body);

    try {
        const savedRoom = await newRoom.save();
        res.status(200).json(savedRoom);
    } catch(err) {
        res.status(500).json(err);
    }
})

//UPDATE 
router.put("/:id", async (req, res) => {
    try {
        const updatedRoom = await Room.findByIdAndUpdate(
            req.params.id,
            {
                $set: req.body,
            },
            { new: true },
        );
        res.status(200).json(updatedRoom);
    } catch(err) {
        res.status(500).json(err);
    }
});

//GET  PRODUCT
router.get("/find/:id", async( req, res) => {
    try {
        const room = await Room.findById(req.params.id);
        res.status(200).json(room);
    } catch(err) {
        res.status(500).json(err);
    }
})

//DELETE
router.delete("/:id", async (req, res) => {
    try {
        const room = await Room.findByIdAndDelete(req.params.id);
        res.status(200).json(`The room with id ${room._id} has been deleted..`);
    } catch(err) {
        res.status(500).json(err);
    }
});

//GET ALL ROOMS
router.get('/', async (req, res) => {
    try {
        const rooms = await Room.find();
        res.status(200).json(rooms);
    } catch(err) {
        res.status(200).json(err);
    }
})

export default router