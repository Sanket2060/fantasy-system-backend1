import { app } from "./app.js";
import connectDB from "./db/index.js";
import dotenv from "dotenv"

// require('dotenv').config({path:'./env'}) with require statement->runs fine but gives inconsistency
dotenv.config({
    path:'./.env'
})
connectDB()
.then(()=>{
    app.on("error",(error)=>{  //event to trigger when error happens,then it calls the callback function
        console.log("Error:",error);
        throw error;   //gives error which is catched by nearest catch block
    })
    app.listen(process.env.PORT||8000,()=>{   //listening means starting server on the given port
        console.log(`Server is running at PORT:${process.env.PORT} `)
    });
   
})
.catch((error)=>{
    console.log("Mongo DB connection failed",error);
})