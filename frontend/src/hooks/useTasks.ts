import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { taskService, Task, CreateTaskDto, UpdateTaskDto } from "@/services/task.service";

const tasksKey = (areaId: string) => ["tasks", areaId] as const;

export function useTasks(areaId: string) {
  return useQuery({
    queryKey: tasksKey(areaId),
    queryFn: () => taskService.getAll(areaId).then((r) => r.data),
    staleTime: 1000 * 60 * 2,
  });
}

export function useCreateTask(areaId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateTaskDto) =>
      taskService.create(areaId, data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: tasksKey(areaId) }),
  });
}

export function useUpdateTask(areaId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ taskId, data }: { taskId: string; data: UpdateTaskDto }) =>
      taskService.update(areaId, taskId, data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: tasksKey(areaId) }),
  });
}

export function useToggleTask(areaId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (taskId: string) =>
      taskService.toggle(areaId, taskId).then((r) => r.data),
    onMutate: async (taskId) => {
      await qc.cancelQueries({ queryKey: tasksKey(areaId) });
      const previous = qc.getQueryData<Task[]>(tasksKey(areaId));
      qc.setQueryData<Task[]>(tasksKey(areaId), (old) =>
        old?.map((t) =>
          t.id === taskId ? { ...t, completed: !t.completed } : t
        ) ?? []
      );
      return { previous };
    },
    onError: (_err, _taskId, ctx) => {
      if (ctx?.previous) qc.setQueryData(tasksKey(areaId), ctx.previous);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: tasksKey(areaId) }),
  });
}

export function useDeleteTask(areaId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (taskId: string) => taskService.delete(areaId, taskId),
    onMutate: async (taskId) => {
      await qc.cancelQueries({ queryKey: tasksKey(areaId) });
      const previous = qc.getQueryData<Task[]>(tasksKey(areaId));
      qc.setQueryData<Task[]>(tasksKey(areaId), (old) =>
        old?.filter((t) => t.id !== taskId) ?? []
      );
      return { previous };
    },
    onError: (_err, _taskId, ctx) => {
      if (ctx?.previous) qc.setQueryData(tasksKey(areaId), ctx.previous);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: tasksKey(areaId) }),
  });
}
