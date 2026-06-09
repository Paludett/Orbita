import api from "@/lib/api";

export interface Task {
  id: string;
  title: string;
  description: string | null;
  completed: boolean;
  due_date: string | null;
  order: number;
  area_id: string;
  created_at: string;
  updated_at: string;
}

export interface CreateTaskDto {
  title: string;
  description?: string;
  due_date?: string;
  order?: number;
}

export interface UpdateTaskDto {
  title?: string;
  description?: string;
  due_date?: string;
  order?: number;
  completed?: boolean;
}

export const taskService = {
  getAll: (areaId: string) => api.get<Task[]>(`/areas/${areaId}/tasks`),
  create: (areaId: string, data: CreateTaskDto) =>
    api.post<Task>(`/areas/${areaId}/tasks`, data),
  update: (areaId: string, taskId: string, data: UpdateTaskDto) =>
    api.patch<Task>(`/areas/${areaId}/tasks/${taskId}`, data),
  toggle: (areaId: string, taskId: string) =>
    api.patch<Task>(`/areas/${areaId}/tasks/${taskId}/toggle`),
  delete: (areaId: string, taskId: string) =>
    api.delete(`/areas/${areaId}/tasks/${taskId}`),
};
