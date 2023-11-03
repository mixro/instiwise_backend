import mongoose from "mongoose";
const { Schema } = mongoose;

// Define the Mongoose schema for lessons
const lessonSchema = Schema({
  name: {
    type: String,
    required: true,
  },  
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true,
  },
  roomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Rooms',
    required: true,
  },
  start: {
    type: String,
    required: true,
  },
  end: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  lecturer: {
    type: String,
    required: true,
  },
  day: {
    type: String,
    required: true,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
  },
},
  { timestamps: true }
);

// Create a Lesson model from the schema

export default mongoose.model('Lessons', lessonSchema);