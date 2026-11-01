const express = require('express')
const http = require('http')
const { connectDB } = require('./config/database')
const app = express()
const cookieParser = require('cookie-parser')
const authRouter = require('./routes/auth')
const profileRouter = require('./routes/profile')
const requestRouter = require('./routes/request')
const userRouter = require('./routes/user')
const chatRouter = require('./routes/chat')
const { initSocket } = require('./socket')
const cors = require('cors')

const allowedOrigins = ["http://localhost:5173", process.env.FRONTEND_URI].filter(Boolean)

app.set('trust proxy', 1)
app.use(express.json())
app.use(cookieParser())
app.use(cors(
    {
        origin: allowedOrigins,
        credentials: true
    }
))

app.use("/", authRouter)
app.use("/", profileRouter)
app.use("/", requestRouter)
app.use("/", userRouter)
app.use("/", chatRouter)

const server = http.createServer(app)
initSocket(server, allowedOrigins)

connectDB().
    then(
        () => {
            server.listen(process.env.PORT || 3333, () => {
                console.log("Server listening with chat support...")
            })
        }
    ).catch((err) => {
        throw new Error("Error : " + err.message)
    })
