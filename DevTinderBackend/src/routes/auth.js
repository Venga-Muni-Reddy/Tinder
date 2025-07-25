const express = require('express')
const authRouter = express.Router()
const bcrypt = require('bcrypt')
const User = require('../models/user')



//Signup API
authRouter.post("/signup", async (req, res) => {
    try {
        const { firstName, lastName, gender, age, photoUrl, about, emailID, password, skills } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({
            firstName,
            lastName,
            gender,
            emailID, // Ensure this matches your Mongoose schema field name exactly
            age,
            password: hashedPassword,
            skills, // Ensure 'skills' is an array of strings in your schema
            about,
            photoUrl
        });
        await user.save();
        res.status(201).json({ message: "Signup successful!", data: user }); // Consistent JSON response
    } catch (error) {
        console.error("Signup error:", error); // Log the detailed error on the server
        // IMPORTANT: Send error as JSON
        res.status(400).json({ message: "Signup failed: " + error.message });
    }
});

//Login API
authRouter.post("/login",async (req,res)=>{
    try{
        const {emailID,password} = req.body
        const user = await User.findOne({emailID : emailID})
        if(!user){
            throw new Error("Invalid credentials")
        }
            
        const isPasswordValid = bcrypt.compare(password,user.password)
        if(!isPasswordValid){
            throw new Error("Invalid credentials")
        }
        const token = await user.getJWT()
        res.cookie("token",token,{expires:new Date(Date.now()+8*3600000)})
            
        res.status(200).send(user)
    }catch(error){
        res.status(400).send("Error :"+error.message)
    }
})

//Logout
authRouter.post("/logout",(req,res)=>{
    res.cookie("token",null,{expiresIn:new Date(Date.now())})
    res.status(200).json({
        message:"Logout successfull!!"
    })
})

module.exports=authRouter