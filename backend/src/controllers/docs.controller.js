import { asyncHandler } from '../utils/asynchandlar.js'
import { ApiResponse } from '../utils/api.res.js'
import { ApiError } from '../utils/api.error.js'
import docsModel from '../models/docs.model.js'
export const createDoc = asyncHandler(async (req, res) => {
    const userId = req.user.id
    const doc = await docsModel.create({
        createdBy: userId,
        title: 'Untitled Document',
        contentJSON: null,
    })
    return res.status(201).json(new ApiResponse(201, doc, 'Document created'))
})
export const getAllDocs = asyncHandler(async (req, res) => {
    const userId = req.user.id
    const docs = await docsModel
        .find({ createdBy: userId })
        .sort({ updatedAt: -1 })
        .select('title createdAt updatedAt')
        .lean()
    return res.status(200).json(new ApiResponse(200, docs, 'Documents fetched'))
})
export const getDoc = asyncHandler(async (req, res) => {
    const userId = req.user.id
    const { id } = req.params
    const doc = await docsModel.findOne({ _id: id, createdBy: userId })
    if (!doc) {
        throw new ApiError(404, 'Document not found')
    }
    return res.status(200).json(new ApiResponse(200, doc, 'Document fetched'))
})
export const updateDoc = asyncHandler(async (req, res) => {
    const userId = req.user.id
    const { id } = req.params
    const { title, contentJSON } = req.body
    const doc = await docsModel.findOne({ _id: id, createdBy: userId })
    if (!doc) {
        throw new ApiError(404, 'Document not found')
    }
    if (title !== undefined) doc.title = title
    if (contentJSON !== undefined) {
        doc.contentJSON = contentJSON
        doc.markModified('contentJSON')
    }
    await doc.save()
    return res.status(200).json(new ApiResponse(200, { _id: doc._id, title: doc.title, updatedAt: doc.updatedAt }, 'Document saved'))
})
export const deleteDoc = asyncHandler(async (req, res) => {
    const userId = req.user.id
    const { id } = req.params
    const doc = await docsModel.findOneAndDelete({ _id: id, createdBy: userId })
    if (!doc) {
        throw new ApiError(404, 'Document not found')
    }
    return res.status(200).json(new ApiResponse(200, null, 'Document deleted'))
})
