import mongoose,{Schema} from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const userSchema =  new Schema(
    {
        username: {
            type:String,
            required:true,
            unique:true,
            trim:true,
            index:true
        },
        email: {
            type:String,
            required:true,
            unique:true,
            trim:true,
        },
        fullname : {
            type:String,
            required:true,
            trim:true,
            index:true
        },
        avatar: {
            type:String,
            required:true,
        },
        coverImg : {
            type:String,
        },
        watchHistory : [
            {
                type:mongoose.Schema.Types.ObjectId,
                ref:"Video"
            }
        ],
        password:{
            type:String,
            require : [true,"Password is required"]
        },
        refreshToken : String
    },{timestamps : true}
)
userSchema.pre("save",async function(next) {
    if(!this.isModified("password")) return next();

    this.password = bcrypt.hash(this.password,10)
    next()
})

userSchema.methods.isPasswordcorrect = async function (password){
    return await bcrypt.compare(password,this.password)
}
userSchema.methods.generateAccesToken = function(){
    return jwt.sign(
        {
        _id:this._id,
        email:this.email,
        username:this.username
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn:process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}
userSchema.methods.refreshAccesToken = function(){
    return Jwt.sign(
        {
        _id:this._id
        },
        process.env.REFRESH_TOKEN_SECRET,
        {   
            expiresIn:process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}
export const User = mongoose.model("User",userSchema);