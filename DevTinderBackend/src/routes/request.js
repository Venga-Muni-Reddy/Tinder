const express = require("express")
const {auth} = require("../middlewares/auth")
const RequestConnectionSchema = require('../models/request')

const requestRouter = express.Router()

requestRouter.post("/request/send/:status/:toUserId",auth,async (req,res)=>{ 
    try{
        const fromUserId = req.user._id
        const {toUserId,status} = req.params
        const isStatusValid = ["interested","ignored"].includes(status)
        if(!isStatusValid){
           return res.status(400).send("Unaccepted status found")
        }
        if(fromUserId.equals(toUserId)){
            return res.send("You cannot send connection request yourself")
        }
        const isConnectionAlreadySent = await RequestConnectionSchema.find({
            $or:[
                {
                    fromUserId,toUserId
                },
                {
                    fromUserId:toUserId,
                    toUserId:fromUserId
                }
            ]  
        })
        if(isConnectionAlreadySent.length>0){
            return res.send("Connection already existed")
        }

        const connectionRequestData = new RequestConnectionSchema({
            fromUserId:fromUserId,
            toUserId:toUserId,
            status:status
        })
        await connectionRequestData.save()
        res.status(200).json({
            message: req.user.firstName +" sent connection request",
            data:connectionRequestData
        })

    }catch(error){
        res.send("Error : "+error.message)
    }


    
})

requestRouter.post("/request/review/:status/:requestId",auth,async (req,res)=>{
    try{
        const loggedInUser = req.user
        const {status,requestId}=req.params
        const isAllowedStatus = ["accepted","reject"].includes(status)
        if(!isAllowedStatus){
            return res.status(409).send("Allowed status is not valid")
        }
        const connectionRequest = await RequestConnectionSchema.findOne({
            _id:requestId,
            toUserId:loggedInUser._id,
            status:"interested"
        })
        if(!connectionRequest){
            return res.status(499).send("Error during requested api")
        }
        connectionRequest.status=status
        await connectionRequest.save()
        res.send("Successfully accepted the request")
        }
        catch(err){
            res.send("Error :"+err.message)
        }
})

module.exports = requestRouter