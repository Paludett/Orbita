import api from "@/lib/api";

export interface NoteSummary {
  id: string;
  title: string;
  updated_at: string;
}

export interface NoteDetail {
  id: string;
  title: string;
  content: string;
  area_id: string;
  created_at: string;
  updated_at: string;
}

export interface CreateNoteDto {
  title: string;
  content?: string;
}

export interface UpdateNoteDto {
  title?: string;
  content?: string;
}

export const noteService = {
  getAll: (areaId: string) =>
    api.get<NoteSummary[]>(`/areas/${areaId}/notes`),
  getById: (areaId: string, noteId: string) =>
    api.get<NoteDetail>(`/areas/${areaId}/notes/${noteId}`),
  create: (areaId: string, data: CreateNoteDto) =>
    api.post<NoteDetail>(`/areas/${areaId}/notes`, data),
  update: (areaId: string, noteId: string, data: UpdateNoteDto) =>
    api.patch<NoteDetail>(`/areas/${areaId}/notes/${noteId}`, data),
  delete: (areaId: string, noteId: string) =>
    api.delete(`/areas/${areaId}/notes/${noteId}`),
};
