const express = require("express")
const { auth } = require("../middlewares/auth")
const RequestConnectionSchema = require('../models/request')
const User = require('../models/user')

const userRouter = express.Router()


userRouter.get("/user/request/received", auth, async (req, res) => {
    try {
        const requestedUsers = await RequestConnectionSchema.find({
            toUserId: req.user._id,
            status: "interested"
        }).populate("fromUserId", ["_id", "firstName", "lastName", "photoUrl", "age", "gender", "skills", "about", "email"]); // Added _id, about, email for completeness
        
        // IMPORTANT: Send JSON
        res.status(200).json(requestedUsers);
    } catch (err) {
        console.error("Error in /user/request/received:", err); // Log for debugging
        res.status(500).json({ message: "Error fetching received requests: " + err.message }); // Send JSON error
    }
});

userRouter.get("/user/connections", auth, async (req, res) => {
    try {
        const connectionsData = await RequestConnectionSchema.find({
            $or: [
                { fromUserId: req.user._id, status: "accepted" },
                { toUserId: req.user._id, status: "accepted" }
            ]
        })
        .populate("fromUserId", "_id firstName lastName gender skills photoUrl email about") // Added _id, email, about
        .populate("toUserId", "_id firstName lastName gender skills photoUrl email about"); // Added _id, email, about

        const data = connectionsData.map((row) => {
            // Return the other user in the connection
            if (row.fromUserId._id.toString() === req.user._id.toString()) {
                return row.toUserId;
            }
            return row.fromUserId;
        });
        
        // IMPORTANT: Send JSON
        res.status(200).json(data); // `data` is already an array of user objects
    } catch (err) {
        console.error("Error in /user/connections:", err); // Log for debugging
        res.status(500).json({ message: "Error fetching connections: " + err.message }); // Send JSON error
    }
});

userRouter.get("/users/feed", auth, async (req, res) => {
    try {
        let page = parseInt(req.query.page) || 1; // Use 'let' for reassignment
        let limit = parseInt(req.query.limit) || 10; // Use 'let'
        limit = limit > 50 ? 50 : limit;
        const skip = (page - 1) * limit;
        const loggedInUser = req.user;

        const connectionRequests = await RequestConnectionSchema.find({
            $or: [
                { fromUserId: loggedInUser._id },
                { toUserId: loggedInUser._id }
            ]
        }).select("fromUserId toUserId");

        const hiddenUsers = new Set();
        connectionRequests.forEach((req) => {
            hiddenUsers.add(req.fromUserId.toString());
            hiddenUsers.add(req.toUserId.toString());
        });
        // Add the logged-in user themselves to hiddenUsers to ensure they don't see themselves
        hiddenUsers.add(loggedInUser._id.toString());

        const users = await User.find({
            // Only consider users who are not in hiddenUsers (already interacted with or self)
            // No need for $ne:loggedInUser._id if hiddenUsers already includes it.
            _id: { $nin: Array.from(hiddenUsers) }
        })
        .select("_id firstName lastName profileUrl age gender about skills email") // Added email as it's often a primary identifier
        .skip(skip)
        .limit(limit);

        // IMPORTANT: Send JSON array of users
        res.status(200).json(users);

    } catch (err) {
        console.error("Error in /users/feed:", err); // Log the actual error for debugging
        res.status(500).json({ message: "Error fetching user feed: " + err.message }); // Send error as JSON
    }
});

module.exports=userRouter