import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import cookieParser from 'cookie-parser'

import authRoutes from './modules/auth/auth.routes'
import workspaceRoutes from './modules/workspace/workspace.routes'
import projectRoutes from './modules/project/project.routes'
import taskRoutes from './modules/task/task.routes'
import memberRoutes from './modules/member/member.routes'
import uploadRoutes from './modules/upload/upload.routes'
import { errorMiddleware } from './middlewares/error.middleware'

const app = express()

app.use(helmet())
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}))
app.use(morgan('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', message: 'SaaS-PM API is running' })
})

app.use('/api/auth', authRoutes)
app.use('/api/workspaces', workspaceRoutes)
app.use('/api/projects', projectRoutes)
app.use('/api/tasks', taskRoutes)
app.use('/api/members', memberRoutes)
app.use('/api/upload', uploadRoutes)

app.use(errorMiddleware)

export default app