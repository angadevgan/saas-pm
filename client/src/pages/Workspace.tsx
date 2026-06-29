import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import api from '../api/axios'
import { Project } from '../types'
import InviteMemberModal from '../components/modals/InviteMemberModal'

const COLORS = ['#6366f1','#f59e0b','#10b981','#ef4444','#3b82f6','#8b5cf6']

export default function WorkspacePage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [showInvite, setShowInvite] = useState(false)

  const { data: workspace, isLoading } = useQuery({
    queryKey: ['workspace', slug],
    queryFn: () => api.get(`/workspaces/${slug}`).then(r => r.data.data)
  })

  const { mutate: createProject } = useMutation({
    mutationFn: (name: string) => api.post(`/projects/workspace/${workspace.id}`, { name, coverColor: COLORS[Math.floor(Math.random() * COLORS.length)] }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['workspace', slug] }); toast.success('Project created!') },
    onError: () => toast.error('Failed to create project')
  })

  const handleCreate = () => {
    const name = prompt('Project name:')
    if (name?.trim()) createProject(name.trim())
  }

  if (isLoading) return (
    <div className="flex items-center justify-center h-full">
      <div className="animate-spin w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full" />
    </div>
  )

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center text-white font-bold">
              {workspace?.name[0]}
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{workspace?.name}</h1>
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-sm ml-13">
            {workspace?.members?.length} members · {workspace?.projects?.length} projects
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowInvite(true)}
            className="flex items-center gap-2 border border-gray-200 dark:border-dark-200 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-100 px-4 py-2 rounded-lg text-sm font-medium transition"
          >
            👥 Invite Member
          </button>
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
          >
            + New Project
          </button>
        </div>
      </div>

      {/* Members row */}
      <div className="flex items-center gap-2 mb-8 p-4 bg-white dark:bg-dark-100 rounded-xl border border-gray-100 dark:border-dark-200">
        <span className="text-xs text-gray-400 mr-2 font-medium">MEMBERS</span>
        <div className="flex -space-x-2">
          {workspace?.members?.slice(0, 8).map((m: any) => (
            <div key={m.id} title={m.user.name} className="w-8 h-8 rounded-full bg-primary-500 border-2 border-white dark:border-dark-100 flex items-center justify-center text-white text-xs font-bold">
              {m.user.name[0]}
            </div>
          ))}
        </div>
        {workspace?.members?.length > 8 && (
          <span className="text-xs text-gray-400">+{workspace.members.length - 8} more</span>
        )}
      </div>

      {/* Projects grid */}
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Projects</h2>

      {workspace?.projects?.length === 0 ? (
        <div className="text-center py-24 border-2 border-dashed border-gray-200 dark:border-dark-200 rounded-2xl">
          <div className="text-5xl mb-4">📁</div>
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">No projects yet</h3>
          <button onClick={handleCreate} className="mt-4 bg-primary-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-primary-700 transition">
            Create First Project
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {workspace?.projects?.map((project: Project, i: number) => (
            <div
              key={project.id}
              onClick={() => navigate(`/project/${project.id}`)}
              className="group bg-white dark:bg-dark-100 border border-gray-200 dark:border-dark-200 rounded-xl overflow-hidden cursor-pointer hover:border-primary-400 hover:shadow-lg transition-all duration-200"
            >
              <div className="h-1.5" style={{ background: project.coverColor || COLORS[i % COLORS.length] }} />
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-gray-900 dark:text-white">{project.name}</h3>
                  <span className="text-gray-300 group-hover:text-primary-400 transition text-sm">→</span>
                </div>
                {project.description && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 line-clamp-2">{project.description}</p>
                )}
                <div className="flex items-center gap-3 text-xs text-gray-400">
                  <span>📋 {project.columns?.length} columns</span>
                </div>
              </div>
            </div>
          ))}

          <button
            onClick={handleCreate}
            className="border-2 border-dashed border-gray-200 dark:border-dark-200 rounded-xl p-5 flex flex-col items-center justify-center gap-2 hover:border-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/10 transition group min-h-[120px]"
          >
            <span className="text-2xl text-gray-300 group-hover:text-primary-400 transition">+</span>
            <span className="text-sm text-gray-400 group-hover:text-primary-500 font-medium">New project</span>
          </button>
        </div>
      )}

      {showInvite && workspace && (
        <InviteMemberModal workspaceId={workspace.id} onClose={() => setShowInvite(false)} />
      )}
    </div>
  )
}