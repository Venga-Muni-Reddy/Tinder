const jwt = require("jsonwebtoken")
const User = require("../models/user")


const auth = async (req,res,next)=>{
    try{
        const {token} = req.cookies
        const {_id} = await jwt.verify(token,"DevTinder123$")
        req.user = await User.findById(_id)
        next()
    }
    catch(err){
        res.send("Error : "+err.message)
    }
}

module.exports = {auth : auth}