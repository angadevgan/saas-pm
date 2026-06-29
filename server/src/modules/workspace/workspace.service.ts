import { prisma } from '../../config/db'
import { Role } from '@prisma/client'

const generateSlug = (name: string) => {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + '-' + Date.now()
}

export const createWorkspace = async (userId: string, name: string, description?: string) => {
  const slug = generateSlug(name)

  const workspace = await prisma.workspace.create({
    data: {
      name,
      slug,
      description,
      members: {
        create: { userId, role: Role.OWNER }
      }
    },
    include: { members: { include: { user: { select: { id: true, name: true, email: true, avatarUrl: true } } } } }
  })

  return workspace
}

export const getUserWorkspaces = async (userId: string) => {
  const memberships = await prisma.workspaceMember.findMany({
    where: { userId },
    include: {
      workspace: {
        include: {
          _count: { select: { members: true, projects: true } }
        }
      }
    }
  })

  return memberships.map(m => ({
    ...m.workspace,
    role: m.role,
  }))
}

export const getWorkspaceBySlug = async (slug: string, userId: string) => {
  const workspace = await prisma.workspace.findUnique({
    where: { slug },
    include: {
      members: {
        include: {
          user: { select: { id: true, name: true, email: true, avatarUrl: true } }
        }
      },
      projects: {
        select: { id: true, name: true, description: true, coverColor: true, createdAt: true }
      }
    }
  })

  if (!workspace) throw new Error('Workspace not found')

  const isMember = workspace.members.some(m => m.userId === userId)
  if (!isMember) throw new Error('Access denied')

  return workspace
}

export const updateWorkspace = async (workspaceId: string, userId: string, data: { name?: string; description?: string }) => {
  const member = await prisma.workspaceMember.findUnique({
    where: { userId_workspaceId: { userId, workspaceId } }
  })

  if (!member || (member.role !== Role.OWNER && member.role !== Role.ADMIN)) {
    throw new Error('Permission denied')
  }

  return prisma.workspace.update({
    where: { id: workspaceId },
    data,
  })
}

export const deleteWorkspace = async (workspaceId: string, userId: string) => {
  const member = await prisma.workspaceMember.findUnique({
    where: { userId_workspaceId: { userId, workspaceId } }
  })

  if (!member || member.role !== Role.OWNER) throw new Error('Only owner can delete workspace')

  return prisma.workspace.delete({ where: { id: workspaceId } })
}

export const getWorkspaceMembers = async (workspaceId: string, userId: string) => {
  const isMember = await prisma.workspaceMember.findUnique({
    where: { userId_workspaceId: { userId, workspaceId } }
  })
  if (!isMember) throw new Error('Access denied')

  return prisma.workspaceMember.findMany({
    where: { workspaceId },
    include: {
      user: { select: { id: true, name: true, email: true, avatarUrl: true } }
    }
  })
}