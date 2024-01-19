

import connectDB from "./db/connectdb";
import dotenv from "dotenv";

dotenv.config({
    path:'./env'
})

connectDB();






// import mongoose from "mongoose";
// import { DB_NAME } from "./constants"; 

// (async() => {
//     try {
//         await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
//     } catch (error) {
//         console.log(error);
//     }
// })()