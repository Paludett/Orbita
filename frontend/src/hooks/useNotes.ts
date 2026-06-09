import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  noteService,
  NoteSummary,
  CreateNoteDto,
  UpdateNoteDto,
} from "@/services/note.service";

const notesKey = (areaId: string) => ["notes", areaId] as const;
const noteKey = (areaId: string, noteId: string) =>
  ["notes", areaId, noteId] as const;

export function useNotes(areaId: string) {
  return useQuery({
    queryKey: notesKey(areaId),
    queryFn: () => noteService.getAll(areaId).then((r) => r.data),
    staleTime: 1000 * 60 * 2,
  });
}

export function useNote(areaId: string, noteId: string) {
  return useQuery({
    queryKey: noteKey(areaId, noteId),
    queryFn: () => noteService.getById(areaId, noteId).then((r) => r.data),
    staleTime: 0,
  });
}

export function useCreateNote(areaId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateNoteDto) =>
      noteService.create(areaId, data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: notesKey(areaId) }),
  });
}

export function useUpdateNote(areaId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      noteId,
      data,
    }: {
      noteId: string;
      data: UpdateNoteDto;
    }) => noteService.update(areaId, noteId, data).then((r) => r.data),
    onSuccess: (updated) => {
      qc.invalidateQueries({ queryKey: notesKey(areaId) });
      qc.setQueryData(noteKey(areaId, updated.id), updated);
    },
  });
}

export function useDeleteNote(areaId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (noteId: string) => noteService.delete(areaId, noteId),
    onMutate: async (noteId) => {
      await qc.cancelQueries({ queryKey: notesKey(areaId) });
      const previous = qc.getQueryData<NoteSummary[]>(notesKey(areaId));
      qc.setQueryData<NoteSummary[]>(notesKey(areaId), (old) =>
        old?.filter((n) => n.id !== noteId) ?? []
      );
      return { previous };
    },
    onError: (_err, _noteId, ctx) => {
      if (ctx?.previous) qc.setQueryData(notesKey(areaId), ctx.previous);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: notesKey(areaId) }),
  });
}
