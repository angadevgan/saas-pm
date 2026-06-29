import { Router } from 'express'
import { authenticate } from '../../middlewares/auth.middleware'
import { updateRole, removeMember, leaveWorkspace, inviteMember, acceptInvite } from './member.controller'

const router = Router()

router.use(authenticate)

router.post('/workspace/:workspaceId/invite',           inviteMember)
router.post('/invite/:token/accept',                    acceptInvite)
router.patch('/workspace/:workspaceId/user/:userId',    updateRole)
router.delete('/workspace/:workspaceId/user/:userId',   removeMember)
router.delete('/workspace/:workspaceId/leave',          leaveWorkspace)

export default router