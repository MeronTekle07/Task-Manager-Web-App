// Centralized API service with mock data

export interface Board {
  id: string
  name: string
  description: string
  createdAt: string
}

export interface Task {
  id: string
  boardId: string
  title: string
  description: string
  status: "todo" | "in-progress" | "done"
  priority: "low" | "medium" | "high"
  dueDate?: string
}

// Mock data storage
let mockBoards: Board[] = [
  {
    id: "1",
    name: "Website Redesign",
    description: "Complete overhaul of company website",
    createdAt: new Date().toISOString(),
  },
  {
    id: "2",
    name: "Mobile App Development",
    description: "Build iOS and Android applications",
    createdAt: new Date().toISOString(),
  },
]

let mockTasks: Task[] = [
  {
    id: "1",
    boardId: "1",
    title: "Design Homepage",
    description: "Create mockups for the new homepage design",
    status: "todo",
    priority: "high",
    dueDate: "2025-01-15",
  },
  {
    id: "2",
    boardId: "1",
    title: "Update Navigation",
    description: "Improve navigation structure",
    status: "in-progress",
    priority: "medium",
  },
  {
    id: "3",
    boardId: "1",
    title: "Optimize Images",
    description: "Compress and optimize all images",
    status: "done",
    priority: "low",
  },
]

// Simulate network delay
const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms))

// Board API
export const boardsApi = {
  getAll: async (): Promise<Board[]> => {
    await delay()
    return [...mockBoards]
  },

  getById: async (id: string): Promise<Board | undefined> => {
    await delay()
    return mockBoards.find((board) => board.id === id)
  },

  create: async (data: Omit<Board, "id" | "createdAt">): Promise<Board> => {
    await delay()
    const newBoard: Board = {
      ...data,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    }
    mockBoards.push(newBoard)
    return newBoard
  },

  update: async (id: string, data: Partial<Board>): Promise<Board> => {
    await delay()
    const index = mockBoards.findIndex((board) => board.id === id)
    if (index === -1) throw new Error("Board not found")
    mockBoards[index] = { ...mockBoards[index], ...data }
    return mockBoards[index]
  },

  delete: async (id: string): Promise<void> => {
    await delay()
    mockBoards = mockBoards.filter((board) => board.id !== id)
    mockTasks = mockTasks.filter((task) => task.boardId !== id)
  },
}

// Task API
export const tasksApi = {
  getByBoardId: async (boardId: string): Promise<Task[]> => {
    await delay()
    return mockTasks.filter((task) => task.boardId === boardId)
  },

  create: async (data: Omit<Task, "id">): Promise<Task> => {
    await delay()
    const newTask: Task = {
      ...data,
      id: Date.now().toString(),
    }
    mockTasks.push(newTask)
    return newTask
  },

  update: async (id: string, data: Partial<Task>): Promise<Task> => {
    await delay()
    const index = mockTasks.findIndex((task) => task.id === id)
    if (index === -1) throw new Error("Task not found")
    mockTasks[index] = { ...mockTasks[index], ...data }
    return mockTasks[index]
  },

  delete: async (id: string): Promise<void> => {
    await delay()
    mockTasks = mockTasks.filter((task) => task.id !== id)
  },
}
