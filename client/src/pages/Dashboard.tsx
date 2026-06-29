import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { useAuth } from '../hooks/useAuth'
import api from '../api/axios'
import { Workspace } from '../types'

const COLORS = ['#6366f1','#f59e0b','#10b981','#ef4444','#3b82f6','#8b5cf6']

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data: workspaces = [], isLoading } = useQuery({
    queryKey: ['workspaces'],
    queryFn: () => api.get('/workspaces').then(r => r.data.data as Workspace[])
  })

  const { mutate: createWorkspace } = useMutation({
    mutationFn: (name: string) => api.post('/workspaces', { name }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['workspaces'] }); toast.success('Workspace created!') },
    onError: () => toast.error('Failed to create workspace')
  })

  const handleCreate = () => {
    const name = prompt('Workspace name:')
    if (name?.trim()) createWorkspace(name.trim())
  }

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {greeting}, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Here's what's happening across your workspaces.</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4 mb-10">
        {[
          { label: 'Workspaces', value: workspaces.length, icon: '🏢', color: 'bg-indigo-50 dark:bg-indigo-900/20' },
          { label: 'Projects', value: workspaces.reduce((a, w) => a + (w._count?.projects || 0), 0), icon: '📁', color: 'bg-amber-50 dark:bg-amber-900/20' },
          { label: 'Members', value: workspaces.reduce((a, w) => a + (w._count?.members || 0), 0), icon: '👥', color: 'bg-emerald-50 dark:bg-emerald-900/20' },
        ].map(stat => (
          <div key={stat.label} className={`rounded-xl p-5 border border-gray-100 dark:border-dark-200 ${stat.color} dark:bg-opacity-10`}>
            <div className="text-2xl mb-2">{stat.icon}</div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">{stat.value}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Workspaces */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Your Workspaces</h2>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
        >
          <span>+</span> New Workspace
        </button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-3 gap-4">
          {[1,2,3].map(i => <div key={i} className="h-36 bg-gray-100 dark:bg-dark-100 rounded-xl animate-pulse" />)}
        </div>
      ) : workspaces.length === 0 ? (
        <div className="text-center py-24 border-2 border-dashed border-gray-200 dark:border-dark-200 rounded-2xl">
          <div className="text-5xl mb-4">🚀</div>
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">No workspaces yet</h3>
          <p className="text-gray-400 text-sm mt-1 mb-4">Create your first workspace to get started</p>
          <button onClick={handleCreate} className="bg-primary-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-primary-700 transition">
            Create Workspace
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {workspaces.map((ws, i) => (
            <div
              key={ws.id}
              onClick={() => navigate(`/workspace/${ws.slug}`)}
              className="group bg-white dark:bg-dark-100 border border-gray-200 dark:border-dark-200 rounded-xl p-5 cursor-pointer hover:border-primary-400 hover:shadow-lg transition-all duration-200"
            >
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0"
                  style={{ background: COLORS[i % COLORS.length] }}
                >
                  {ws.name[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 dark:text-white truncate">{ws.name}</h3>
                  <span className="text-xs text-primary-500 font-medium capitalize">{ws.role.toLowerCase()}</span>
                </div>
                <span className="text-gray-300 group-hover:text-primary-400 transition">→</span>
              </div>
              <div className="flex gap-4 text-xs text-gray-400 dark:text-gray-500">
                <span>👥 {ws._count?.members} members</span>
                <span>📁 {ws._count?.projects} projects</span>
              </div>
            </div>
          ))}

          {/* Create new card */}
          <button
            onClick={handleCreate}
            className="border-2 border-dashed border-gray-200 dark:border-dark-200 rounded-xl p-5 flex flex-col items-center justify-center gap-2 hover:border-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/10 transition group min-h-[120px]"
          >
            <span className="text-2xl text-gray-300 group-hover:text-primary-400 transition">+</span>
            <span className="text-sm text-gray-400 group-hover:text-primary-500 transition font-medium">New workspace</span>
          </button>
        </div>
      )}
    </div>
  )
}