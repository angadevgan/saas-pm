import { useEffect, useRef } from 'react'
import { io, Socket } from 'socket.io-client'
import { useAuthStore } from '../store/auth.store'

export const useSocket = (projectId?: string) => {
  const socketRef = useRef<Socket | null>(null)
  const { isAuthenticated } = useAuthStore()

  useEffect(() => {
    if (!isAuthenticated) return

    socketRef.current = io('http://localhost:5000', { withCredentials: true })

    if (projectId) {
      socketRef.current.emit('join-project', projectId)
    }

    return () => {
      if (projectId) socketRef.current?.emit('leave-project', projectId)
      socketRef.current?.disconnect()
    }
  }, [projectId, isAuthenticated])

  return socketRef.current
}