// Backend API service connecting to our authentication server

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export interface User {
  id: string;
  username: string;
  email: string;
  createdAt: string;
  avatar?: string;
  role?: "admin" | "member";
}

export interface Board {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  members?: string[]; // Array of user IDs who can access this board
}

export interface Task {
  id: string;
  boardId: string;
  title: string;
  description: string;
  status: "todo" | "in-progress" | "done";
  priority: "low" | "medium" | "high";
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  assignedTo?: string;
  tags?: string[];
  attachments?: string[];
}

export interface TaskComment {
  id: string;
  taskId: string;
  userId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface ActivityLog {
  id: string;
  userId: string;
  boardId: string;
  taskId?: string;
  action: "created" | "updated" | "deleted" | "assigned" | "commented" | "status_changed";
  details: string;
  createdAt: string;
}

// Auth API
export const authApi = {
  register: async (userData: { username: string; email: string; password: string }) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Registration failed');
    }
    
    return response.json();
  },

  login: async (credentials: { email: string; password: string }) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Login failed');
    }
    
    return response.json();
  },

  getMe: async (token: string): Promise<User> => {
    const response = await fetch(`${API_BASE_URL}/api/users/me`, {
      method: 'GET',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to get user info');
    }
    
    return response.json();
  },

  changePassword: async (token: string, passwords: { currentPassword: string; newPassword: string }) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/change-password`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(passwords),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Password change failed');
    }
    
    return response.json();
  },
};

// Users API
export const usersApi = {
  getAll: async (token: string): Promise<User[]> => {
    const response = await fetch(`${API_BASE_URL}/api/users`, {
      method: 'GET',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch users');
    }
    
    return response.json();
  },

  getById: async (token: string, id: string): Promise<User | undefined> => {
    const response = await fetch(`${API_BASE_URL}/api/users/${id}`, {
      method: 'GET',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch user');
    }
    
    return response.json();
  },
};

// Board API
export const boardsApi = {
  getAll: async (token: string): Promise<Board[]> => {
    const response = await fetch(`${API_BASE_URL}/api/boards`, {
      method: 'GET',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch boards');
    }
    
    return response.json();
  },

  getById: async (token: string, id: string): Promise<Board | undefined> => {
    const response = await fetch(`${API_BASE_URL}/api/boards/${id}`, {
      method: 'GET',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch board');
    }
    
    return response.json();
  },

  create: async (token: string, data: Omit<Board, "id" | "createdAt" | "updatedAt" | "userId">): Promise<Board> => {
    const response = await fetch(`${API_BASE_URL}/api/boards`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create board');
    }
    
    return response.json();
  },

  update: async (token: string, id: string, data: Partial<Board>): Promise<Board> => {
    const response = await fetch(`${API_BASE_URL}/api/boards/${id}`, {
      method: 'PUT',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update board');
    }
    
    return response.json();
  },

  delete: async (token: string, id: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/api/boards/${id}`, {
      method: 'DELETE',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete board');
    }
  },
};

// Tasks API
export const tasksApi = {
  getByBoardId: async (token: string, boardId: string): Promise<Task[]> => {
    const response = await fetch(`${API_BASE_URL}/api/boards/${boardId}/tasks`, {
      method: 'GET',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch tasks');
    }
    
    return response.json();
  },

  create: async (token: string, data: Omit<Task, "id" | "createdAt" | "updatedAt" | "userId">): Promise<Task> => {
    const response = await fetch(`${API_BASE_URL}/api/tasks`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create task');
    }
    
    return response.json();
  },

  update: async (token: string, id: string, data: Partial<Task>): Promise<Task> => {
    const response = await fetch(`${API_BASE_URL}/api/tasks/${id}`, {
      method: 'PUT',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update task');
    }
    
    return response.json();
  },

  delete: async (token: string, id: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/api/tasks/${id}`, {
      method: 'DELETE',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete task');
    }
  },

  assignToUser: async (token: string, taskId: string, assignedUserId: string): Promise<Task> => {
    const response = await fetch(`${API_BASE_URL}/api/tasks/${taskId}/assign`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ assignedTo: assignedUserId }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to assign task');
    }
    
    return response.json();
  },
};

// Comments API
export const commentsApi = {
  getByTaskId: async (token: string, taskId: string): Promise<TaskComment[]> => {
    const response = await fetch(`${API_BASE_URL}/api/tasks/${taskId}/comments`, {
      method: 'GET',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch comments');
    }
    
    return response.json();
  },

  create: async (token: string, data: Omit<TaskComment, "id" | "createdAt" | "updatedAt" | "userId">): Promise<TaskComment> => {
    const response = await fetch(`${API_BASE_URL}/api/comments`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create comment');
    }
    
    return response.json();
  },

  update: async (token: string, id: string, data: Partial<TaskComment>): Promise<TaskComment> => {
    const response = await fetch(`${API_BASE_URL}/api/comments/${id}`, {
      method: 'PUT',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update comment');
    }
    
    return response.json();
  },

  delete: async (token: string, id: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/api/comments/${id}`, {
      method: 'DELETE',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete comment');
    }
  },
};

// Activity Log API
export const activityApi = {
  getByBoardId: async (token: string, boardId: string): Promise<ActivityLog[]> => {
    const response = await fetch(`${API_BASE_URL}/api/boards/${boardId}/activities`, {
      method: 'GET',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch activities');
    }
    
    return response.json();
  },

  create: async (token: string, data: Omit<ActivityLog, "id" | "createdAt" | "userId">): Promise<ActivityLog> => {
    const response = await fetch(`${API_BASE_URL}/api/activities`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create activity');
    }
    
    return response.json();
  },
};
