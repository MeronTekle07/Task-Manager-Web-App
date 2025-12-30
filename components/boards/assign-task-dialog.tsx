"use client"

import React from "react"
import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { type Task, type User, usersApi } from "@/lib/backend-api"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { User as UserIcon, Users } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface AssignTaskDialogProps {
  open: boolean
  task: Task
  currentAssignee: User | null
  onOpenChange: (open: boolean) => void
  onAssign: (userId: string) => void
}

export function AssignTaskDialog({ 
  open, 
  task, 
  currentAssignee, 
  onOpenChange, 
  onAssign 
}: AssignTaskDialogProps) {
  const { token } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState<string>(
    currentAssignee?.id || ""
  )
  const { toast } = useToast()

  React.useEffect(() => {
    const loadUsers = async () => {
      if (!token) return

      setIsLoading(true)
      try {
        const usersData = await usersApi.getAll(token)
        setUsers(usersData)
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load users",
          variant: "destructive"
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (open) {
      loadUsers()
    }
  }, [open, token, toast])

  React.useEffect(() => {
    setSelectedUserId(currentAssignee?.id || "")
  }, [currentAssignee])

  const handleAssign = () => {
    if (selectedUserId) {
      onAssign(selectedUserId)
      onOpenChange(false)
    }
  }

  const handleUnassign = () => {
    onAssign("")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Assign Task
          </DialogTitle>
          <DialogDescription>
            Assign "{task.title}" to a team member
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Current Assignment */}
          <div className="p-3 rounded-lg bg-muted/50">
            <div className="text-sm font-medium mb-2">Currently Assigned To:</div>
            {currentAssignee ? (
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={currentAssignee.avatar} />
                  <AvatarFallback className="text-xs">
                    {currentAssignee.username.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">{currentAssignee.username}</div>
                  <div className="text-sm text-muted-foreground">
                    {currentAssignee.email}
                  </div>
                </div>
                <Badge variant="secondary" className="ml-auto">
                  {currentAssignee.role}
                </Badge>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-muted-foreground">
                <UserIcon className="h-4 w-4" />
                Unassigned
              </div>
            )}
          </div>

          {/* User Selection */}
          <div className="space-y-3">
            <div className="text-sm font-medium">Assign To:</div>
            {isLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-lg border">
                    <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
                    <div className="flex-1">
                      <div className="h-4 w-24 bg-muted animate-pulse rounded mb-1" />
                      <div className="h-3 w-32 bg-muted animate-pulse rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {/* Unassign Option */}
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="unassign"
                    name="assignee"
                    value=""
                    checked={selectedUserId === ""}
                    onChange={(e) => setSelectedUserId(e.target.value)}
                    className="mr-3"
                  />
                  <label 
                    htmlFor="unassign" 
                    className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:bg-muted/50 flex-1"
                  >
                    <UserIcon className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="font-medium">Unassign</div>
                      <div className="text-sm text-muted-foreground">
                        Remove current assignment
                      </div>
                    </div>
                  </label>
                </div>

                {/* User Options */}
                {users.map((user) => (
                  <div key={user.id} className="flex items-center">
                    <input
                      type="radio"
                      id={user.id}
                      name="assignee"
                      value={user.id}
                      checked={selectedUserId === user.id}
                      onChange={(e) => setSelectedUserId(e.target.value)}
                      className="mr-3"
                    />
                    <label 
                      htmlFor={user.id} 
                      className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:bg-muted/50 flex-1"
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback className="text-xs">
                          {user.username.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="font-medium">{user.username}</div>
                        <div className="text-sm text-muted-foreground">
                          {user.email}
                        </div>
                      </div>
                      <Badge variant="secondary">
                        {user.role}
                      </Badge>
                    </label>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            {currentAssignee && selectedUserId === "" ? (
              <Button variant="destructive" onClick={handleUnassign}>
                Unassign
              </Button>
            ) : (
              <Button 
                onClick={handleAssign}
                disabled={!selectedUserId || selectedUserId === currentAssignee?.id}
              >
                {selectedUserId === currentAssignee?.id 
                  ? "Already Assigned" 
                  : selectedUserId 
                    ? "Assign" 
                    : "Select User"
                }
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
