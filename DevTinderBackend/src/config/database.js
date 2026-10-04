const mongoose = require('mongoose')
require('dotenv').config();

const connectDB = async ()=>{
    try{
        if(process.env.MONGO_URI){
            await mongoose.connect(process.env.MONGO_URI)
        } else {
            await mongoose.connect("mongodb+srv://"+process.env.MONGO_HOST+"/devTinder?retryWrites=true&w=majority&appName=DevTinder",{user:process.env.MONGO_USER,pass:process.env.MONGO_PASS})
        }
        console.log("Data Base Connected...")
    }
    catch(err){
        console.error("Database not connected "+err)
    }
}

module.exports = {connectDB}

// connectDB()
//     .then(()=>{
//         console.log("Database Established ...") 
//     })
//     .catch((err)=>{
//         console.error("Database not established ")
//     })
