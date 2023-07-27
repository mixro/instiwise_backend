import Room from "./models/room.model.js";
import Lesson from './models/lesson.model.js';
import Course from "./models/course.model.js";
import mongoose from 'mongoose';
import moment from "moment";

//FUNCTIONS
export const emitUpdatedRoomsData = async (io) => {
  try {
    await sendUpdatedFreeRooms(io);
    await sendUpdatedInUseRooms(io);
  } catch (error) {
    console.error("Error sending updated rooms data:", error);
  }
};

//FREE ROOMS
export const sendUpdatedFreeRooms = async (io) => {
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
  
      io.emit("freeRoomsData", freeRooms);
    } catch (error) {
      console.error("Error sending free rooms data:", error);
    }
};

//INUSE ROOMS
export const sendUpdatedInUseRooms = async (io) => {
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
  
      io.emit("InUseRoomsData", roomsInUse);
    } catch (error) {
        console.error("Error sending rooms in use data:", error);
    }
};

//ONGOING LESSONS
export const sendUpdatedOngoingCourse = async (io) => {
    try {
        const currentTime = moment();
  
        // Find all lessons with ongoing status at the current time
        const ongoingLessons = await Lesson.find({
            start: { $lte: currentTime.format("HH:mm") }, // Format the time to 24-hour format (e.g., "23:00")
            end: { $gte: currentTime.format("HH:mm") },
        });
    
        // Get distinct courseId values of lessons with ongoing status
        const courseIdsWithOngoingLessons = ongoingLessons.map((lesson) => lesson.courseId);
    
        // Find courses with the matching courseId values
        const coursesWithOngoingLessons = await Course.find({
            _id: { $in: courseIdsWithOngoingLessons },
        });
  
      io.emit("ongoingCoursesData", coursesWithOngoingLessons);
    } catch (error) {
        console.error("Error sending ongoing courses data:", error);
    }
};

//ONGOING LESSONS
export const sendUpdatedOngoingLessons = async (io) => {
    try {
        const currentTime = moment(); // Use moment.js to get the current time in the 24-hour format
        const ongoingLessons = await Lesson.find({
        start: { $lte: currentTime.format("HH:mm") }, // Format the time to 24-hour format (e.g., "23:00")
        end: { $gte: currentTime.format("HH:mm") }, // Format the time to 24-hour format (e.g., "23:00")
      }).populate('roomId courseId');
  
      io.emit("ongoingLessonsData", ongoingLessons);
    } catch (error) {
        console.error("Error sending ongoing lessons data:", error);
    }
};

//UPCOMING LESSONS
export const sendUpdatedUpcomingLessons = async (io) => {
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
        const endMinutes = getTimeInMinutes(lesson.end);

        // Check if the lesson is not ongoing
        return !ongoingLessons.some((ongoingLesson) => ongoingLesson._id.equals(lesson._id)) && startMinutes > currentTimeMinutes;
        });
  
      io.emit("upcomingLessonsData", filteredUpcomingLessons);
    } catch (error) {
        console.error("Error sending upcoming lessons data:", error);
    }
};

// Helper function to convert time string (HH:mm) to minutes
const getTimeInMinutes = (timeString) => {
    const [hours, minutes] = timeString.split(':');
    return parseInt(hours) * 60 + parseInt(minutes);
  };
