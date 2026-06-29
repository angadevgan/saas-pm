import { Request, Response } from 'express'
import * as authService from './auth.service'
import { sendSuccess, sendError } from '../../utils/response.utils'
import { AuthRequest } from '../../middlewares/auth.middleware'

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body
    if (!name || !email || !password) return sendError(res, 'All fields required', 400)

    const result = await authService.registerUser(name, email, password)

    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })

    return sendSuccess(res, { user: result.user, accessToken: result.accessToken }, 'Registered successfully', 201)
  } catch (err: any) {
    return sendError(res, err.message, 400)
  }
}

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body
    if (!email || !password) return sendError(res, 'All fields required', 400)

    const result = await authService.loginUser(email, password)

    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })

    return sendSuccess(res, { user: result.user, accessToken: result.accessToken }, 'Logged in successfully')
  } catch (err: any) {
    return sendError(res, err.message, 401)
  }
}

export const refresh = async (req: Request, res: Response) => {
  try {
    const token = req.cookies?.refreshToken
    if (!token) return sendError(res, 'No refresh token', 401)

    const result = await authService.refreshAccessToken(token)

    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })

    return sendSuccess(res, { accessToken: result.accessToken }, 'Token refreshed')
  } catch (err: any) {
    return sendError(res, err.message, 401)
  }
}

export const logout = async (req: AuthRequest, res: Response) => {
  try {
    await authService.logoutUser(req.userId!)
    res.clearCookie('refreshToken')
    return sendSuccess(res, null, 'Logged out successfully')
  } catch (err: any) {
    return sendError(res, err.message)
  }
}

export const me = async (req: AuthRequest, res: Response) => {
  try {
    const user = await authService.getMe(req.userId!)
    return sendSuccess(res, user, 'User fetched')
  } catch (err: any) {
    return sendError(res, err.message, 404)
  }
}