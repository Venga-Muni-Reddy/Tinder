const mongoose = require('mongoose')
require('dotenv').config();

const connectDB = async ()=>{
    try{
        await mongoose.connect("mongodb+srv://vengamunireddy040404:eAlLLByywKVsmoRP@devtinder.oyuo1cn.mongodb.net/devTinder?retryWrites=true&w=majority&appName=devTinder" || process.env.MONGO_URI)
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