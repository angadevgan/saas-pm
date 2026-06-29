import { Response } from 'express'
import { AuthRequest } from '../../middlewares/auth.middleware'
import { v2 as cloudinary } from 'cloudinary'
import { prisma } from '../../config/db'
import { sendSuccess, sendError } from '../../utils/response.utils'

export const uploadAttachment = async (req: AuthRequest, res: Response) => {
  try {
    const { taskId } = req.params
    if (!req.file) return sendError(res, 'No file uploaded', 400)

    const task = await prisma.task.findUnique({ where: { id: taskId as string } })
    if (!task) return sendError(res, 'Task not found', 404)

    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: `saaspm/tasks/${taskId}`,
      resource_type: 'auto',
    })

    const attachment = await prisma.attachment.create({
      data: {
        fileName: req.file.originalname,
        fileUrl:  result.secure_url,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
        taskId:   taskId as string,
      }
    })

    return sendSuccess(res, attachment, 'File uploaded', 201)
  } catch (err: any) {
    return sendError(res, err.message)
  }
}