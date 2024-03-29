import connectDB from "./db/connect.js";
import dotenv from "dotenv";
import app from "./app.js";

dotenv.config({
    path:'/.env'
})

connectDB()
.then(() =>{
    app.listen(process.env.PORT || 8000, () => {
        console.log(`Server is running at port : ${process.env.PORT}`);
    })
})
.catch((err) => {
    console.log(err);
})






// import mongoose from "mongoose";
// import { DB_NAME } from "./constants"; 

// (async() => {
//     try {
//         await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
//     } catch (error) {
//         console.log(error);
//     }
// })()