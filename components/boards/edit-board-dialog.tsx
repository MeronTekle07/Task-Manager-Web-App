"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { boardsApi, type Board } from "@/lib/api"

interface EditBoardDialogProps {
  open: boolean
  board: Board
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function EditBoardDialog({ open, board, onOpenChange, onSuccess }: EditBoardDialogProps) {
  const [name, setName] = useState(board.name)
  const [description, setDescription] = useState(board.description)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    setName(board.name)
    setDescription(board.description)
  }, [board])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await boardsApi.update(board.id, { name, description })
      onSuccess()
    } catch (error) {
      console.error("[v0] Failed to update board:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit Board</DialogTitle>
            <DialogDescription>Update your board information</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Board Name</Label>
              <Input
                id="edit-name"
                placeholder="e.g., Website Redesign"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                placeholder="Briefly describe this board's purpose"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                disabled={isLoading}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
