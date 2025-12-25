"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { boardsApi, type Board } from "@/lib/api"
import { AlertTriangle } from "lucide-react"

interface DeleteBoardDialogProps {
  open: boolean
  board: Board
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function DeleteBoardDialog({ open, board, onOpenChange, onSuccess }: DeleteBoardDialogProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleDelete = async () => {
    setIsLoading(true)

    try {
      await boardsApi.delete(board.id)
      onSuccess()
    } catch (error) {
      console.error("[v0] Failed to delete board:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <div className="mb-2 flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <DialogTitle>Delete Board</DialogTitle>
          </div>
          <DialogDescription>
            Are you sure you want to delete <span className="font-medium text-foreground">"{board.name}"</span>? This
            action will also delete all tasks associated with this board and cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={isLoading}>
            {isLoading ? "Deleting..." : "Delete Board"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
