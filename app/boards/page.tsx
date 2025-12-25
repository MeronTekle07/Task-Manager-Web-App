"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ProtectedLayout } from "@/components/layout/protected-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { boardsApi, tasksApi, type Board } from "@/lib/api"
import { Plus, MoreVertical, Pencil, Trash2, LayoutGrid } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { CreateBoardDialog } from "@/components/boards/create-board-dialog"
import { EditBoardDialog } from "@/components/boards/edit-board-dialog"
import { DeleteBoardDialog } from "@/components/boards/delete-board-dialog"
import { useToast } from "@/hooks/use-toast"

export default function BoardsPage() {
  const [boards, setBoards] = useState<Board[]>([])
  const [boardTaskCounts, setBoardTaskCounts] = useState<Record<string, number>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editingBoard, setEditingBoard] = useState<Board | null>(null)
  const [deletingBoard, setDeletingBoard] = useState<Board | null>(null)
  const { toast } = useToast()

  const loadBoards = async () => {
    try {
      const boardsData = await boardsApi.getAll()
      setBoards(boardsData)

      // Load task counts for each board
      const counts: Record<string, number> = {}
      await Promise.all(
        boardsData.map(async (board) => {
          const tasks = await tasksApi.getByBoardId(board.id)
          counts[board.id] = tasks.length
        }),
      )
      setBoardTaskCounts(counts)
    } catch (error) {
      console.error("[v0] Failed to load boards:", error)
      toast({
        title: "Error",
        description: "Failed to load boards. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadBoards()
  }, [])

  const handleBoardCreated = () => {
    loadBoards()
    setCreateDialogOpen(false)
    toast({
      title: "Board created",
      description: "Your new board has been created successfully.",
    })
  }

  const handleBoardUpdated = () => {
    loadBoards()
    setEditingBoard(null)
    toast({
      title: "Board updated",
      description: "Your board has been updated successfully.",
    })
  }

  const handleBoardDeleted = () => {
    loadBoards()
    setDeletingBoard(null)
    toast({
      title: "Board deleted",
      description: "Your board has been deleted successfully.",
    })
  }

  return (
    <ProtectedLayout>
      <div className="space-y-6 p-6 lg:p-8">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-balance text-3xl font-semibold tracking-tight">Boards</h1>
            <p className="text-muted-foreground">Manage your project boards and tasks</p>
          </div>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Board
          </Button>
        </div>

        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="h-40">
                <CardHeader>
                  <div className="h-6 w-3/4 animate-pulse rounded bg-muted" />
                  <div className="h-4 w-full animate-pulse rounded bg-muted" />
                </CardHeader>
              </Card>
            ))}
          </div>
        ) : boards.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {boards.map((board) => (
              <Card
                key={board.id}
                className="group relative overflow-hidden transition-all hover:border-primary/50 hover:shadow-lg"
              >
                <Link href={`/boards/${board.id}`}>
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                          <LayoutGrid className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1 overflow-hidden">
                          <CardTitle className="truncate text-lg">{board.name}</CardTitle>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.preventDefault()}>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.preventDefault()
                              setEditingBoard(board)
                            }}
                          >
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={(e) => {
                              e.preventDefault()
                              setDeletingBoard(board)
                            }}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <CardDescription className="line-clamp-2">{board.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-muted-foreground">
                      {boardTaskCounts[board.id] || 0} {boardTaskCounts[board.id] === 1 ? "task" : "tasks"}
                    </div>
                  </CardContent>
                </Link>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="flex h-64 items-center justify-center">
            <CardContent className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                <LayoutGrid className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="mb-2 text-lg font-medium">No boards yet</h3>
              <p className="mb-4 text-sm text-muted-foreground">Create your first board to start organizing tasks</p>
              <Button onClick={() => setCreateDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Board
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      <CreateBoardDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} onSuccess={handleBoardCreated} />
      {editingBoard && (
        <EditBoardDialog
          open={!!editingBoard}
          board={editingBoard}
          onOpenChange={(open) => !open && setEditingBoard(null)}
          onSuccess={handleBoardUpdated}
        />
      )}
      {deletingBoard && (
        <DeleteBoardDialog
          open={!!deletingBoard}
          board={deletingBoard}
          onOpenChange={(open) => !open && setDeletingBoard(null)}
          onSuccess={handleBoardDeleted}
        />
      )}
    </ProtectedLayout>
  )
}
