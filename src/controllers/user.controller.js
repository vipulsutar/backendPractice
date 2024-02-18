import {asyncHandler} from "../utils/asyncHandler.js"
import {Apierror} from "../utils/ApiError.js"
import { User } from "../models/user.model.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js";
import { Apiresponse } from "../utils/ApiResponse.js";
import mongoose from "mongoose";

const generateRefreshAndAccessToken = async(userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccesToken()
        const refreshToken = user.generateRefreshToken() 


        //saving into the database
        user.refreshToken = refreshToken
        await user.save({validateBeforeSave : false})

        //access token generated
        return {accessToken,refreshToken}

    } catch (error) {
        throw new Apierror(500,"Something went wrong")
    }
}

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

const loginUser = asyncHandler(async (req,res) => {
    //req body->data
    //username or email
    //find user
    //check the password
    //access and refresh token 
    //send cookies (secure)
    //response 


    const {email,username,password} = req.body

    if(!username || !email){
        throw new Apierror(400,"Username or email is required")
    }

    const user = await User.findOne({
        $or:[{username},{email}]
    })
    if(!user){
        throw new Apierror(400,"User not found");
    }
    
    const passCheck = await user.isPasswordcorrect(password)
    if(!passCheck){
        throw new Apierror(401,"Password does not match")
    }

    const{accessToken,refreshToken} = await generateRefreshAndAccessToken(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    //cookies
    const options = {
        httpOnly : true,    //this makes the cookies unmodifiable which will be visible on frontend as well only modifiable at server
        secure : true
    }

    return res
    .status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(
        new Apiresponse(
            200,
            {
                user:loggedInUser,accessToken,refreshToken
            },
            "User logged In Successfully"
        )
    )

    
})

const logoutUser = asyncHandler(async (req,res) => {
    await User.findByIdAndUpdate(
            req.user._id,{
                $set: {
                    refreshToken:undefined
                }
            }
    )
    const options = {
        httpOnly: true,
        secure: true
    }
    return res
    .status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(
        new Apiresponse(200,{},"User logged Out Successfully")
    )

})
export  {
    registerUser,
    loginUser,
    logoutUser
};