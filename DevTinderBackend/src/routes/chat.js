const express = require("express")
const { auth } = require('../middlewares/auth')
const Message = require('../models/message')
const User = require('../models/user')
const { areConnected } = require('../utils/connection')

const chatRouter = express.Router()

// Conversation history between the logged-in user and an accepted connection.
chatRouter.get("/chat/:targetUserId", auth, async (req, res) => {
    try {
        const me = req.user._id
        const targetUserId = req.params.targetUserId

        const target = await User.findById(targetUserId)
            .select("_id firstName lastName photoUrl skills about age gender")
        if (!target) {
            return res.status(404).json({ message: "User not found" })
        }

        const connected = await areConnected(me, target._id)
        if (!connected) {
            return res.status(403).json({ message: "You can only chat with accepted connections" })
        }

        const messages = await Message.find({
            $or: [
                { fromUserId: me, toUserId: target._id },
                { fromUserId: target._id, toUserId: me }
            ]
        }).sort({ createdAt: 1 }).limit(200)

        res.status(200).json({ participant: target, messages })
    } catch (err) {
        console.error("Error in /chat/:targetUserId:", err)
        res.status(500).json({ message: "Error fetching chat: " + err.message })
    }
})

module.exports = chatRouter
