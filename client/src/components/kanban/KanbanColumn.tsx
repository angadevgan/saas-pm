import { useState } from 'react'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import api from '../../api/axios'
import { Column } from '../../types'
import TaskCard from './TaskCard'

interface Props { column: Column; projectId: string; onRefetch: () => void }

export default function KanbanColumn({ column, projectId, onRefetch }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id })
  const queryClient = useQueryClient()
  const [adding, setAdding] = useState(false)
  const [title, setTitle] = useState('')

  const { mutate: createTask } = useMutation({
    mutationFn: (title: string) =>
      api.post(`/tasks/${projectId}/column/${column.id}`, { title }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', projectId] })
      setTitle('')
      setAdding(false)
      toast.success('Task created!')
    },
    onError: () => toast.error('Failed to create task')
  })

  const handleAdd = () => {
    if (title.trim()) createTask(title.trim())
  }

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col w-72 shrink-0 bg-gray-100 rounded-xl p-3 transition ${isOver ? 'ring-2 ring-indigo-400' : ''}`}
    >
      {/* Column header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full" style={{ background: column.color }} />
          <span className="font-medium text-sm text-gray-700">{column.name}</span>
          <span className="text-xs text-gray-400 bg-gray-200 rounded-full px-2">{column.tasks.length}</span>
        </div>
      </div>

      {/* Tasks */}
      <SortableContext items={column.tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col gap-2 min-h-[40px]">
          {column.tasks.map(task => (
            <TaskCard key={task.id} task={task} projectId={projectId} onRefetch={onRefetch} />
          ))}
        </div>
      </SortableContext>

      {/* Add task */}
      {adding ? (
        <div className="mt-2">
          <input
            autoFocus
            value={title}
            onChange={e => setTitle(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleAdd(); if (e.key === 'Escape') setAdding(false) }}
            placeholder="Task title..."
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <div className="flex gap-2 mt-2">
            <button onClick={handleAdd} className="bg-indigo-600 text-white text-xs px-3 py-1.5 rounded-lg hover:bg-indigo-700">Add</button>
            <button onClick={() => setAdding(false)} className="text-gray-500 text-xs px-3 py-1.5 rounded-lg hover:bg-gray-200">Cancel</button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="mt-2 text-sm text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-lg py-2 px-3 text-left transition"
        >
          + Add task
        </button>
      )}
    </div>
  )
}