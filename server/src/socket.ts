import { Server } from 'socket.io'
import http from 'http'

let io: Server

export const initSocket = (server: http.Server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      credentials: true,
    },
  })

  io.on('connection', (socket) => {
    console.log(`🔌 Client connected: ${socket.id}`)

    socket.on('join-project', (projectId: string) => {
      socket.join(`project:${projectId}`)
      console.log(`Socket ${socket.id} joined project:${projectId}`)
    })

    socket.on('leave-project', (projectId: string) => {
      socket.leave(`project:${projectId}`)
    })

    socket.on('disconnect', () => {
      console.log(`❌ Client disconnected: ${socket.id}`)
    })
  })

  return io
}

export const getIO = () => {
  if (!io) throw new Error('Socket.io not initialized')
  return io
}