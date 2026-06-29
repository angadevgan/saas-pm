export interface User {
  id: string
  name: string
  email: string
  avatarUrl?: string
  createdAt: string
}

export interface Workspace {
  id: string
  name: string
  slug: string
  description?: string
  role: 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER'
  _count?: { members: number; projects: number }
}

export interface Project {
  id: string
  name: string
  description?: string
  coverColor: string
  workspaceId: string
  columns: Column[]
  createdAt: string
}

export interface Column {
  id: string
  name: string
  order: number
  color: string
  tasks: Task[]
}

export interface Task {
  id: string
  title: string
  description?: string
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  status: 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE'
  order: number
  dueDate?: string
  columnId: string
  projectId: string
  assignee?: { id: string; name: string; avatarUrl?: string }
  creator:   { id: string; name: string; avatarUrl?: string }
  _count?: { comments: number; attachments: number }
}

export interface Comment {
  id: string
  content: string
  createdAt: string
  author: { id: string; name: string; avatarUrl?: string }
}