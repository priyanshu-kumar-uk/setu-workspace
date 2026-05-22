import mongoose from 'mongoose'

const  userSchema = new mongoose.Schema({
    firstname: {
        type : String,
    },
    lastname:{
        type : String,
    },
    email:{
        type:String,
        // unique:true
    },
    password:{
        type: String,
        select:false  //password field will not be returned in query results by default
    },
    isVerified : {
        type: Boolean,
        default:false
    },
    otpCode: {
        type: String,
        default:null
    },
    otpExpiresAt:{
        type: Date,
        default:null
    },

    expireAt:{
        type:Date,
        default: ()=>Date.now()+10*60*1000,   
        expires: 0
    }

    // refreshToken:{
    //     type: String,
    //     default: null
    // }

},{timestamps:true})

const userModel = mongoose.model("user",userSchema)
export default userModel
