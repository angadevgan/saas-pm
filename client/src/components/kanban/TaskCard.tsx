import { useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import api from '../../api/axios'
import { Task } from '../../types'
import TaskDetailModal from '../modals/TaskDetailModal'

interface Props { task: Task; projectId: string; onRefetch: () => void }

const priorityColors: Record<string, string> = {
  LOW:    'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400',
  MEDIUM: 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
  HIGH:   'bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400',
  URGENT: 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400',
}

const priorityDot: Record<string, string> = {
  LOW: 'bg-gray-400', MEDIUM: 'bg-blue-500', HIGH: 'bg-orange-500', URGENT: 'bg-red-500'
}

export default function TaskCard({ task, projectId, onRefetch }: Props) {
  const queryClient = useQueryClient()
  const [showDetail, setShowDetail] = useState(false)
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id })

  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.3 : 1 }

  const { mutate: deleteTask } = useMutation({
    mutationFn: () => api.delete(`/tasks/${task.id}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['project', projectId] }); toast.success('Task deleted') },
    onError: () => toast.error('Failed to delete task')
  })

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        onClick={() => setShowDetail(true)}
        className="bg-white dark:bg-dark-50 rounded-xl p-3.5 shadow-sm border border-gray-200 dark:border-dark-200 cursor-pointer hover:shadow-md hover:border-primary-300 dark:hover:border-primary-600 transition-all group"
      >
        {/* Priority dot */}
        <div className="flex items-center gap-2 mb-2">
          <div className={`w-1.5 h-1.5 rounded-full ${priorityDot[task.priority]}`} />
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${priorityColors[task.priority]}`}>
            {task.priority}
          </span>
          <button
            onClick={(e) => { e.stopPropagation(); deleteTask() }}
            className="ml-auto opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 text-xs transition"
          >✕</button>
        </div>

        <p className="text-sm font-medium text-gray-800 dark:text-gray-100 leading-snug mb-2">{task.title}</p>

        {task.description && (
          <p className="text-xs text-gray-400 dark:text-gray-500 line-clamp-2 mb-2">{task.description}</p>
        )}

        <div className="flex items-center justify-between mt-1">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            {(task._count?.comments ?? 0) > 0 && <span>💬 {task._count?.comments}</span>}
            {task.dueDate && <span>📅 {new Date(task.dueDate).toLocaleDateString()}</span>}
          </div>
          {task.assignee && (
            <div className="w-6 h-6 rounded-full bg-primary-400 flex items-center justify-center text-white text-xs font-bold"
              title={task.assignee.name}>
              {task.assignee.name[0]}
            </div>
          )}
        </div>
      </div>

      {showDetail && (
        <TaskDetailModal task={task} projectId={projectId} onClose={() => setShowDetail(false)} />
      )}
    </>
  )
}