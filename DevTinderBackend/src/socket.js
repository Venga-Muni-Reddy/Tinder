const { Server } = require("socket.io")
const jwt = require("jsonwebtoken")
const User = require("./models/user")
const Message = require("./models/message")
const { areConnected } = require("./utils/connection")

const parseCookies = (header = "") => {
    const out = {}
    header.split(";").forEach((pair) => {
        const idx = pair.indexOf("=")
        if (idx > -1) {
            out[pair.slice(0, idx).trim()] = decodeURIComponent(pair.slice(idx + 1).trim())
        }
    })
    return out
}

const initSocket = (server, allowedOrigins) => {
    const io = new Server(server, {
        cors: {
            origin: allowedOrigins,
            credentials: true
        }
    })

    // Authenticate every socket with the same JWT cookie the REST API uses.
    io.use(async (socket, next) => {
        try {
            const cookies = parseCookies(socket.handshake.headers.cookie || "")
            const token = cookies.token
            if (!token) return next(new Error("Authentication required"))
            const { _id } = jwt.verify(token, process.env.JWT_SECRET)
            const user = await User.findById(_id).select("_id firstName")
            if (!user) return next(new Error("User not found"))
            socket.userId = user._id.toString()
            next()
        } catch (err) {
            next(new Error("Authentication failed"))
        }
    })

    io.on("connection", (socket) => {
        // Personal room: every message for this user lands here.
        socket.join(socket.userId)

        socket.on("sendMessage", async (payload, ack) => {
            try {
                const targetUserId = payload && payload.targetUserId
                const text = (payload && payload.text ? String(payload.text) : "").trim()

                if (!targetUserId || !text) {
                    return typeof ack === "function" && ack({ error: "Message text is required" })
                }
                if (text.length > 1000) {
                    return typeof ack === "function" && ack({ error: "Message is too long (max 1000 characters)" })
                }
                if (targetUserId === socket.userId) {
                    return typeof ack === "function" && ack({ error: "You cannot message yourself" })
                }

                const connected = await areConnected(socket.userId, targetUserId)
                if (!connected) {
                    return typeof ack === "function" && ack({ error: "You can only chat with accepted connections" })
                }

                const saved = await Message.create({
                    fromUserId: socket.userId,
                    toUserId: targetUserId,
                    text
                })

                const dto = {
                    _id: saved._id,
                    fromUserId: saved.fromUserId,
                    toUserId: saved.toUserId,
                    text: saved.text,
                    createdAt: saved.createdAt
                }

                io.to(targetUserId).to(socket.userId).emit("messageReceived", dto)
                if (typeof ack === "function") ack({ message: dto })
            } catch (err) {
                console.error("sendMessage error:", err)
                if (typeof ack === "function") ack({ error: "Failed to send message" })
            }
        })
    })

    return io
}

module.exports = { initSocket }
