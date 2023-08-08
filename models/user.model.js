import mongoose from "mongoose";
const { Schema } = mongoose;

// Define the Mongoose schema for rooms
const userSchema = new Schema(
    {
        username: { type: String, required: true,},
        email: { type: String, required: true, unique: true,},
        password: { type: String, required: true,},
        gender: { type: String,},
        course: { type: String,},
        phoneNumber: { type: String,},
        isAdmin: { type: Boolean, default: false,},
    },
    { timestamps: true }
);

// Create a Room model from the schema
export default mongoose.model('Users', userSchema);