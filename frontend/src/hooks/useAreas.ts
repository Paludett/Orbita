import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  areaService,
  Area,
  CreateAreaDto,
  UpdateAreaDto,
} from "@/services/area.service";

const AREAS_KEY = ["areas"] as const;

export function useAreas() {
  return useQuery({
    queryKey: AREAS_KEY,
    queryFn: () => areaService.getAll().then((r) => r.data),
    staleTime: 1000 * 60 * 5,
  });
}

export function useCreateArea() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateAreaDto) =>
      areaService.create(data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: AREAS_KEY }),
  });
}

export function useUpdateArea() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAreaDto }) =>
      areaService.update(id, data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: AREAS_KEY }),
  });
}

export function useDeleteArea() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => areaService.delete(id),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: AREAS_KEY });
      const previous = qc.getQueryData<Area[]>(AREAS_KEY);
      qc.setQueryData<Area[]>(
        AREAS_KEY,
        (old) => old?.filter((a) => a.id !== id) ?? []
      );
      return { previous };
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.previous) qc.setQueryData(AREAS_KEY, ctx.previous);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: AREAS_KEY }),
  });
}
