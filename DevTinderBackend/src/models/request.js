const mongoose = require('mongoose')

const requestConnectionSchema = new mongoose.Schema({
    fromUserId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        require:true
    },
    toUserId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        require:true
    },
    status:{
        type:String,
        enum:{
            values:["accepted","rejected","interested","ignored"],
            message:"Status invalid"
        }
    }
},
{
    timeStamps:true

}

)

module.exports=mongoose.model("RequestConnectionSchema",requestConnectionSchema)