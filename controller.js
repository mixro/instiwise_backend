import Room from "./models/room.model.js";
import Lesson from './models/lesson.model.js';
import Course from "./models/course.model.js";
import Post from "./models/post.model.js";
import mongoose from 'mongoose';
import moment from "moment";


//FREE ROOMS
export const sendUpdatedFreeRooms = async () => {
    try {
      const currentTime = moment();
      const currentDay = currentTime.format('dddd'); // Get the current day in long format (e.g., "Monday")
      const currentTimeString = currentTime.format('HH:mm'); // Get the current time in 24-hour format (HH:mm)

      // Find all rooms that are not in use at the current time and day
      const inUseRoomIds = await Lesson.distinct('roomId', {
          day: currentDay,
          start: { $lte: currentTimeString },
          end: { $gte: currentTimeString },
      });

      // Convert the array of room IDs to Mongoose ObjectId instances
      const inUseRoomObjectIds = inUseRoomIds.map((roomId) => new mongoose.Types.ObjectId(roomId));

      const freeRooms = await Room.find({
          _id: { $nin: inUseRoomObjectIds },
      });

      return freeRooms;
    } catch (error) {
      console.error("Error sending free rooms data:", error);
    }
};

//INUSE ROOMS
export const sendUpdatedInUseRooms = async () => {
    try {
      const currentTime = moment();

      // Get the current day in long format (e.g., "Monday")
      const currentDay = currentTime.format('dddd');
  
      // Find all rooms that are in use at the current time and on the current day
      const inUseRoomIds = await Lesson.distinct('roomId', {
        day: currentDay,
        start: { $lte: currentTime.format("HH:mm") },
        end: { $gte: currentTime.format("HH:mm") },
      });
  
      // Convert the array of room IDs to Mongoose ObjectId instances
      const inUseRoomObjectIds = inUseRoomIds.map((roomId) => new mongoose.Types.ObjectId(roomId));
  
      const roomsInUse = await Room.find({
        _id: { $in: inUseRoomObjectIds },
      });
  
      // Update the status of each room document to 'occupied'
      for (const room of roomsInUse) {
        room.status = 'occupied';
        await room.save();
      }
  
      return roomsInUse;
    } catch (error) {
        console.error("Error sending rooms in use data:", error);
    }
};

//ONGOING COURSES
export const sendUpdatedOngoingCourse = async () => {
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
  
      return coursesWithOngoingLessons;
    } catch (error) {
        console.error("Error sending ongoing courses data:", error);
    }
};

//ONGOING LESSONS
export const sendUpdatedOngoingLessons = async () => {
    try {
      const currentTime = moment(); // Get the current time as a moment object

      const currentTimeString = currentTime.format('HH:mm'); // Get the current time in 24-hour format (HH:mm)
  
      const currentDay = currentTime.format('dddd'); // Get the current day in long format (e.g., "Monday")
  
      const ongoingLessons = await Lesson.find({
        day: { $eq: currentDay },
        start: { $lte: currentTimeString },
        end: { $gte: currentTimeString },
      }).populate('roomId courseId');
  
      return ongoingLessons;
    } catch (error) {
        console.error("Error sending ongoing lessons data:", error);
    }
};

//UPCOMING LESSONS
export const sendUpdatedUpcomingLessons = async () => {
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
  
      return filteredUpcomingLessons;
    } catch (error) {
        console.error("Error sending upcoming lessons data:", error);
    }
};

//POSTS
export const sendUpdatedPosts = async () => {
  try {
    const posts = await Post.find();
    return posts;
  } catch(error) {
    console.error("Error sending post data:", error);
  } 
}

//LESSONS
export const sendUpdatedLessons = async () => {
  try {
    const lessons = await Lesson.find().populate('roomId courseId');

    return lessons;
  } catch (error) {
    console.log("Error sending lessons data:", error);
  }
}

//ROOMS
export const sendUpdatedRooms = async () => {
  try {
    const rooms = await Room.find();

    return rooms;
  } catch(error) {
    console.err("Error sending lessons data:", error)
  }
}

//COURSES
export const sendUpdatedCourses = async () => {
  try {
    const courses = await Course.find();

    return courses;
  } catch(error) {
    console.err("Error sending courses data:", error)
  }
}

// Helper function to convert time string (HH:mm) to minutes
const getTimeInMinutes = (timeString) => {
    const [hours, minutes] = timeString.split(':');
    return parseInt(hours) * 60 + parseInt(minutes);
  };
