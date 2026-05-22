import { Router } from 'express'
import { verifedUser } from '../middlewares/userVerify.js'
import {createDoc, getAllDocs, getDoc, updateDoc, deleteDoc,} from '../controllers/docs.controller.js'

const docsRouter = Router()

docsRouter.post('/', verifedUser, createDoc)
docsRouter.get('/', verifedUser, getAllDocs)
docsRouter.get('/:id', verifedUser, getDoc)
docsRouter.patch('/:id', verifedUser, updateDoc)
docsRouter.delete('/:id', verifedUser, deleteDoc)

export default docsRouter
