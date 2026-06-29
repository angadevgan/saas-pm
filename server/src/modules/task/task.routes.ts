import { Router } from 'express'
import { authenticate } from '../../middlewares/auth.middleware'
import {
  createTask, getTask, updateTask,
  moveTask, deleteTask, addComment, deleteComment
} from './task.controller'

const router = Router()

router.use(authenticate)

router.post('/:projectId/column/:columnId',  createTask)
router.get('/:taskId',                       getTask)
router.put('/:taskId',                       updateTask)
router.patch('/:taskId/move',                moveTask)
router.delete('/:taskId',                    deleteTask)
router.post('/:taskId/comments',             addComment)
router.delete('/comments/:commentId',        deleteComment)

export default router