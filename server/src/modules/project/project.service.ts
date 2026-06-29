import { prisma } from '../../config/db'
import { Role } from '@prisma/client'

const DEFAULT_COLUMNS = [
  { name: 'To Do',       order: 0, color: '#e2e8f0' },
  { name: 'In Progress', order: 1, color: '#fef9c3' },
  { name: 'In Review',   order: 2, color: '#dbeafe' },
  { name: 'Done',        order: 3, color: '#dcfce7' },
]

export const createProject = async (
  userId: string,
  workspaceId: string,
  name: string,
  description?: string,
  coverColor?: string
) => {
  const member = await prisma.workspaceMember.findUnique({
    where: { userId_workspaceId: { userId, workspaceId } }
  })
  if (!member) throw new Error('Access denied')
  if (member.role === Role.VIEWER) throw new Error('Viewers cannot create projects')

  const project = await prisma.project.create({
    data: {
      name,
      description,
      coverColor: coverColor || '#6366f1',
      workspaceId,
      columns: {
        create: DEFAULT_COLUMNS
      }
    },
    include: { columns: true }
  })

  await prisma.activityLog.create({
    data: {
      action: 'CREATED',
      entity: 'PROJECT',
      entityId: project.id,
      userId,
      projectId: project.id,
    }
  })

  return project
}

export const getWorkspaceProjects = async (userId: string, workspaceId: string) => {
  const member = await prisma.workspaceMember.findUnique({
    where: { userId_workspaceId: { userId, workspaceId } }
  })
  if (!member) throw new Error('Access denied')

  return prisma.project.findMany({
    where: { workspaceId },
    include: {
      _count: { select: { tasks: true } },
      columns: { orderBy: { order: 'asc' } }
    },
    orderBy: { createdAt: 'desc' }
  })
}

export const getProjectById = async (userId: string, projectId: string) => {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      workspace: {
        include: { members: true }
      },
      columns: {
        orderBy: { order: 'asc' },
        include: {
          tasks: {
            orderBy: { order: 'asc' },
            include: {
              assignee: { select: { id: true, name: true, avatarUrl: true } },
              creator:  { select: { id: true, name: true, avatarUrl: true } },
              _count:   { select: { comments: true, attachments: true } }
            }
          }
        }
      }
    }
  })

  if (!project) throw new Error('Project not found')

  const isMember = project.workspace.members.some(m => m.userId === userId)
  if (!isMember) throw new Error('Access denied')

  return project
}

export const updateProject = async (
  userId: string,
  projectId: string,
  data: { name?: string; description?: string; coverColor?: string }
) => {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { workspace: { include: { members: true } } }
  })
  if (!project) throw new Error('Project not found')

  const member = project.workspace.members.find(m => m.userId === userId)
  if (!member) throw new Error('Access denied')
  if (member.role === Role.VIEWER) throw new Error('Permission denied')

  return prisma.project.update({ where: { id: projectId }, data })
}

export const deleteProject = async (userId: string, projectId: string) => {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { workspace: { include: { members: true } } }
  })
  if (!project) throw new Error('Project not found')

  const member = project.workspace.members.find(m => m.userId === userId)
  if (!member || (member.role !== Role.OWNER && member.role !== Role.ADMIN)) {
    throw new Error('Permission denied')
  }

  return prisma.project.delete({ where: { id: projectId } })
}

export const getProjectActivity = async (userId: string, projectId: string) => {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { workspace: { include: { members: true } } }
  })
  if (!project) throw new Error('Project not found')

  const isMember = project.workspace.members.some(m => m.userId === userId)
  if (!isMember) throw new Error('Access denied')

  return prisma.activityLog.findMany({
    where: { projectId },
    include: { user: { select: { id: true, name: true, avatarUrl: true } } },
    orderBy: { createdAt: 'desc' },
    take: 50
  })
}