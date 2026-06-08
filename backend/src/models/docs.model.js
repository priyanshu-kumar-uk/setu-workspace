import mongoose from 'mongoose'
const docsSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            default: 'Untitled Document',
            trim: true,
        },
        contentJSON: {
            type: mongoose.Schema.Types.Mixed,
            default: null,
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user',
            required: true,
            index: true,
        },
    },
    { timestamps: true }
)
const docsModel = mongoose.model('docs', docsSchema)
export default docsModel
