import {asyncHandler} from "../utils/asyncHandler.js"
import {Apierror} from "../utils/ApiError.js"
import { User } from "../models/user.model.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js";
import { Apiresponse } from "../utils/ApiResponse.js";
import mongoose from "mongoose";

const registerUser  = asyncHandler(async (req,res) => {
    //get details from frontend
    //validation - not empty
    // check if user already exists: username , email
    //check for images
    //upload them to cloudinary
    //create user object-create entry in db
    //remove pass and refresh token from response
    //check for user creation
    //return res


    const {username,fullname ,email,password} = req.body
    // console.log(email);

    if(
        [fullname,email,username,password].some((field) =>
        field?.trim() === "")
    ) {
        throw new Apierror(400,"All fields is required")
    }
    const existedUser = await User.findOne({
        $or:[{username},{email}]
    })
    if (existedUser) {
        throw new Apierror(409,"User already exists")
    }
    const avatarLocalPath = req.files?.avatar[0]?.path
    const coverImgLocalPath = req.files?.coverImg[0]?.path

    if(!avatarLocalPath) {
        throw new Apierror(400,"avatar is required")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImg = await uploadOnCloudinary(coverImgLocalPath)

    if(!avatar) {
        throw new Apierror(400,"avatar is required")
    }   

    const user = await User.create({
        email,
        fullname,
        password,
        username: username.toLowerCase(),
        avatar : avatar.url,
        coverImg : coverImg?.url || ""
    })
    
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )
    if(!createdUser){
        throw new Apierror(500,"something went wrong while registertion")
    }
    return res.status(201).json(
        new Apiresponse(200,createdUser,"Registertion succesfull")
    )
})
export default registerUser;