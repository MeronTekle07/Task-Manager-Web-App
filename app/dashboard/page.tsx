"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { ProtectedLayout } from "@/components/layout/protected-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { boardsApi, tasksApi, type Board, type Task } from "@/lib/api"
import { LayoutGrid, CheckCircle2, Clock, ListTodo } from "lucide-react"

export default function DashboardPage() {
  const { user } = useAuth()
  const [boards, setBoards] = useState<Board[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        const [boardsData, ...tasksByBoard] = await Promise.all([
          boardsApi.getAll(),
          ...((await boardsApi.getAll()) || []).map((board) => tasksApi.getByBoardId(board.id)),
        ])
        setBoards(boardsData)
        setTasks(tasksByBoard.flat())
      } catch (error) {
        console.error("[v0] Failed to load dashboard data:", error)
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [])

  const completedTasks = tasks.filter((task) => task.status === "done").length
  const pendingTasks = tasks.filter((task) => task.status !== "done").length

  const stats = [
    {
      title: "Total Boards",
      value: boards.length,
      icon: LayoutGrid,
      color: "text-primary",
    },
    {
      title: "Total Tasks",
      value: tasks.length,
      icon: ListTodo,
      color: "text-chart-3",
    },
    {
      title: "Completed",
      value: completedTasks,
      icon: CheckCircle2,
      color: "text-chart-4",
    },
    {
      title: "Pending",
      value: pendingTasks,
      icon: Clock,
      color: "text-chart-2",
    },
  ]

  return (
    <ProtectedLayout>
      <div className="space-y-6 p-6 lg:p-8">
        <div className="space-y-1">
          <h1 className="text-balance text-3xl font-semibold tracking-tight">Welcome back, {user?.name || "User"}</h1>
          <p className="text-muted-foreground">Here's an overview of your projects and tasks</p>
        </div>

        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div className="h-4 w-24 animate-pulse rounded bg-muted" />
                </CardHeader>
                <CardContent>
                  <div className="h-8 w-16 animate-pulse rounded bg-muted" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => {
              const Icon = stat.icon
              return (
                <Card key={stat.title} className="transition-colors hover:bg-accent/50">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                    <Icon className={`h-5 w-5 ${stat.color}`} />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{stat.value}</div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent Boards</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-16 animate-pulse rounded-lg bg-muted" />
                  ))}
                </div>
              ) : boards.length > 0 ? (
                <div className="space-y-3">
                  {boards.slice(0, 3).map((board) => (
                    <div
                      key={board.id}
                      className="flex items-center gap-3 rounded-lg border border-border bg-card p-4 transition-colors hover:bg-accent"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <LayoutGrid className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <h3 className="truncate font-medium">{board.name}</h3>
                        <p className="truncate text-sm text-muted-foreground">{board.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex h-32 items-center justify-center text-muted-foreground">
                  No boards yet. Create one to get started!
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Task Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">To Do</span>
                    <span className="font-medium">{tasks.filter((t) => t.status === "todo").length}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-chart-5"
                      style={{
                        width: `${tasks.length > 0 ? (tasks.filter((t) => t.status === "todo").length / tasks.length) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">In Progress</span>
                    <span className="font-medium">{tasks.filter((t) => t.status === "in-progress").length}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-chart-2"
                      style={{
                        width: `${tasks.length > 0 ? (tasks.filter((t) => t.status === "in-progress").length / tasks.length) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Done</span>
                    <span className="font-medium">{tasks.filter((t) => t.status === "done").length}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-chart-4"
                      style={{
                        width: `${tasks.length > 0 ? (tasks.filter((t) => t.status === "done").length / tasks.length) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedLayout>
  )
}
