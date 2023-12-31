import mongoose from "mongoose";
const { Schema } = mongoose;

// Define the Mongoose schema for courses
const courseSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  numberOfStudents: {
    type: Number,
    required: true,
  },
  courseName: {
    type: String,
    required: true,
  },
  department: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  starting: {
    type: Number
  },
  ending: {
    type: Number
  },
},
  { timestamps: true }
);

// Create a Course model from the schema
export default mongoose.model('Course', courseSchema);