const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const authMiddleware = require("../middleware/authMiddleware");
const User = require("../models/user");

const router = express.Router();

//REGISTER User

router.post("/register" , async(req,res)=>{
    try{
        const { phone , password } = req.body;

        if(!phone || !password){
            return res.status(400).json({
                message : "Phone number and Password are required"
            });
        }

        const existingUser = await User.findOne({phone});

        if(existingUser){
            return res.status(409).json({
                message : "User already exists"
            });
        }

        //Hash password

        const hashedPassword = await bcrypt.hash(password , 10);

        //Create User

        const user = await User.create({
            phone , 
            password : hashedPassword
        })

        res.status(201).json({
            message : "User registered successfully" , 
            userId : user._id
        });
    } catch(error){
        res.status(500).json({
            message : error.message
        });
    }
})


//LOGIN USER

router.post("/login" , async (req,res) => {
    try{
        const {phone ,password} = req.body;

        if(!phone || !password){
            return res.status(400).json({
            message : "Phone number and password are required"
        });
    }

    const user = await User.findOne({phone});

    if(!user){
        return res.status(401).json({
            message : "Invalid phone or password"
        });
    }

    const isPasswordCorrect = await bcrypt.compare(
        password,
        user.password
    );

    if(!isPasswordCorrect){
        return res.status(401).json({
            message : "Invalid phone or password"
        });
    }

    //Generate JWT token

    const token = jwt.sign(
        {
            userId : user._id
        },
        process.env.JWT_SECRET,
        {
            expiresIn:"7d"
        }
    );

    res.status(200).json({
        message : "Login successfully",
        token : token
    });
} catch(error){
    res.status(500).json({
        message : error.message
    });
}
})

router.get("/me" , authMiddleware , async(req,res) => {
    res.status(200).json({
        message : "You are authenticated" , 
        userId : req.user.userId
    });
})

module.exports = router;
