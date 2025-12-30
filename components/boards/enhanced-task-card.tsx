"use client"

import React from "react"
import { useState } from "react"
import { format } from "date-fns"
import { useAuth } from "@/lib/auth-context"
import { type Task, type User, type TaskComment, tasksApi, commentsApi, usersApi, activityApi } from "@/lib/backend-api"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  MessageSquare, 
  Calendar, 
  Flag, 
  User as UserIcon, 
  MoreHorizontal,
  Paperclip,
  Tag
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { EditTaskDialog } from "./edit-task-dialog"
import { DeleteTaskDialog } from "./delete-task-dialog"
import { TaskCommentsDialog } from "./task-comments-dialog"
import { AssignTaskDialog } from "./assign-task-dialog"
import { useToast } from "@/hooks/use-toast"

interface EnhancedTaskCardProps {
  task: Task
  onTaskUpdate: () => void
  onStatusChange: (taskId: string, newStatus: Task["status"]) => void
}

const priorityColors = {
  low: "bg-chart-4 text-chart-4-foreground",
  medium: "bg-chart-2 text-chart-2-foreground", 
  high: "bg-destructive text-destructive-foreground"
}

const priorityLabels = {
  low: "Low",
  medium: "Medium",
  high: "High"
}

export function EnhancedTaskCard({ task, onTaskUpdate, onStatusChange }: EnhancedTaskCardProps) {
  const { token } = useAuth()
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [deletingTask, setDeletingTask] = useState<Task | null>(null)
  const [commentsOpen, setCommentsOpen] = useState(false)
  const [assigningTask, setAssigningTask] = useState<Task | null>(null)
  const [assignedUser, setAssignedUser] = useState<User | null>(null)
  const [comments, setComments] = useState<TaskComment[]>([])
  const { toast } = useToast()

  React.useEffect(() => {
    const loadTaskDetails = async () => {
      if (!token) return
      
      try {
        // Load assigned user
        if (task.assignedTo) {
          const user = await usersApi.getById(token, task.assignedTo)
          setAssignedUser(user || null)
        }
        
        // Load comments
        const taskComments = await commentsApi.getByTaskId(token, task.id)
        setComments(taskComments)
      } catch (error) {
        console.error("Failed to load task details:", error)
      }
    }

    loadTaskDetails()
  }, [task, token])

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData("taskId", task.id)
    e.dataTransfer.effectAllowed = "move"
  }

  const handleStatusUpdate = async (newStatus: Task["status"]) => {
    try {
      await tasksApi.update(task.id, { status: newStatus })
      onStatusChange(task.id, newStatus)
      
      // Log activity
      await activityApi.create(token!, {
        boardId: task.boardId,
        taskId: task.id,
        action: "status_changed",
        details: `Changed task "${task.title}" status to ${newStatus}`
      })
      
      onTaskUpdate()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update task status",
        variant: "destructive"
      })
    }
  }

  const handleAssign = async (userId: string) => {
    try {
      await tasksApi.assignToUser(token!, task.id, userId)
      
      // Log activity
      await activityApi.create(token!, {
        boardId: task.boardId,
        taskId: task.id,
        action: "assigned",
        details: `Assigned task "${task.title}" to user`
      })
      
      onTaskUpdate()
    } catch (error) {
      toast({
        title: "Error", 
        description: "Failed to assign task",
        variant: "destructive"
      })
    }
  }

  return (
    <>
      <Card 
        className="cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow"
        draggable
        onDragStart={handleDragStart}
      >
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-sm leading-5 truncate">
                {task.title}
              </h4>
              {task.description && (
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                  {task.description}
                </p>
              )}
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <MoreHorizontal className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-32">
                <DropdownMenuItem onClick={() => setEditingTask(task)}>
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setAssigningTask(task)}>
                  Assign
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setCommentsOpen(true)}>
                  Comments
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="text-destructive"
                  onClick={() => setDeletingTask(task)}
                >
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0 space-y-3">
          {/* Priority Badge */}
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className={priorityColors[task.priority]}>
              <Flag className="h-3 w-3 mr-1" />
              {priorityLabels[task.priority]}
            </Badge>
          </div>

          {/* Tags */}
          {task.tags && task.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {task.tags.slice(0, 2).map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  <Tag className="h-2 w-2 mr-1" />
                  {tag}
                </Badge>
              ))}
              {task.tags.length > 2 && (
                <Badge variant="outline" className="text-xs">
                  +{task.tags.length - 2}
                </Badge>
              )}
            </div>
          )}

          {/* Due Date */}
          {task.dueDate && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              {format(new Date(task.dueDate), "MMM d, yyyy")}
            </div>
          )}

          {/* Assigned User */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {assignedUser ? (
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={assignedUser.avatar} />
                    <AvatarFallback className="text-xs">
                      {assignedUser.username.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-muted-foreground">
                    {assignedUser.username}
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <UserIcon className="h-3 w-3" />
                  Unassigned
                </div>
              )}
            </div>

            {/* Activity Indicators */}
            <div className="flex items-center gap-1">
              {comments.length > 0 && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MessageSquare className="h-3 w-3" />
                  {comments.length}
                </div>
              )}
              {task.attachments && task.attachments.length > 0 && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Paperclip className="h-3 w-3" />
                  {task.attachments.length}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dialogs */}
      {editingTask && (
        <EditTaskDialog
          open={!!editingTask}
          task={editingTask}
          onOpenChange={(open) => !open && setEditingTask(null)}
          onSuccess={onTaskUpdate}
        />
      )}

      {deletingTask && (
        <DeleteTaskDialog
          open={!!deletingTask}
          task={deletingTask}
          onOpenChange={(open) => !open && setDeletingTask(null)}
          onSuccess={onTaskUpdate}
        />
      )}

      {commentsOpen && (
        <TaskCommentsDialog
          open={commentsOpen}
          task={task}
          comments={comments}
          onOpenChange={setCommentsOpen}
          onCommentAdded={onTaskUpdate}
        />
      )}

      {assigningTask && (
        <AssignTaskDialog
          open={!!assigningTask}
          task={assigningTask}
          currentAssignee={assignedUser}
          onOpenChange={(open) => !open && setAssigningTask(null)}
          onAssign={handleAssign}
        />
      )}
    </>
  )
}
