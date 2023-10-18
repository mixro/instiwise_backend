import express from "express";
import User from "../models/user.model.js";
import Project from "../models/projects.model.js";
import CryptoJS from "crypto-js";
import jwt from "jsonwebtoken";

const router = express.Router();

//REGISTER 
router.post("/register", async (req, res) => {
    const newUser = new User({
        username: req.body.username,
        email: req.body.email,
        phoneNumber: req.body.phoneNumber,
        gender: req.body.gender,
        img: req.body.img,
        course: req.body.course,
        password: CryptoJS.AES.encrypt(
            req.body.password,
            process.env.PASS_SEC
        ).toString(),
    });

    try {
        const savedUser = await newUser.save();
        const accessToken = jwt.sign(
            {
                id: savedUser._id,
                isAdmin: savedUser.isAdmin,
            },
            process.env.JWT_SEC,
            {expiresIn:"86400d"}
        );

        const { password, ...others } = savedUser._doc;

        res.status(201).json({...others, accessToken})
    } catch(err) {
        res.status(500).json(err);
    }
})

//LOGIN
router.post("/login", async (req, res) => {
    try {
      const user = await User.findOne({ email: req.body.email }).populate("connections");
  
      if (!user) {
        return res.status(400).json("Wrong credentials");
      }
  
      const hashedPassword = CryptoJS.AES.decrypt(
        user.password,
        process.env.PASS_SEC
      );
  
      const originalPassword = hashedPassword.toString(CryptoJS.enc.Utf8);
  
      if (originalPassword !== req.body.password) {
        return res.status(400).json("Wrong credentials");
      }
  
      // Find all projects associated with the user's ID
      const projects = await Project.find({ userId: user._id });
  
      // Generate an access token
      const accessToken = jwt.sign(
        {
          id: user._id,
          isAdmin: user.isAdmin,
        },
        process.env.JWT_SEC,
        { expiresIn: "8640d" }
      );
  
      // Exclude the password field from the user object
      const { password, ...userWithoutPassword } = user._doc;
  
      // Return the user object along with their projects and access token
      res.status(200).json({
        ...userWithoutPassword,
        projects: projects,
        accessToken: accessToken,
      });
    } catch (err) {
      return res.status(500).json(err);
    }
});
  

//GOOGLE LOGIN
router.post("/google-login", async (req, res) => {
    try {
      const user = await User.findOne({ email: req.body.email });
  
      const accessToken = jwt.sign(
        {
          id: user._id,
          isAdmin: user.isAdmin,
        },
        process.env.JWT_SEC,
        { expiresIn: "8640d" }
      );
  
      const { password, ...others } = user._doc;
  
      // Find the associated projects for the existing user
      const projects = await Project.find({ userId: user._id });
  
      res.status(200).json({ ...others, accessToken, projects });
    } catch (error) {
      return res.status(500).json("Error while logging in");
    }
});

//GOOGLE REGISTER
router.post("/google-register", async (req, res) => {
    try {
      const temporaryPassword = Math.random().toString(36).substring(7);

      const newUser = new User({
        username: req.body.username,
        email: req.body.email,
        phoneNumber: req.body.phoneNumber,
        img: req.body.img,
        gender: req.body.gender,
        course: req.body.course,
        password: CryptoJS.AES.encrypt(
          temporaryPassword,
          process.env.PASS_SEC
        ).toString(),
      });

      const savedUser = await newUser.save();

      // After saving the new user, you can find their associated projects here
      const projects = await Project.find({ userId: savedUser._id });

      // Add the projects array to the saved user
      savedUser.projectsArray = projects;

      await savedUser.save();

      const accessToken = jwt.sign(
        {
          id: savedUser._id,
          isAdmin: savedUser.isAdmin,
        },
        process.env.JWT_SEC,
        { expiresIn: "86400d" }
      );

      const { password, ...others } = savedUser._doc;

      res.status(201).json({ ...others, accessToken });
    } catch (error) {
      return res.status(500).json("Error while registering");
    }
});
  

export default router