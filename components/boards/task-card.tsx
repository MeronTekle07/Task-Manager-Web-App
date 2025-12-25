"use client"

import type { Task } from "@/lib/api"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { MoreVertical, Pencil, Trash2, Calendar } from "lucide-react"
import { cn } from "@/lib/utils"

interface TaskCardProps {
  task: Task
  onDragStart: (task: Task) => void
  onEdit: (task: Task) => void
  onDelete: (task: Task) => void
}

const priorityColors = {
  low: "bg-muted text-muted-foreground",
  medium: "bg-chart-5/20 text-chart-5",
  high: "bg-chart-2/20 text-chart-2",
}

export function TaskCard({ task, onDragStart, onEdit, onDelete }: TaskCardProps) {
  const formatDate = (dateString?: string) => {
    if (!dateString) return null
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
  }

  return (
    <Card
      draggable
      onDragStart={() => onDragStart(task)}
      className="group cursor-move transition-all hover:shadow-md active:cursor-grabbing active:opacity-50"
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="flex-1 font-medium leading-snug">{task.title}</h3>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 opacity-0 transition-opacity group-hover:opacity-100"
              >
                <MoreVertical className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(task)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => onDelete(task)}>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      {(task.description || task.dueDate || task.priority) && (
        <CardContent className="space-y-3 pt-0">
          {task.description && <p className="text-sm text-muted-foreground line-clamp-2">{task.description}</p>}
          <div className="flex flex-wrap items-center gap-2">
            {task.priority && (
              <Badge variant="secondary" className={cn("text-xs", priorityColors[task.priority])}>
                {task.priority}
              </Badge>
            )}
            {task.dueDate && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                {formatDate(task.dueDate)}
              </div>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  )
}
