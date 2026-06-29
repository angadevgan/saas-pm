import { prisma } from '../../config/db'
import { Role } from '@prisma/client'

export const updateMemberRole = async (
  requesterId: string,
  workspaceId: string,
  targetUserId: string,
  newRole: Role
) => {
  const requester = await prisma.workspaceMember.findUnique({
    where: { userId_workspaceId: { userId: requesterId, workspaceId } }
  })
  if (!requester || (requester.role !== Role.OWNER && requester.role !== Role.ADMIN)) {
    throw new Error('Permission denied')
  }
  if (targetUserId === requesterId) throw new Error('Cannot change your own role')

  return prisma.workspaceMember.update({
    where: { userId_workspaceId: { userId: targetUserId, workspaceId } },
    data: { role: newRole },
    include: { user: { select: { id: true, name: true, email: true, avatarUrl: true } } }
  })
}

export const removeMember = async (
  requesterId: string,
  workspaceId: string,
  targetUserId: string
) => {
  const requester = await prisma.workspaceMember.findUnique({
    where: { userId_workspaceId: { userId: requesterId, workspaceId } }
  })
  if (!requester || (requester.role !== Role.OWNER && requester.role !== Role.ADMIN)) {
    throw new Error('Permission denied')
  }
  if (targetUserId === requesterId) throw new Error('Cannot remove yourself')

  return prisma.workspaceMember.delete({
    where: { userId_workspaceId: { userId: targetUserId, workspaceId } }
  })
}

export const leaveWorkspace = async (userId: string, workspaceId: string) => {
  const member = await prisma.workspaceMember.findUnique({
    where: { userId_workspaceId: { userId, workspaceId } }
  })
  if (!member) throw new Error('You are not a member')
  if (member.role === Role.OWNER) throw new Error('Owner cannot leave. Transfer ownership first.')

  return prisma.workspaceMember.delete({
    where: { userId_workspaceId: { userId, workspaceId } }
  })
}

export const inviteMember = async (
  requesterId: string,
  workspaceId: string,
  email: string,
  role: Role
) => {
  const requester = await prisma.workspaceMember.findUnique({
    where: { userId_workspaceId: { userId: requesterId, workspaceId } }
  })
  if (!requester || (requester.role !== Role.OWNER && requester.role !== Role.ADMIN)) {
    throw new Error('Permission denied')
  }

  const existingUser = await prisma.user.findUnique({ where: { email } })
  if (existingUser) {
    const alreadyMember = await prisma.workspaceMember.findUnique({
      where: { userId_workspaceId: { userId: existingUser.id, workspaceId } }
    })
    if (alreadyMember) throw new Error('User is already a member')
  }

  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

  const invite = await prisma.invite.create({
    data: { email, role, workspaceId, expiresAt },
    include: { workspace: { select: { name: true } } }
  })

  return invite
}

export const acceptInvite = async (userId: string, token: string) => {
  const invite = await prisma.invite.findUnique({ where: { token } })
  if (!invite) throw new Error('Invalid invite token')
  if (invite.accepted) throw new Error('Invite already used')
  if (invite.expiresAt < new Date()) throw new Error('Invite has expired')

  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) throw new Error('User not found')
  if (user.email !== invite.email) throw new Error('This invite is for a different email')

  const alreadyMember = await prisma.workspaceMember.findUnique({
    where: { userId_workspaceId: { userId, workspaceId: invite.workspaceId } }
  })
  if (alreadyMember) throw new Error('Already a member')

  const [member] = await prisma.$transaction([
    prisma.workspaceMember.create({
      data: { userId, workspaceId: invite.workspaceId, role: invite.role }
    }),
    prisma.invite.update({
      where: { token },
      data: { accepted: true }
    })
  ])

  return member
}