import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import api from '../../api/axios'
import { Task, Comment } from '../../types'
import { useAuth } from '../../hooks/useAuth'

interface Props { task: Task; projectId: string; onClose: () => void }

const priorityColors: Record<string, string> = {
  LOW: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300',
  MEDIUM: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  HIGH: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
  URGENT: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
}

export default function TaskDetailModal({ task, projectId, onClose }: Props) {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [comment, setComment] = useState('')

  const { data: taskDetail } = useQuery({
    queryKey: ['task', task.id],
    queryFn: () => api.get(`/tasks/${task.id}`).then(r => r.data.data)
  })

  const { mutate: submitComment, isPending } = useMutation({
    mutationFn: () => api.post(`/tasks/${task.id}/comments`, { content: comment }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task', task.id] })
      queryClient.invalidateQueries({ queryKey: ['project', projectId] })
      setComment('')
      toast.success('Comment added')
    },
    onError: () => toast.error('Failed to add comment')
  })

  const { mutate: deleteComment } = useMutation({
    mutationFn: (commentId: string) => api.delete(`/tasks/comments/${commentId}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['task', task.id] }),
  })

  const detail = taskDetail || task

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in p-4">
      <div className="bg-white dark:bg-dark-100 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col border border-gray-100 dark:border-dark-200 animate-slide-in">
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-gray-100 dark:border-dark-200">
          <div className="flex-1 pr-4">
            <div className="flex items-center gap-2 mb-2">
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${priorityColors[detail.priority]}`}>
                {detail.priority}
              </span>
              {detail.dueDate && (
                <span className="text-xs text-gray-400">
                  📅 {new Date(detail.dueDate).toLocaleDateString()}
                </span>
              )}
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{detail.title}</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-xl shrink-0">✕</button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Description */}
          <div>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Description</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {detail.description || <span className="italic text-gray-300">No description provided.</span>}
            </p>
          </div>

          {/* Meta */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Created by</h3>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-primary-500 flex items-center justify-center text-white text-xs font-bold">
                  {detail.creator?.name[0]}
                </div>
                <span className="text-sm text-gray-700 dark:text-gray-300">{detail.creator?.name}</span>
              </div>
            </div>
            {detail.assignee && (
              <div>
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Assigned to</h3>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-white text-xs font-bold">
                    {detail.assignee?.name[0]}
                  </div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">{detail.assignee?.name}</span>
                </div>
              </div>
            )}
          </div>

          {/* Comments */}
          <div>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Comments ({taskDetail?.comments?.length || 0})
            </h3>
            <div className="space-y-3 mb-4">
              {taskDetail?.comments?.map((c: Comment) => (
                <div key={c.id} className="flex gap-3 group">
                  <div className="w-7 h-7 rounded-full bg-primary-400 flex items-center justify-center text-white text-xs font-bold shrink-0">
                    {c.author.name[0]}
                  </div>
                  <div className="flex-1 bg-gray-50 dark:bg-dark-50 rounded-xl px-4 py-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{c.author.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400">{new Date(c.createdAt).toLocaleDateString()}</span>
                        {c.author.id === user?.id && (
                          <button
                            onClick={() => deleteComment(c.id)}
                            className="text-xs text-gray-300 hover:text-red-400 opacity-0 group-hover:opacity-100 transition"
                          >✕</button>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{c.content}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Add comment */}
            <div className="flex gap-3">
              <div className="w-7 h-7 rounded-full bg-primary-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                {user?.name[0]}
              </div>
              <div className="flex-1">
                <textarea
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  placeholder="Write a comment..."
                  rows={2}
                  className="w-full border border-gray-200 dark:border-dark-200 rounded-xl px-4 py-3 text-sm bg-white dark:bg-dark-50 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                />
                <button
                  onClick={() => submitComment()}
                  disabled={isPending || !comment.trim()}
                  className="mt-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-1.5 rounded-lg text-sm font-medium transition disabled:opacity-50"
                >
                  {isPending ? 'Posting...' : 'Post comment'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}