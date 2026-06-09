import api from "@/lib/api";

export interface Area {
  id: string;
  name: string;
  color: string;
  icon: string;
  order: number;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface CreateAreaDto {
  name: string;
  color: string;
  icon: string;
  order?: number;
}

export interface UpdateAreaDto {
  name?: string;
  color?: string;
  icon?: string;
  order?: number;
}

export const areaService = {
  getAll: () => api.get<Area[]>("/areas"),
  getById: (id: string) => api.get<Area>(`/areas/${id}`),
  create: (data: CreateAreaDto) => api.post<Area>("/areas", data),
  update: (id: string, data: UpdateAreaDto) =>
    api.patch<Area>(`/areas/${id}`, data),
  delete: (id: string) => api.delete(`/areas/${id}`),
};
