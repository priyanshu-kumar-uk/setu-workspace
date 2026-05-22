import {Router} from 'express'
import {register,otpSend,otpVerify,login,refreshToken,getMe} from '../controllers/auth.user.controller.js'
import {registerValidation} from '../validators/auth.user.validation.js'
import {verifedUser} from '../middlewares/userVerify.js'
import {emailValidation} from "../validators/auth.email.valid.js"

const userRouter = Router()

userRouter.post("/otpsend",emailValidation,otpSend)
userRouter.post('/otpVerify',otpVerify)
userRouter.post("/register",registerValidation,register)

userRouter.post("/login",login)
userRouter.post("/refreshToken",refreshToken)

userRouter.get("/getMe",verifedUser,getMe)

export default userRouter


