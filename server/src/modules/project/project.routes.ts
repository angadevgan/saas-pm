import { Router } from 'express'
import { authenticate } from '../../middlewares/auth.middleware'
import {
  createProject,
  getProjects,
  getProject,
  updateProject,
  deleteProject,
  getActivity,
} from './project.controller'

const router = Router()

router.use(authenticate)

router.post('/workspace/:workspaceId',            createProject)
router.get('/workspace/:workspaceId',             getProjects)
router.get('/:projectId',                         getProject)
router.put('/:projectId',                         updateProject)
router.delete('/:projectId',                      deleteProject)
router.get('/:projectId/activity',               getActivity)

export default router