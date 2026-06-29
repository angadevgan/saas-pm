import { Router } from 'express'
import { authenticate } from '../../middlewares/auth.middleware'
import { uploadAttachment } from './upload.controller'
import multer from 'multer'

const upload = multer({ dest: 'uploads/' })
const router = Router()

router.use(authenticate)

router.post('/task/:taskId', upload.single('file'), uploadAttachment)

export default router