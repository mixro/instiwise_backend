import mongoose from "mongoose";
const { Schema } = mongoose;

const userSchema = new Schema(
  {
    username: { type: String, unique: true, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    gender: { type: String },
    course: { type: String },
    phoneNumber: { type: String },
    img: { type: String },
    cover: { type: String },
    bio: { type: String },
    awards: { type: Array, default: [] },
    connections: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Reference to the "User" model
      },
    ],
    isAdmin: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);