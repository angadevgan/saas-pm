import { Response } from 'express'
import { AuthRequest } from '../../middlewares/auth.middleware'
import * as memberService from './member.service'
import { sendSuccess, sendError } from '../../utils/response.utils'
import { Role } from '@prisma/client'

export const updateRole = async (req: AuthRequest, res: Response) => {
  try {
    const { workspaceId, userId } = req.params
    const { role } = req.body
    if (!role) return sendError(res, 'Role is required', 400)
    const member = await memberService.updateMemberRole(req.userId!, workspaceId as string, userId as string, role as Role)
    return sendSuccess(res, member, 'Role updated')
  } catch (err: any) {
    return sendError(res, err.message, 403)
  }
}

export const removeMember = async (req: AuthRequest, res: Response) => {
  try {
    const { workspaceId, userId } = req.params
    await memberService.removeMember(req.userId!, workspaceId as string, userId as string)
    return sendSuccess(res, null, 'Member removed')
  } catch (err: any) {
    return sendError(res, err.message, 403)
  }
}

export const leaveWorkspace = async (req: AuthRequest, res: Response) => {
  try {
    await memberService.leaveWorkspace(req.userId!, req.params.workspaceId as string)
    return sendSuccess(res, null, 'Left workspace')
  } catch (err: any) {
    return sendError(res, err.message, 403)
  }
}

export const inviteMember = async (req: AuthRequest, res: Response) => {
  try {
    const { workspaceId } = req.params
    const { email, role } = req.body
    if (!email) return sendError(res, 'Email is required', 400)
    const invite = await memberService.inviteMember(req.userId!, workspaceId as string, email, role || Role.MEMBER)
    return sendSuccess(res, invite, 'Invite created', 201)
  } catch (err: any) {
    return sendError(res, err.message, 403)
  }
}

export const acceptInvite = async (req: AuthRequest, res: Response) => {
  try {
    const { token } = req.params
    const member = await memberService.acceptInvite(req.userId!, token as string)
    return sendSuccess(res, member, 'Invite accepted')
  } catch (err: any) {
    return sendError(res, err.message, 400)
  }
}