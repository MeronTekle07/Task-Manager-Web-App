"use client"

import React from "react"
import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { type Task, type TaskComment, type User, commentsApi, usersApi } from "@/lib/backend-api"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MessageSquare, Send, User as UserIcon } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface TaskCommentsDialogProps {
  open: boolean
  task: Task
  comments: TaskComment[]
  onOpenChange: (open: boolean) => void
  onCommentAdded: () => void
}

export function TaskCommentsDialog({ 
  open, 
  task, 
  comments, 
  onOpenChange, 
  onCommentAdded 
}: TaskCommentsDialogProps) {
  const { token } = useAuth()
  const [newComment, setNewComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [commentUsers, setCommentUsers] = useState<Record<string, User>>({})
  const { toast } = useToast()

  React.useEffect(() => {
    const loadUsers = async () => {
      if (!token || comments.length === 0) return

      const users: Record<string, User> = {}
      const userIds = [...new Set(comments.map(comment => comment.userId))]
      
      await Promise.all(
        userIds.map(async (userId) => {
          try {
            const user = await usersApi.getById(token, userId)
            if (user) {
              users[userId] = user
            }
          } catch (error) {
            console.error("Failed to load user:", error)
          }
        })
      )
      
      setCommentUsers(users)
    }

    loadUsers()
  }, [comments, token])

  const handleSubmitComment = async () => {
    if (!newComment.trim() || !token) return

    setIsSubmitting(true)
    try {
      await commentsApi.create(token, {
        taskId: task.id,
        content: newComment.trim()
      })
      
      setNewComment("")
      onCommentAdded()
      toast({
        title: "Comment added",
        description: "Your comment has been added successfully."
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add comment",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInHours * 60)
      return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} hour${Math.floor(diffInHours) !== 1 ? 's' : ''} ago`
    } else {
      return date.toLocaleDateString()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Task Comments
          </DialogTitle>
          <DialogDescription>
            {task.title} - {comments.length} comment{comments.length !== 1 ? 's' : ''}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Comments List */}
          <div className="max-h-[400px] overflow-y-auto space-y-4">
            {comments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No comments yet. Be the first to comment!</p>
              </div>
            ) : (
              comments.map((comment) => {
                const user = commentUsers[comment.userId]
                return (
                  <div key={comment.id} className="flex gap-3 p-3 rounded-lg bg-muted/50">
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      <AvatarImage src={user?.avatar} />
                      <AvatarFallback className="text-xs">
                        {user?.username.slice(0, 2).toUpperCase() || <UserIcon className="h-4 w-4" />}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">
                          {user?.username || 'Unknown User'}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(comment.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm text-foreground break-words">
                        {comment.content}
                      </p>
                    </div>
                  </div>
                )
              })
            )}
          </div>

          {/* Add Comment Form */}
          <div className="border-t pt-4">
            <div className="flex gap-2">
              <Textarea
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="flex-1 min-h-[80px] resize-none"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSubmitComment()
                  }
                }}
              />
              <div className="flex flex-col gap-2">
                <Button
                  onClick={handleSubmitComment}
                  disabled={!newComment.trim() || isSubmitting}
                  size="sm"
                  className="px-3"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Press Enter to send, Shift+Enter for new line
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
