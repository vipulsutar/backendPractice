import { Router } from "express";
import {registerUser,logoutUser, loginUser } from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(
    upload.fields([
        {
            name : "avatar",
            maxCount :1
        },
        {
            name : "coverImg",
            maxCount:1
        }
    ]),
    registerUser
    )

router.route("/login").post(loginUser)

//secured routes

router.route("/logout").post(verifyJWT, logoutUser)


export default router;