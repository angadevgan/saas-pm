import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import api from '../api/axios'
import KanbanBoard from '../components/kanban/KanbanBoard'
import { useSocket } from '../hooks/useSocket'

export default function ProjectPage() {
  const { projectId } = useParams()
  const navigate = useNavigate()
  const [showActivity, setShowActivity] = useState(false)

  const { data: project, isLoading, refetch } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => api.get(`/projects/${projectId}`).then(r => r.data.data)
  })

  const { data: activityData } = useQuery({
    queryKey: ['activity', projectId],
    queryFn: () => api.get(`/projects/${projectId}/activity`).then(r => r.data.data),
    enabled: showActivity,
  })

  // Real-time socket
  const socket = useSocket(projectId)

  if (isLoading) return (
    <div className="flex items-center justify-center h-full">
      <div className="animate-spin w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full" />
    </div>
  )

  return (
    <div className="flex flex-col h-full">
      {/* Top bar */}
      <div className="shrink-0 bg-white dark:bg-dark-100 border-b border-gray-200 dark:border-dark-200 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full" style={{ background: project?.coverColor }} />
          <h1 className="font-semibold text-gray-900 dark:text-white">{project?.name}</h1>
          <span className="text-xs text-gray-400 bg-gray-100 dark:bg-dark-200 px-2 py-0.5 rounded-full">
            {project?.columns?.reduce((a: number, c: any) => a + c.tasks.length, 0)} tasks
          </span>
        </div>
        <div className="flex items-center gap-3">
          {/* Live presence indicator */}
          <div className="flex items-center gap-1.5 text-xs text-emerald-500">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Live
          </div>
          <button
            onClick={() => setShowActivity(s => !s)}
            className={`text-xs px-3 py-1.5 rounded-lg border transition font-medium ${
              showActivity
                ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-300 text-primary-600 dark:text-primary-400'
                : 'border-gray-200 dark:border-dark-200 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-dark-200'
            }`}
          >
            📋 Activity
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Kanban */}
        <div className="flex-1 overflow-x-auto p-6">
          {project && <KanbanBoard project={project} onRefetch={refetch} />}
        </div>

        {/* Activity sidebar */}
        {showActivity && (
          <div className="w-72 shrink-0 border-l border-gray-200 dark:border-dark-200 bg-white dark:bg-dark-100 overflow-y-auto p-4">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4 text-sm">Activity Log</h3>
            <div className="space-y-3">
              {activityData?.map((log: any) => (
                <div key={log.id} className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary-400 flex items-center justify-center text-white text-xs font-bold shrink-0 mt-0.5">
                    {log.user.name[0]}
                  </div>
                  <div>
                    <p className="text-xs text-gray-700 dark:text-gray-300">
                      <span className="font-medium">{log.user.name}</span>{' '}
                      <span className="text-gray-400 lowercase">{log.action}</span>{' '}
                      <span className="text-gray-500">{log.entity.toLowerCase()}</span>
                      {log.metadata?.title && <span className="font-medium"> "{log.metadata.title}"</span>}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">{new Date(log.createdAt).toLocaleString()}</p>
                  </div>
                </div>
              ))}
              {(!activityData || activityData.length === 0) && (
                <p className="text-xs text-gray-400 text-center py-8">No activity yet</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}