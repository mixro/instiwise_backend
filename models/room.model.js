import mongoose from "mongoose";
const { Schema } = mongoose;

// Define the Mongoose schema for rooms
const roomSchema = new Schema({
  roomName: {
    type: String,
    required: true,
    unique: true,
  },
  seats: {
    type: Number,
    required: true,
  },
  building: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['free', 'occupied', 'maintenance'],
    default: 'free',
  },
  img: {
    type: String,
    required: true,
  },
},
  { timestamps: true }  
);

// Create a Room model from the schema
export default mongoose.model('Rooms', roomSchema);