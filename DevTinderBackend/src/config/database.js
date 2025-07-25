const mongoose = require('mongoose')
require('dotenv').config();

const connectDB = async ()=>{
    try{
        await mongoose.connect(process.env.MONGO_URI)
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