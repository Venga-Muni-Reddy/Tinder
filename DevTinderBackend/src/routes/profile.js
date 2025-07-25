const express = require('express')
const profileRouter = express.Router()
const {auth} = require('../middlewares/auth')
const User =  require('../models/user')

//Profile API
profileRouter.get("/profile/view", auth, (req, res) => {
    // Ensure req.user contains the user object (usually from your auth middleware)
    // and send it as JSON.
    if (req.user) {
        // IMPORTANT: Send the user object as JSON, not a string
        res.status(200).json(req.user); // Send the user object directly
    } else {
        // This case should ideally be handled by the 'auth' middleware
        // returning a 401 Unauthorized, but as a fallback:
        res.status(401).json({ message: "User not authenticated or not found." });
    }
});

//Update API
profileRouter.patch("/profile/edit",auth,async (req,res)=>{
    try{
        const updatedUserDetails = req.body
        const userId=req.user._id
        const ALLOWED_UPDATES = ["photoUrl","gender","age","skills","about"]
        const isValidUpdate = Object.keys(updatedUserDetails).every((k)=>{return ALLOWED_UPDATES.includes(k)})
        
        if(isValidUpdate){
            const user = await User.findByIdAndUpdate(userId,updatedUserDetails,{new:true,runValidators:true})
            if (!user) {
                return res.status(404).json({
                message: "User not found",
            });
            }
            res.status(200).json({
                message:"Updated successfully",
                data:user
            })
        }
        else    
            throw new Error("Unallowed field cannot be updated") 

    }catch(error){
        res.status(400).json({
            Danger:error.message
        })
    }
    
})

module.exports = profileRouter