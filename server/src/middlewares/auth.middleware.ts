import { Request, Response, NextFunction } from 'express'
import { verifyAccessToken } from '../utils/jwt.utils'
import { sendError } from '../utils/response.utils'

export interface AuthRequest extends Request {
  userId?: string
}

export const authenticate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendError(res, 'No token provided', 401)
    }

    const token = authHeader.split(' ')[1]
    const decoded = verifyAccessToken(token)
    req.userId = decoded.userId
    next()
  } catch {
    return sendError(res, 'Invalid or expired token', 401)
  }
}