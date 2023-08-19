import jwt from "jsonwebtoken"
import express from "express"

const router = express.Router();


export const verifyToken = (req, res, next) => {
    const authHeader = req.headers.token;
    
    if (authHeader) {
        const token = authHeader.split(" ")[1];
        
        jwt.verify(token, process.env.JWT_SEC, (err, decodedToken) => {
            if (err) {
                return res.status(403).json("Token is not valid");
            }
            
            // Check if the decoded token contains necessary user information
            if (decodedToken.id) {
                req.user = decodedToken;
                next();
            } else {
                return res.status(403).json("Invalid user information in token");
            }
        });
    } else {
        return res.status(401).json("You are not authenticated");
    }
};

export const verifyTokenAndAuthorization = (req, res, next) => {
    verifyToken(req, res, () => {
        if (req.user.id === req.params.id || req.user.isAdmin) {
            next();
        } else {
            res.status(403).json("You are not allowed to do that!");
        }
    })
}

export const verifyTokenAndAdmin = (req, res, next) => {
    verifyToken(req, res, () => {
        if (req.user.isAdmin) {
            next();
        } else {
            console.log(req.user);
        }
    });
}