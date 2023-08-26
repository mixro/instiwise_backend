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

//update a post
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

//like/dislike a post
router.put("/:id/like", verifyToken, async (req, res) => {
    try {
      const post = await Post.findById(req.params.id);
      if (!post.likes.includes(req.body.userId)) {
        await post.updateOne({ $push: { likes: req.body.userId } });
        res.status(200).json("The post has been liked");
      } else {
        res.status(200).json("The post has been liked, already");
      }
    } catch (err) {
      res.status(500).json(err);
    }
});

//like/dislike a post
router.put("/:id/dislike", verifyToken, async (req, res) => {
    try {
      const post = await Post.findById(req.params.id);
      if (!post.likes.includes(req.body.userId)) {
        await post.updateOne({ $push: { likes: req.body.userId } });
        res.status(200).json("The post has been disliked");
      } else {
        res.status(200).json("The post has been disliked");
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