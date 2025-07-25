const express = require('express')
const {connectDB} = require('./config/database')
const app = express()
const cookieParser = require('cookie-parser')
const authRouter = require('./routes/auth')
const profileRouter = require('./routes/profile')
const requestRouter = require('./routes/request')
const userRouter = require('./routes/user')
const cors = require('cors')

app.use(express.json()) //app.use("/",(req,res,next)=>{express.json() next()})
app.use(cookieParser())
app.use(cors(
    {
        origin:["http://localhost:5173",process.env.FRONTEND_URI],
        credentials:true
    }
))

app.use("/",authRouter)
app.use("/",profileRouter)
app.use("/",requestRouter)
app.use("/",userRouter)

connectDB().
    then(
        ()=>{
            app.listen(3333,()=>{
            })
        }
    ).catch((err)=>{
        throw new Error("Error : "+err.message)
    })

