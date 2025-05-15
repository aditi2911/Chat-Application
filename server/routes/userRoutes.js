import express from 'express'
import { chekAuth,login,signUp,updateProfile } from '../controllers/userController.js'
import {protectRoute} from '../middleware/auth.js'

const userRouter = express.Router();

userRouter.post("/signup", signUp)
userRouter.post("/login", login)
userRouter.put("/update-profile", protectRoute,updateProfile)
userRouter.get("/check", protectRoute,chekAuth)

export default userRouter

