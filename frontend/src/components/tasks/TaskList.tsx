"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, CheckCircle2 } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { Task } from "@/services/task.service";
import TaskItem from "./TaskItem";
import TaskForm from "./TaskForm";
import EmptyState from "@/components/ui/EmptyState";

interface TaskListProps {
  tasks: Task[];
  areaColor: string;
  onToggle: (taskId: string) => void;
  onUpdate: (taskId: string, title: string) => void;
  onDelete: (taskId: string) => void;
  onAdd: (title: string) => void;
}

export default function TaskList({
  tasks,
  areaColor,
  onToggle,
  onUpdate,
  onDelete,
  onAdd,
}: TaskListProps) {
  const [completedOpen, setCompletedOpen] = useState(false);

  const pending = tasks
    .filter((t) => !t.completed)
    .sort((a, b) => a.order - b.order);
  const completed = tasks
    .filter((t) => t.completed)
    .sort((a, b) => a.order - b.order);

  return (
    <div className="flex flex-col">
      {pending.length === 0 && (
        <EmptyState
          icon={CheckCircle2}
          title="Nenhuma tarefa ainda"
          description="Adicione tarefas abaixo."
        />
      )}

      <AnimatePresence initial={false}>
        {pending.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            areaColor={areaColor}
            onToggle={onToggle}
            onUpdate={onUpdate}
            onDelete={onDelete}
          />
        ))}
      </AnimatePresence>

      <TaskForm onSubmit={onAdd} />

      {completed.length > 0 && (
        <div className="mt-4">
          <button
            onClick={() => setCompletedOpen((o) => !o)}
            className="cursor-pointer flex items-center gap-1.5 text-xs text-[#4b5563] hover:text-[#9ca3af] transition-colors px-2 py-1"
            aria-expanded={completedOpen}
            aria-label={`${completedOpen ? "Ocultar" : "Mostrar"} tarefas concluídas`}
          >
            {completedOpen ? (
              <ChevronDown size={12} />
            ) : (
              <ChevronRight size={12} />
            )}
            Concluídas ({completed.length})
          </button>

          <AnimatePresence>
            {completedOpen && (
              <div className="mt-1">
                <AnimatePresence initial={false}>
                  {completed.map((task) => (
                    <TaskItem
                      key={task.id}
                      task={task}
                      areaColor={areaColor}
                      onToggle={onToggle}
                      onUpdate={onUpdate}
                      onDelete={onDelete}
                    />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
