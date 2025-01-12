import mongoose, { Schema } from "mongoose";
import  jwt  from "jsonwebtoken"; 
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
import bcrypt from "bcrypt"
const userSchema=new Schema({
    firstName:{
        type:String,
        required:true,
        trim:true,
        index:true, //makes optimised for searching  username
    },
    lastName:{
        type:String,
        required:true,
        trim:true,
        index:true, //makes optimised for searching  username
    },
    email:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true,
    },
    
    password:{
        type:String,
        required:[true,'Password is required']  //custom error message for true fields
    },
    refreshToken:{
        type:String
    },
    mobile:{
        type:Number,
        unique:true,
        trim:true,
    },
},{timestamps:true})

userSchema.pre("save",async function(next){      
    if (!this.isModified("password")) return next(); 
    this.password=await bcrypt.hash(this.password,10);   
    console.log("Encrypted password:",this.password);
    next();                                               
})

userSchema.methods.isPasswordCorrect = async function(password){  //custom methods to schema
       return   await  bcrypt.compare(password,this.password);  //this
}
userSchema.methods.generateAccessToken=function(){
    return jwt.sign(
        {
            _id:this._id,   //payload or data

            email:this.email,
            username:this.username,
            name:this.name

        },
        process.env.ACCESS_TOKEN_SECRET,  //secret
        {
            expiresIn:process.env.ACCESS_TOKEN_EXPIRY  //expiry
        }

    )

}

userSchema.methods.generateRefreshToken=function(){
    return jwt.sign(
        {
            _id:this._id,   //payload or data
        },
        process.env.REFRESH_TOKEN_SECRET,  //secret
        {
            expiresIn:process.env.REFRESH_TOKEN_EXPIRY  //expiry
        }

    )

}
export const User=mongoose.model("User",userSchema);

