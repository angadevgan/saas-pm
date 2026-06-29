import { useState } from 'react'
import { DndContext, DragEndEvent, DragOverEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import api from '../../api/axios'
import { Project, Task } from '../../types'
import KanbanColumn from './KanbanColumn'

interface Props { project: Project; onRefetch: () => void }

export default function KanbanBoard({ project, onRefetch }: Props) {
  const queryClient = useQueryClient()
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  const { mutate: moveTask } = useMutation({
    mutationFn: ({ taskId, columnId, order }: { taskId: string; columnId: string; order: number }) =>
      api.patch(`/tasks/${taskId}/move`, { columnId, order }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', project.id] })
    },
    onError: () => toast.error('Failed to move task')
  })

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over) return

    const taskId = active.id as string
    const overId = over.id as string

    // Find which column the task was dropped on
    const targetColumn = project.columns.find(col =>
      col.id === overId || col.tasks.some(t => t.id === overId)
    )
    if (!targetColumn) return

    const newOrder = targetColumn.tasks.length
    moveTask({ taskId, columnId: targetColumn.id, order: newOrder })
  }

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="flex gap-4 h-full items-start">
        {project.columns.map(column => (
          <KanbanColumn
            key={column.id}
            column={column}
            projectId={project.id}
            onRefetch={onRefetch}
          />
        ))}
      </div>
    </DndContext>
  )
}