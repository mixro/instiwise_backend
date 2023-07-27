import Room from "../models/room.model.js";
import Lesson from '../models/lesson.model.js';
import express from "express";
import mongoose from 'mongoose';
import moment from "moment";
import { getIoInstance, io } from "../socket.js";
import { sendUpdatedFreeRooms, sendUpdatedInUseRooms } from "../controller.js";

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

//GET ROOM
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
});

// GET FREE ROOMS
router.get('/free', async (req, res) => {
    try {
      const currentTime = moment();
  
      // Find all rooms that are not in use at the current time
      const inUseRoomIds = await Lesson.distinct('roomId', {
        start: { $lte: currentTime.format("HH:mm") }, // Format the time to 24-hour format (e.g., "23:00")
        end: { $gte: currentTime.format("HH:mm") },
      });
  
      // Convert the array of room IDs to Mongoose ObjectId instances
      const inUseRoomObjectIds = inUseRoomIds.map((roomId) => new mongoose.Types.ObjectId(roomId));
  
      const freeRooms = await Room.find({
        _id: { $nin: inUseRoomObjectIds },
      });
  
        //socket.io connections
        emitUpdatedRoomsData(io);
  
      res.json(freeRooms);
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: 'Error getting free rooms' });
    }
});

// GET ROOMS IN USE
router.get('/inUse', async (req, res) => {
  try {
    const currentTime = moment();

    // Find all rooms that are in use at the current time
    const inUseRoomIds = await Lesson.distinct('roomId', {
        start: { $lte: currentTime.format("HH:mm") }, // Format the time to 24-hour format (e.g., "23:00")
        end: { $gte: currentTime.format("HH:mm") },
    });

    // Convert the array of room IDs to Mongoose ObjectId instances
    const inUseRoomObjectIds = inUseRoomIds.map((roomId) => new mongoose.Types.ObjectId(roomId));

    const roomsInUse = await Room.find({
      _id: { $in: inUseRoomObjectIds },
    });

    //socket.io connections
    emitUpdatedRoomsData(io);
    
    res.json(roomsInUse);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Error getting rooms in use' });
  }
});

export default router