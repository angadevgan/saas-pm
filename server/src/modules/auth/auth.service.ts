import bcrypt from 'bcryptjs'
import { prisma } from '../../config/db'
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../../utils/jwt.utils'

export const registerUser = async (name: string, email: string, password: string) => {
  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) throw new Error('Email already in use')

  const hashed = await bcrypt.hash(password, 12)

  const user = await prisma.user.create({
    data: { name, email, password: hashed },
    select: { id: true, name: true, email: true, avatarUrl: true, createdAt: true }
  })

  const accessToken  = generateAccessToken(user.id)
  const refreshToken = generateRefreshToken(user.id)

  await prisma.user.update({
    where: { id: user.id },
    data: { refreshToken }
  })

  return { user, accessToken, refreshToken }
}

export const loginUser = async (email: string, password: string) => {
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user || !user.password) throw new Error('Invalid email or password')

  const valid = await bcrypt.compare(password, user.password)
  if (!valid) throw new Error('Invalid email or password')

  const accessToken  = generateAccessToken(user.id)
  const refreshToken = generateRefreshToken(user.id)

  await prisma.user.update({
    where: { id: user.id },
    data: { refreshToken }
  })

  const { password: _, refreshToken: __, ...safeUser } = user
  return { user: safeUser, accessToken, refreshToken }
}

export const refreshAccessToken = async (token: string) => {
  const decoded = verifyRefreshToken(token)
  const user = await prisma.user.findUnique({ where: { id: decoded.userId } })

  if (!user || user.refreshToken !== token) throw new Error('Invalid refresh token')

  const accessToken  = generateAccessToken(user.id)
  const refreshToken = generateRefreshToken(user.id)

  await prisma.user.update({
    where: { id: user.id },
    data: { refreshToken }
  })

  return { accessToken, refreshToken }
}

export const logoutUser = async (userId: string) => {
  await prisma.user.update({
    where: { id: userId },
    data: { refreshToken: null }
  })
}

export const getMe = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, avatarUrl: true, createdAt: true }
  })
  if (!user) throw new Error('User not found')
  return user
}