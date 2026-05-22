import jwt from "jsonwebtoken";
import { ApiError } from "../utils/api.error.js";
import { asyncHandler } from "../utils/asynchandlar.js";
import config from '../config/config.js'

export const verifedUser = asyncHandler(async function (req,res,next) {
    const  userToken = req.cookies.refreshToken

    if(!userToken){
        throw new ApiError(401,"Session expired, please login again")
    }

   try{
     const decode = jwt.verify(userToken,config.TOKEN)

     req.user = decode
     next()
      
   } catch(error){
      new ApiError(401,"Invalid token")
   }

})