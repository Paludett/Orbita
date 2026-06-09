"use client";

import { useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, Plus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { areaService } from "@/services/area.service";
import { ICON_MAP } from "@/lib/icons";
import { useTasks, useToggleTask, useUpdateTask, useDeleteTask, useCreateTask } from "@/hooks/useTasks";
import { useNotes, useCreateNote, useDeleteNote } from "@/hooks/useNotes";
import TaskList from "@/components/tasks/TaskList";
import NoteList from "@/components/notes/NoteList";
import NoteModal from "@/components/notes/NoteModal";
import { SkeletonTaskLine, SkeletonCard } from "@/components/ui/Skeleton";

type Tab = "tasks" | "notes";

export default function AreaDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const areaId = params.id as string;

  const tabParam = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState<Tab>(
    tabParam === "notes" ? "notes" : "tasks"
  );
  const [openNoteId, setOpenNoteId] = useState<string | null>(null);

  const { data: area, isLoading: areaLoading } = useQuery({
    queryKey: ["area", areaId],
    queryFn: () => areaService.getById(areaId).then((r) => r.data),
  });

  const { data: tasks = [], isLoading: tasksLoading } = useTasks(areaId);
  const { data: notes = [], isLoading: notesLoading } = useNotes(areaId);

  const createTask = useCreateTask(areaId);
  const toggleTask = useToggleTask(areaId);
  const updateTask = useUpdateTask(areaId);
  const deleteTask = useDeleteTask(areaId);

  const createNote = useCreateNote(areaId);
  const deleteNote = useDeleteNote(areaId);

  function handleTabChange(tab: Tab) {
    setActiveTab(tab);
    const url = new URL(window.location.href);
    url.searchParams.set("tab", tab);
    router.replace(url.pathname + url.search);
  }

  async function handleNewNote() {
    const note = await createNote.mutateAsync({ title: "Nova nota", content: "" });
    setOpenNoteId(note.id);
  }

  function handleToggleTask(taskId: string) {
    const task = tasks.find((t) => t.id === taskId);
    toggleTask.mutate(taskId, {
      onSuccess: () => {
        if (!task?.completed) {
          toast("Tarefa concluída!", { icon: "✓", duration: 1500 });
        }
      },
      onError: () => toast.error("Algo deu errado. Tente novamente."),
    });
  }

  function handleDeleteNote(noteId: string) {
    deleteNote.mutate(noteId, {
      onSuccess: () => toast("Nota removida", { icon: "🗑️", duration: 2000 }),
      onError: () => toast.error("Algo deu errado. Tente novamente."),
    });
  }

  const Icon = area ? (ICON_MAP[area.icon] ?? ICON_MAP["Star"]) : null;
  const areaColor = area?.color ?? "#6b7280";

  if (areaLoading) {
    return (
      <div className="min-h-screen bg-[#0d1017] flex items-center justify-center">
        <div
          className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: "#e8d5a3", borderTopColor: "transparent" }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d1017] text-[#e2e8f0]">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={() => router.push("/")}
            aria-label="Voltar para página inicial"
            className="cursor-pointer flex items-center gap-1 text-sm text-[#4b5563] hover:text-[#9ca3af] transition-colors min-h-[44px] px-1"
          >
            <ChevronLeft size={16} />
            Voltar
          </button>

          {area && (
            <div
              className="flex items-center gap-2 border-l pl-3"
              style={{ borderColor: `${areaColor}50` }}
            >
              {Icon && <Icon size={18} style={{ color: areaColor }} />}
              <h1 className="text-lg font-semibold" style={{ color: areaColor }}>
                {area.name}
              </h1>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-0 border-b border-[#1f2330] mb-6 relative">
          {(["tasks", "notes"] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => handleTabChange(tab)}
              aria-selected={activeTab === tab}
              role="tab"
              className="cursor-pointer px-4 py-2 text-sm font-medium transition-colors relative min-h-[44px]"
              style={{ color: activeTab === tab ? areaColor : "#4b5563" }}
            >
              {tab === "tasks" ? "Tarefas" : "Notas"}
              {activeTab === tab && (
                <span
                  className="absolute bottom-0 left-0 right-0 h-0.5 transition-all duration-200"
                  style={{ backgroundColor: areaColor }}
                />
              )}
            </button>
          ))}
        </div>

        {/* Tasks tab */}
        {activeTab === "tasks" && (
          <div className="bg-[#13161d] border border-[#1f2330] rounded-xl overflow-hidden">
            {tasksLoading ? (
              <div className="py-2 px-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <SkeletonTaskLine key={i} />
                ))}
              </div>
            ) : (
              <TaskList
                tasks={tasks}
                areaColor={areaColor}
                onToggle={handleToggleTask}
                onUpdate={(taskId, title) =>
                  updateTask.mutate({ taskId, data: { title } })
                }
                onDelete={(taskId) =>
                  deleteTask.mutate(taskId, {
                    onError: () => toast.error("Algo deu errado. Tente novamente."),
                  })
                }
                onAdd={(title) =>
                  createTask.mutate(
                    { title, order: tasks.length },
                    { onError: () => toast.error("Algo deu errado. Tente novamente.") }
                  )
                }
              />
            )}
          </div>
        )}

        {/* Notes tab */}
        {activeTab === "notes" && (
          <div>
            <div className="flex justify-end mb-4">
              <button
                onClick={handleNewNote}
                disabled={createNote.isPending}
                aria-label="Criar nova nota"
                className="cursor-pointer flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all min-h-[44px]"
                style={{
                  backgroundColor: `${areaColor}20`,
                  color: areaColor,
                  border: `1px solid ${areaColor}30`,
                }}
              >
                <Plus size={14} />
                Nova nota
              </button>
            </div>

            {notesLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            ) : (
              <NoteList
                notes={notes}
                onOpen={(noteId) => setOpenNoteId(noteId)}
                onDelete={handleDeleteNote}
              />
            )}
          </div>
        )}
      </div>

      {openNoteId && (
        <NoteModal
          areaId={areaId}
          noteId={openNoteId}
          onClose={() => setOpenNoteId(null)}
        />
      )}
    </div>
  );
}
