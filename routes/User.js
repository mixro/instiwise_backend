import CryptoJS from "crypto-js";
import express from "express"
import Project from "../models/projects.model.js";
import User from "../models/user.model.js"
import { verifyTokenAndAuthorization,  verifyToken }  from "./verifyToken.js";

const router = express.Router();


//UPDATE
router.put("/:id", verifyTokenAndAuthorization, async (req, res) => {
    if (req.body.password) {
        req.body.password = CryptoJS.AES.encrypt(
            req.body.password,
            process.env.PASS_SEC,
        ).toString();
    }

    try {
        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            {
                $set: req.body,
            },
            { new: true}
        );
        res.status(200).json(updatedUser);
    } catch(err) {
        res.status(500).json(err);
    }
});

//DELETE
router.delete("/:id", verifyTokenAndAuthorization, async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.status(200).json("User has been deleted")
    } catch(err) {
        res.status(500).json(err);
    } 
});

//GET USER
router.get("/find/:id", verifyToken, async (req, res) => {
    try {
      // Find the user by their ID
      const user = await User.findById(req.params.id).populate("connections");
  
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
  
      // Find all projects associated with the user's ID
      const projects = await Project.find({ userId: user._id });
  
      // Exclude the password field from the user object
      const { password, ...userData } = user.toObject();
  
      // Return the user object along with their projects
      res.status(200).json({
        ...userData,
        projects: projects,
      });
    } catch (err) {
      res.status(500).json(err);
    }
});


//GET ALL USERS
router.get("/", verifyToken, async (req, res) => {
    try {
      // Find all users
      const users = await User.find();
  
      // Create an array to store user data with projects
      const usersWithProjects = [];
  
      // Iterate through each user
      for (const user of users) {
        // Find all projects associated with the user's ID
        const projects = await Project.find({ userId: user._id });
  
        // Exclude the password field from the user object
        const { password, ...userData } = user.toObject();
  
        // Add the user object along with their projects to the array
        usersWithProjects.push({
          ...userData,
          projects: projects,
        });
      }
  
      // Return the array of users with their projects
      res.status(200).json(usersWithProjects);
    } catch (err) {
      console.log(err);
      res.status(500).json(err);
    }
});

// CONNECT WITH USER
router.put("/:id/connect", verifyToken, async (req, res) => {
    try {
        const connectedUser = await User.findById(req.params.id);
        const userId = req.user.id;

        // Check if the user is trying to connect with themselves
        if (connectedUser._id.toString() === userId.toString()) {
            return res.status(400).json("You can't connect with yourself.");
        }

        if (!connectedUser.connections.includes(userId)) {
            await connectedUser.updateOne({ $push: { connections: userId } });
            res.status(200).json("The user has been connected");
        } else {
            await connectedUser.updateOne({ $pull: { connections: userId } });
            res.status(200).json("The user has been disconnected");
        }
    } catch (err) {
        res.status(500).json(err);
    }
});


//CHECK CONNECTION
router.get("/:id/is-connected", verifyToken, async (req, res) => {
    try {
        const currentUser = req.user.id;
        const otherUser = await User.findById(req.params.id);

        // Check if the other user's ID is in the connections list of the current user
        const isConnected = otherUser.connections.includes(currentUser);

        res.status(200).json({ isConnected });
    } catch (err) {
        res.status(500).json(err);
    }
});

export default router