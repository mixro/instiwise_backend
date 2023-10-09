import express from "express";
import Project from "../models/pprojects.model.jss";
import { verifyToken } from "./verifyToken.js";

const router = express.Router();

//create project
router.post("/", verifyToken, async(req, res) => {
    const newProject = new Project(req.body);
    try {
        const savedProject = await newProject.save();
        res.status(200).json(savedProject);
    } catch(err) {
        res.status(500).json(err)
    }
});

//update project
router.put("/:id", verifyToken, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    // Convert project.userId (ObjectId) to a string for comparison
    const projectUserIdString = project.userId.toString();

    if (projectUserIdString === req.user.id || req.user.isAdmin) {
      const updatedProject = await Project.findByIdAndUpdate(
        req.params.id,
        {
          $set: req.body,
        }
      );

      res.status(200).json(updatedProject);
    } else {
      res.status(403).json("You can update only your project");
    }
  } catch (err) {
    res.status(500).json(err);
  }
});


//delete project
router.delete("/:id", verifyToken, async (req, res) => {
    try {
      const project = await Project.findById(req.params.id);

      // Convert project.userId (ObjectId) to a string for comparison
      const projectUserIdString = project.userId.toString();

      if (projectUserIdString === req.user.id || req.user.isAdmin) {
        await Project.deleteOne({ $set: req.body });
        res.status(200).json("the project has been deleted");
      } else {
        res.status(403).json("you can delete only your project");
      }
    } catch (err) {
      res.status(500).json(err);
    }
});

// Like a project
router.put("/:id/like", verifyToken, async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        const userId = req.user.id;
  
        if (!project.likes.includes(userId)) {
            // If the user hasn't liked the project, add to likes
            await project.updateOne({ $push: { likes: userId } });
            res.status(200).json("The project has been liked");
        } else {
            // If the user already liked the project, remove from likes
            await project.updateOne({ $pull: { likes: userId } });
            res.status(200).json("The project has been unliked");
        }
    } catch (err) {
        res.status(500).json(err);
    }
});

//get a project
router.get("/:id", async (req, res) => {
    try {
      const project = await Project.findById(req.params.id).populate('userId');
      res.status(200).json(project);
    }catch(err) {
      res.status(500).json(err);
    }
});

//get all project
router.get("/", async (req, res) => {
    try {
        const projects = await Project.find().populate('userId');
        res.status(200).json(projects);
    } catch (err) {
        res.status(500).json(err);
    }
})

//get user's projects
router.get("/user/:userId", async (req, res) => {
  try {
    // Find projects where userId matches the requested userId
    const projects = await Project.find({ userId: req.params.userId }).populate('userId');
    res.status(200).json(projects);
  } catch (err) {
    res.status(500).json(err);
  }
});


export default router;