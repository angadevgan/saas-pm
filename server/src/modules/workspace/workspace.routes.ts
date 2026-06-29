import { Router } from 'express'
import { authenticate } from '../../middlewares/auth.middleware'
import {
  createWorkspace,
  getMyWorkspaces,
  getWorkspace,
  updateWorkspace,
  deleteWorkspace,
  getMembers,
} from './workspace.controller'

const router = Router()

router.use(authenticate)

router.post('/',              createWorkspace)
router.get('/',               getMyWorkspaces)
router.get('/:slug',          getWorkspace)
router.put('/:id',            updateWorkspace)
router.delete('/:id',         deleteWorkspace)
router.get('/:id/members',    getMembers)

export default router