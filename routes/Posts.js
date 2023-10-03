import express from "express";
import Post from "../models/post.model.js";
import { verifyToken, verifyTokenAndAdmin } from "./verifyToken.js";

const router = express.Router();

//create a post
router.post("/", verifyTokenAndAdmin, async (req, res) => {
    const newPost = new Post(req.body);
    try {
        const savedPost = await newPost.save();
        res.status(200).json(savedPost);
    }catch(err){
        res.status(500).json(err)
    }
});

//update post
router.put("/:id", verifyTokenAndAdmin, async (req, res) => {
    try {
      const updatedPost = await Post.findByIdAndUpdate(
        req.params.id,
        {
            $set: req.body,
        },
      );

      res.status(200).json(updatedPost);
    } catch (err) {
      res.status(500).json(err);
    }
});

//delete a post
router.delete("/:id", verifyTokenAndAdmin, async (req, res) => {
    try {
      const post = await Post.findById(req.params.id);
      if (post.userId === req.body.userId || req.user.isAdmin) {
        await post.deleteOne({ $set: req.body });
        res.status(200).json("the post has been deleted");
      } else {
        res.status(403).json("you can delete only your post");
      }
    } catch (err) {
      res.status(500).json(err);
    }
});

// Like a post
router.put("/:id/like", verifyToken, async (req, res) => {
  try {
      const post = await Post.findById(req.params.id);
      const userId = req.user.id;

      if (post.dislikes.includes(userId)) {
          // If the user already disliked the post, remove from dislikes and add to likes
          await post.updateOne({ $pull: { dislikes: userId }, $push: { likes: userId } });
          res.status(200).json("The post has been liked and undisliked");
      } else if (!post.likes.includes(userId)) {
          // If the user hasn't liked the post, add to likes
          await post.updateOne({ $push: { likes: userId } });
          res.status(200).json("The post has been liked");
      } else {
          // If the user already liked the post, remove from likes
          await post.updateOne({ $pull: { likes: userId } });
          res.status(200).json("The post has been unliked");
      }
  } catch (err) {
      res.status(500).json(err);
  }
});

// Dislike a post
router.put("/:id/dislike", verifyToken, async (req, res) => {
  try {
      const post = await Post.findById(req.params.id);
      const userId = req.user.id;

      if (post.likes.includes(userId)) {
          // If the user already liked the post, remove from likes and add to dislikes
          await post.updateOne({ $pull: { likes: userId }, $push: { dislikes: userId } });
          res.status(200).json("The post has been disliked and unliked");
      } else if (!post.dislikes.includes(userId)) {
          // If the user hasn't disliked the post, add to dislikes
          await post.updateOne({ $push: { dislikes: userId } });
          res.status(200).json("The post has been disliked");
      } else {
          // If the user already disliked the post, remove from dislikes
          await post.updateOne({ $pull: { dislikes: userId } });
          res.status(200).json("The post has been undisliked");
      }
  } catch (err) {
      res.status(500).json(err);
  }
});

//view post
router.post("/:id/view", verifyToken, async (req, res) => {
  try {
      const post = await Post.findById(req.params.id);
      if (!post.views.includes(req.user.id)) {
          post.views.push(req.user.id);
          await post.save();
          res.status(200).json("Post viewed successfully");
      } else {
          res.status(200).json("Post already viewed");
      }
  } catch (err) {
      res.status(500).json(err);
  }
});

//get a post
router.get("/:id", async (req, res) => {
    try {
      const post = await Post.findById(req.params.id);
      res.status(200).json(post);
    }catch{
      res.status(500).json(err);
    }
});

//get all post
router.get("/", async (req, res) => {
    try {
        const posts = await Post.find();
        res.status(200).json(posts);
    } catch (err) {
        res.status(500).json(err);
    }
})


export default router