"use client"

import type React from "react"

import { useState } from "react"
import { type Task, tasksApi } from "@/lib/api"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { TaskCard } from "./task-card"
import { EditTaskDialog } from "./edit-task-dialog"
import { DeleteTaskDialog } from "./delete-task-dialog"
import { useToast } from "@/hooks/use-toast"

interface KanbanBoardProps {
  tasks: Task[]
  onTaskUpdate: () => void
}

const columns = [
  { id: "todo" as const, title: "To Do", color: "border-chart-5" },
  { id: "in-progress" as const, title: "In Progress", color: "border-chart-2" },
  { id: "done" as const, title: "Done", color: "border-chart-4" },
]

export function KanbanBoard({ tasks, onTaskUpdate }: KanbanBoardProps) {
  const [draggedTask, setDraggedTask] = useState<Task | null>(null)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [deletingTask, setDeletingTask] = useState<Task | null>(null)
  const { toast } = useToast()

  const handleDragStart = (task: Task) => {
    setDraggedTask(task)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = async (status: Task["status"]) => {
    if (!draggedTask || draggedTask.status === status) {
      setDraggedTask(null)
      return
    }

    try {
      await tasksApi.update(draggedTask.id, { status })
      onTaskUpdate()
      toast({
        title: "Task moved",
        description: `Task moved to ${status === "in-progress" ? "In Progress" : status === "done" ? "Done" : "To Do"}`,
      })
    } catch (error) {
      console.error("[v0] Failed to update task:", error)
      toast({
        title: "Error",
        description: "Failed to move task.",
        variant: "destructive",
      })
    } finally {
      setDraggedTask(null)
    }
  }

  const handleTaskEdit = (task: Task) => {
    setEditingTask(task)
  }

  const handleTaskDelete = (task: Task) => {
    setDeletingTask(task)
  }

  const handleTaskUpdated = () => {
    onTaskUpdate()
    setEditingTask(null)
    toast({
      title: "Task updated",
      description: "Your task has been updated successfully.",
    })
  }

  const handleTaskDeleted = () => {
    onTaskUpdate()
    setDeletingTask(null)
    toast({
      title: "Task deleted",
      description: "Your task has been deleted successfully.",
    })
  }

  return (
    <>
      <div className="grid h-full grid-cols-1 gap-6 p-6 lg:grid-cols-3">
        {columns.map((column) => {
          const columnTasks = tasks.filter((task) => task.status === column.id)
          return (
            <div key={column.id} className="flex flex-col">
              <Card className={`mb-4 border-t-4 ${column.color}`}>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center justify-between text-base">
                    <span>{column.title}</span>
                    <span className="text-sm font-normal text-muted-foreground">{columnTasks.length}</span>
                  </CardTitle>
                </CardHeader>
              </Card>

              <div
                className="flex-1 space-y-3 rounded-lg border-2 border-dashed border-border/50 bg-muted/20 p-4 transition-colors"
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(column.id)}
              >
                {columnTasks.length > 0 ? (
                  columnTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onDragStart={handleDragStart}
                      onEdit={handleTaskEdit}
                      onDelete={handleTaskDelete}
                    />
                  ))
                ) : (
                  <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
                    Drop tasks here
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {editingTask && (
        <EditTaskDialog
          open={!!editingTask}
          task={editingTask}
          onOpenChange={(open) => !open && setEditingTask(null)}
          onSuccess={handleTaskUpdated}
        />
      )}
      {deletingTask && (
        <DeleteTaskDialog
          open={!!deletingTask}
          task={deletingTask}
          onOpenChange={(open) => !open && setDeletingTask(null)}
          onSuccess={handleTaskDeleted}
        />
      )}
    </>
  )
}
