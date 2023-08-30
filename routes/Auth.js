import express from "express";
import User from "../models/user.model.js"
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
        const user = await User.findOne({ email: req.body.email });

        const hashedPassword = CryptoJS.AES.decrypt(
            user.password,
            process.env.PASS_SEC
        );

        const OriginalPassword = hashedPassword.toString(CryptoJS.enc.Utf8);

        const accessToken = jwt.sign(
            {
                id: user._id,
                isAdmin: user.isAdmin,
            },
            process.env.JWT_SEC,
            {expiresIn:"8640d"}
        );

        const { password, ...others } = user._doc;
        if(!user || OriginalPassword != req.body.password) {
            return res.status(400).json("wrong credentials")
        } else {
            return res.status(200).json({...others, accessToken});
        }
    } catch(err) {
        return res.status(500).json(err);
    }
})

//GOOGLE AUTH
router.post("/google", async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });

        if(!user) {
            const temporaryPassword = Math.random().toString(36).substring(7);

            const newUser = new User({
                username: req.body.username,
                email: req.body.email,
                phoneNumber: req.body.phoneNumber,
                gender: req.body.gender,
                course: req.body.course,
                password: CryptoJS.AES.encrypt(temporaryPassword, process.env.PASS_SEC).toString(),
            });

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
        }

        const accessToken = jwt.sign(
            {
                id: user._id,
                isAdmin: user.isAdmin,
            },
            process.env.JWT_SEC,
            {expiresIn:"8640d"}
        );

        const { password, ...others } = user._doc;
        return res.status(200).json({...others, accessToken});
    } catch(error) {
        return res.status(500).json("Error while logging in")
    }
})

export default router