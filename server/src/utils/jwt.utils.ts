import jwt from 'jsonwebtoken'

const ACCESS_SECRET  = process.env.JWT_ACCESS_SECRET!
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!

export const generateAccessToken = (userId: string) => {
  return jwt.sign({ userId }, ACCESS_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRES || '15m',
  } as jwt.SignOptions)
}

export const generateRefreshToken = (userId: string) => {
  return jwt.sign({ userId }, REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES || '7d',
  } as jwt.SignOptions)
}

export const verifyAccessToken = (token: string) => {
  return jwt.verify(token, ACCESS_SECRET) as { userId: string }
}

export const verifyRefreshToken = (token: string) => {
  return jwt.verify(token, REFRESH_SECRET) as { userId: string }
}