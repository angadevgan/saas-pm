import { prisma } from '../../config/db'
import { TaskPriority, TaskStatus } from '@prisma/client'
import { getIO } from '../../socket'

const checkProjectAccess = async (userId: string, projectId: string) => {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { workspace: { include: { members: true } } }
  })
  if (!project) throw new Error('Project not found')
  const member = project.workspace.members.find(m => m.userId === userId)
  if (!member) throw new Error('Access denied')
  return { project, member }
}

export const createTask = async (
  userId: string,
  projectId: string,
  columnId: string,
  data: {
    title: string
    description?: string
    priority?: TaskPriority
    assigneeId?: string
    dueDate?: string
  }
) => {
  const { project, member } = await checkProjectAccess(userId, projectId)
  if (member.role === 'VIEWER') throw new Error('Viewers cannot create tasks')

  const lastTask = await prisma.task.findFirst({
    where: { columnId },
    orderBy: { order: 'desc' }
  })
  const order = lastTask ? lastTask.order + 1 : 0

  const task = await prisma.task.create({
    data: {
      title: data.title,
      description: data.description,
      priority: data.priority || TaskPriority.MEDIUM,
      status: TaskStatus.TODO,
      order,
      dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
      columnId,
      projectId,
      creatorId: userId,
      assigneeId: data.assigneeId,
    },
    include: {
      assignee: { select: { id: true, name: true, avatarUrl: true } },
      creator:  { select: { id: true, name: true, avatarUrl: true } },
    }
  })

  await prisma.activityLog.create({
    data: {
      action: 'CREATED', entity: 'TASK',
      entityId: task.id, userId,
      projectId, taskId: task.id,
      metadata: { title: task.title }
    }
  })

  // Emit real-time event to all users in this project
  try {
    getIO().to(`project:${projectId}`).emit('task:created', task)
  } catch {}

  return task
}

export const updateTask = async (
  userId: string,
  taskId: string,
  data: {
    title?: string
    description?: string
    priority?: TaskPriority
    assigneeId?: string
    dueDate?: string | null
  }
) => {
  const task = await prisma.task.findUnique({ where: { id: taskId } })
  if (!task) throw new Error('Task not found')

  const { member } = await checkProjectAccess(userId, task.projectId)
  if (member.role === 'VIEWER') throw new Error('Permission denied')

  const updated = await prisma.task.update({
    where: { id: taskId },
    data: {
      ...data,
      dueDate: data.dueDate === null ? null : data.dueDate ? new Date(data.dueDate) : undefined,
    },
    include: {
      assignee: { select: { id: true, name: true, avatarUrl: true } },
      creator:  { select: { id: true, name: true, avatarUrl: true } },
    }
  })

  await prisma.activityLog.create({
    data: {
      action: 'UPDATED', entity: 'TASK',
      entityId: taskId, userId,
      projectId: task.projectId, taskId,
      metadata: data
    }
  })

  try {
    getIO().to(`project:${task.projectId}`).emit('task:updated', updated)
  } catch {}

  return updated
}

export const moveTask = async (
  userId: string,
  taskId: string,
  newColumnId: string,
  newOrder: number
) => {
  const task = await prisma.task.findUnique({ where: { id: taskId } })
  if (!task) throw new Error('Task not found')

  await checkProjectAccess(userId, task.projectId)

  const column = await prisma.column.findUnique({ where: { id: newColumnId } })
  if (!column) throw new Error('Column not found')

  // Shift other tasks in the target column
  await prisma.task.updateMany({
    where: { columnId: newColumnId, order: { gte: newOrder }, id: { not: taskId } },
    data: { order: { increment: 1 } }
  })

  const updated = await prisma.task.update({
    where: { id: taskId },
    data: { columnId: newColumnId, order: newOrder },
    include: {
      assignee: { select: { id: true, name: true, avatarUrl: true } },
      creator:  { select: { id: true, name: true, avatarUrl: true } },
    }
  })

  await prisma.activityLog.create({
    data: {
      action: 'MOVED', entity: 'TASK',
      entityId: taskId, userId,
      projectId: task.projectId, taskId,
      metadata: { toColumn: column.name }
    }
  })

  try {
    getIO().to(`project:${task.projectId}`).emit('task:moved', updated)
  } catch {}

  return updated
}

export const deleteTask = async (userId: string, taskId: string) => {
  const task = await prisma.task.findUnique({ where: { id: taskId } })
  if (!task) throw new Error('Task not found')

  const { member } = await checkProjectAccess(userId, task.projectId)
  if (member.role === 'VIEWER') throw new Error('Permission denied')

  await prisma.task.delete({ where: { id: taskId } })

  try {
    getIO().to(`project:${task.projectId}`).emit('task:deleted', { taskId, projectId: task.projectId })
  } catch {}
}

export const getTaskById = async (userId: string, taskId: string) => {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: {
      assignee:    { select: { id: true, name: true, avatarUrl: true } },
      creator:     { select: { id: true, name: true, avatarUrl: true } },
      comments:    { include: { author: { select: { id: true, name: true, avatarUrl: true } } }, orderBy: { createdAt: 'asc' } },
      attachments: true,
      column:      { select: { id: true, name: true } },
    }
  })
  if (!task) throw new Error('Task not found')
  await checkProjectAccess(userId, task.projectId)
  return task
}

export const addComment = async (userId: string, taskId: string, content: string) => {
  const task = await prisma.task.findUnique({ where: { id: taskId } })
  if (!task) throw new Error('Task not found')
  await checkProjectAccess(userId, task.projectId)

  const comment = await prisma.comment.create({
    data: { content, taskId, authorId: userId },
    include: { author: { select: { id: true, name: true, avatarUrl: true } } }
  })

  try {
    getIO().to(`project:${task.projectId}`).emit('task:commented', { taskId, comment })
  } catch {}

  return comment
}

export const deleteComment = async (userId: string, commentId: string) => {
  const comment = await prisma.comment.findUnique({ where: { id: commentId } })
  if (!comment) throw new Error('Comment not found')
  if (comment.authorId !== userId) throw new Error('You can only delete your own comments')
  return prisma.comment.delete({ where: { id: commentId } })
}