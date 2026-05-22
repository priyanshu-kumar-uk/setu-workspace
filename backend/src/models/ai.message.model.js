import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({

    chatId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "chat",
        required: true,
        index:true
    },

    role: {
        type: String,
        enum: ["user", "assistant", "system", "tool"],
        required: true
    },

    content: {
        type: String,
        default: ""
    },

    toolName: {
        type: String,
        default: null
    },

    toolCallId: {
        type: String,
        default: null
    },

    metadata:{
        type:Object,
        default:{}
    }

},{ timestamps:true });

const messageModel = mongoose.model("message", messageSchema);

export default messageModel;