import mongoose from "mongoose";               
const { Schema } = mongoose;

const PostSchema = new Schema({
    userId: {
        type: String,
        required: true
    },
    header: {
        type: String,
        required: true,
    },
    img: {
        type: String,
    },
    desc: {
        type: String,
        required: true
    },
    likes: {
        type: Array,
        default: []
    },
    dislikes: {
        type: Array,
        default: []
    },
    views: {
        type: Array,
        default: []
    }
},
    { timestamps: true }
);

export default mongoose.model('Post', PostSchema);