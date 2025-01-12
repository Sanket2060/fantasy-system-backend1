import  express  from "express"
import cors from 'cors'
import cookieParser from "cookie-parser";
const app=express()

app.use(express.json({limit:"16kb"}))
app.use(express.urlencoded({limit:"16kb",extended:true}))
app.use(express.static("public"));
app.use(cookieParser());

app.use(cors({
    origin:"http://localhost:5173",
    credentials:true
  }))
  app.use(express.json({limit:"16kb"}))
app.use(express.urlencoded({limit:"16kb",extended:true}))
//routes import (done here so that to differentiate it from others)
import userRouter from './routes/User.routes.js'
app.use('/api/v1/users',userRouter)  //reach to users route on /users
//url:https//:localhost:9005/api/v1/users/register

export {app}