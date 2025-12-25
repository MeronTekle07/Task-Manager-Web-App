"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { ProtectedLayout } from "@/components/layout/protected-layout"
import { Button } from "@/components/ui/button"
import { boardsApi, tasksApi, type Board, type Task } from "@/lib/api"
import { ArrowLeft, Plus } from "lucide-react"
import { KanbanBoard } from "@/components/boards/kanban-board"
import { CreateTaskDialog } from "@/components/boards/create-task-dialog"
import { useToast } from "@/hooks/use-toast"

export default function BoardDetailPage() {
  const params = useParams()
  const router = useRouter()
  const boardId = params.id as string
  const [board, setBoard] = useState<Board | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [createTaskOpen, setCreateTaskOpen] = useState(false)
  const { toast } = useToast()

  const loadBoardData = async () => {
    try {
      const [boardData, tasksData] = await Promise.all([boardsApi.getById(boardId), tasksApi.getByBoardId(boardId)])

      if (!boardData) {
        toast({
          title: "Board not found",
          description: "The board you're looking for doesn't exist.",
          variant: "destructive",
        })
        router.push("/boards")
        return
      }

      setBoard(boardData)
      setTasks(tasksData)
    } catch (error) {
      console.error("[v0] Failed to load board:", error)
      toast({
        title: "Error",
        description: "Failed to load board data.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadBoardData()
  }, [boardId])

  const handleTaskCreated = () => {
    loadBoardData()
    setCreateTaskOpen(false)
    toast({
      title: "Task created",
      description: "Your new task has been added.",
    })
  }

  const handleTaskUpdated = () => {
    loadBoardData()
  }

  if (isLoading) {
    return (
      <ProtectedLayout>
        <div className="flex min-h-screen items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </ProtectedLayout>
    )
  }

  if (!board) {
    return null
  }

  return (
    <ProtectedLayout>
      <div className="flex h-screen flex-col">
        <div className="border-b border-border bg-card px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => router.push("/boards")}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-semibold">{board.name}</h1>
                {board.description && <p className="text-sm text-muted-foreground">{board.description}</p>}
              </div>
            </div>
            <Button onClick={() => setCreateTaskOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Task
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-auto bg-background">
          <KanbanBoard tasks={tasks} onTaskUpdate={handleTaskUpdated} />
        </div>
      </div>

      <CreateTaskDialog
        open={createTaskOpen}
        boardId={boardId}
        onOpenChange={setCreateTaskOpen}
        onSuccess={handleTaskCreated}
      />
    </ProtectedLayout>
  )
}
