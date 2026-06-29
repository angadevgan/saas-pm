import { Response } from 'express'
import { AuthRequest } from '../../middlewares/auth.middleware'
import * as workspaceService from './workspace.service'
import { sendSuccess, sendError } from '../../utils/response.utils'

export const createWorkspace = async (req: AuthRequest, res: Response) => {
  try {
    const { name, description } = req.body
    if (!name) return sendError(res, 'Workspace name is required', 400)
    const workspace = await workspaceService.createWorkspace(req.userId!, name, description)
    return sendSuccess(res, workspace, 'Workspace created', 201)
  } catch (err: any) {
    return sendError(res, err.message)
  }
}

export const getMyWorkspaces = async (req: AuthRequest, res: Response) => {
  try {
    const workspaces = await workspaceService.getUserWorkspaces(req.userId!)
    return sendSuccess(res, workspaces, 'Workspaces fetched')
  } catch (err: any) {
    return sendError(res, err.message)
  }
}

export const getWorkspace = async (req: AuthRequest, res: Response) => {
  try {
    const workspace = await workspaceService.getWorkspaceBySlug(req.params.slug as string, req.userId!)
    return sendSuccess(res, workspace, 'Workspace fetched')
  } catch (err: any) {
    return sendError(res, err.message, 404)
  }
}

export const updateWorkspace = async (req: AuthRequest, res: Response) => {
  try {
    const workspace = await workspaceService.updateWorkspace(req.params.id as string, req.userId!, req.body)
    return sendSuccess(res, workspace, 'Workspace updated')
  } catch (err: any) {
    return sendError(res, err.message, 403)
  }
}

export const deleteWorkspace = async (req: AuthRequest, res: Response) => {
  try {
    await workspaceService.deleteWorkspace(req.params.id as string, req.userId!)
    return sendSuccess(res, null, 'Workspace deleted')
  } catch (err: any) {
    return sendError(res, err.message, 403)
  }
}

export const getMembers = async (req: AuthRequest, res: Response) => {
  try {
    const members = await workspaceService.getWorkspaceMembers(req.params.id as string, req.userId!)
    return sendSuccess(res, members, 'Members fetched')
  } catch (err: any) {
    return sendError(res, err.message, 403)
  }
}