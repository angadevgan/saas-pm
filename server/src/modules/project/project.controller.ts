import { Response } from 'express'
import { AuthRequest } from '../../middlewares/auth.middleware'
import * as projectService from './project.service'
import { sendSuccess, sendError } from '../../utils/response.utils'

export const createProject = async (req: AuthRequest, res: Response) => {
  try {
    const { name, description, coverColor } = req.body
    const { workspaceId } = req.params
    if (!name) return sendError(res, 'Project name is required', 400)
    const project = await projectService.createProject(req.userId!, workspaceId as string, name, description, coverColor)
    return sendSuccess(res, project, 'Project created', 201)
  } catch (err: any) {
    return sendError(res, err.message)
  }
}

export const getProjects = async (req: AuthRequest, res: Response) => {
  try {
    const projects = await projectService.getWorkspaceProjects(req.userId!, req.params.workspaceId as string)
    return sendSuccess(res, projects, 'Projects fetched')
  } catch (err: any) {
    return sendError(res, err.message)
  }
}

export const getProject = async (req: AuthRequest, res: Response) => {
  try {
    const project = await projectService.getProjectById(req.userId!, req.params.projectId as string)
    return sendSuccess(res, project, 'Project fetched')
  } catch (err: any) {
    return sendError(res, err.message, 404)
  }
}

export const updateProject = async (req: AuthRequest, res: Response) => {
  try {
    const project = await projectService.updateProject(req.userId!, req.params.projectId as string, req.body)
    return sendSuccess(res, project, 'Project updated')
  } catch (err: any) {
    return sendError(res, err.message, 403)
  }
}

export const deleteProject = async (req: AuthRequest, res: Response) => {
  try {
    await projectService.deleteProject(req.userId!, req.params.projectId as string)
    return sendSuccess(res, null, 'Project deleted')
  } catch (err: any) {
    return sendError(res, err.message, 403)
  }
}

export const getActivity = async (req: AuthRequest, res: Response) => {
  try {
    const logs = await projectService.getProjectActivity(req.userId!, req.params.projectId as string)
    return sendSuccess(res, logs, 'Activity fetched')
  } catch (err: any) {
    return sendError(res, err.message)
  }
}