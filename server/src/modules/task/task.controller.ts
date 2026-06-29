import { Response } from 'express'
import { AuthRequest } from '../../middlewares/auth.middleware'
import * as taskService from './task.service'
import { sendSuccess, sendError } from '../../utils/response.utils'

export const createTask = async (req: AuthRequest, res: Response) => {
  try {
    const { projectId, columnId } = req.params
    if (!req.body.title) return sendError(res, 'Title is required', 400)
    const task = await taskService.createTask(req.userId!, projectId as string, columnId as string, req.body)
    return sendSuccess(res, task, 'Task created', 201)
  } catch (err: any) {
    return sendError(res, err.message)
  }
}

export const getTask = async (req: AuthRequest, res: Response) => {
  try {
    const task = await taskService.getTaskById(req.userId!, req.params.taskId as string)
    return sendSuccess(res, task, 'Task fetched')
  } catch (err: any) {
    return sendError(res, err.message, 404)
  }
}

export const updateTask = async (req: AuthRequest, res: Response) => {
  try {
    const task = await taskService.updateTask(req.userId!, req.params.taskId as string, req.body)
    return sendSuccess(res, task, 'Task updated')
  } catch (err: any) {
    return sendError(res, err.message)
  }
}

export const moveTask = async (req: AuthRequest, res: Response) => {
  try {
    const { columnId, order } = req.body
    if (!columnId || order === undefined) return sendError(res, 'columnId and order are required', 400)
    const task = await taskService.moveTask(req.userId!, req.params.taskId as string, columnId, order)
    return sendSuccess(res, task, 'Task moved')
  } catch (err: any) {
    return sendError(res, err.message)
  }
}

export const deleteTask = async (req: AuthRequest, res: Response) => {
  try {
    await taskService.deleteTask(req.userId!, req.params.taskId as string)
    return sendSuccess(res, null, 'Task deleted')
  } catch (err: any) {
    return sendError(res, err.message)
  }
}

export const addComment = async (req: AuthRequest, res: Response) => {
  try {
    const { content } = req.body
    if (!content) return sendError(res, 'Content is required', 400)
    const comment = await taskService.addComment(req.userId!, req.params.taskId as string, content)
    return sendSuccess(res, comment, 'Comment added', 201)
  } catch (err: any) {
    return sendError(res, err.message)
  }
}

export const deleteComment = async (req: AuthRequest, res: Response) => {
  try {
    await taskService.deleteComment(req.userId!, req.params.commentId as string)
    return sendSuccess(res, null, 'Comment deleted')
  } catch (err: any) {
    return sendError(res, err.message)
  }
}