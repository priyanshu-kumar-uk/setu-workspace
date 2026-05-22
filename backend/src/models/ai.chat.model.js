import mongoose from "mongoose";

const chatSchema = new mongoose.Schema({

    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"user",
        required:true,
        index:true
    },

    title:{
        type:String,
        default:"New Chat",
        trim:true
    },

    type:{
        type:String,
        enum:["dashboard","room"],
        default:"dashboard"
    },

    roomId:{
        type:String,
        default:null
    },

    lastMessageAt:{
        type:Date,
        default:Date.now
    },

    metadata:{
        type:Object,
        default:{}
    }

},{
    timestamps:true
});

// Compound index for sorted chat listing per user
chatSchema.index({ userId: 1, updatedAt: -1 });

const chatModel = mongoose.model("chat",chatSchema);

export default chatModel;