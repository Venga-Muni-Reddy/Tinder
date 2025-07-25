const mongoose = require('mongoose')
const validator = require('validator')
const jwt = require('jsonwebtoken')

const userSchema = new mongoose.Schema({
    firstName : {
        type : String,
        required:true,
        minLength:4,
        maxLength:25
    },
    lastName : {
        type : String
    },
    emailID : {
        type : String,
        required:true,
        unique:true,
        trim:true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error("Invalid email format")
            }
        }
    },
    password : {
        type : String,
        required:true,
        validate(value){
            if(!validator.isStrongPassword(value)){
                throw new Error("Password is too weak make it strong by supplying enough nutrition")
            }
        }

    },
    gender : {
        type : String,
        required:true,
        validate(value){
            if(!["male","female","other"].includes(value)){
                throw new Error("Gender should be male or female or other")
            }
        }
    },
    age : {
        type : String,
    },
    photoUrl:{
        type:String,
        default : "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ6vBz9VgjksAaZZkWOm8Lk3ZSb7gO25eP0-Q&s",
        validate(value){
            if(!validator.isURL(value)){
                throw new Error("Photo url is invalid");
            }
        }
        
    },
    skills:{
        type:[String],
        maxLength:15
    },
    about:{
        type:String,
        default:"This is place to add about you"
    }
},
{
    timestamps:true
}
)

userSchema.methods.getJWT = async function(){
    const user = this
    const token = await jwt.sign({_id:user._id},"DevTinder123$",{expiresIn : '1d'})
    return token
}

//Like this only do for the password validation also

module.exports = mongoose.model("User",userSchema)


//  const User = mongoose.model("User",userSchema)
//  module.exports = {User}
//Object destructuring requires