"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Task } from "@/services/task.service";
import TaskItem from "./TaskItem";
import TaskForm from "./TaskForm";

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
        <p className="text-sm text-[#374151] px-2 py-4 text-center">
          Nenhuma tarefa pendente
        </p>
      )}

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

      <TaskForm onSubmit={onAdd} />

      {completed.length > 0 && (
        <div className="mt-4">
          <button
            onClick={() => setCompletedOpen((o) => !o)}
            className="cursor-pointer flex items-center gap-1.5 text-xs text-[#4b5563] hover:text-[#9ca3af] transition-colors px-2 py-1"
            aria-expanded={completedOpen}
          >
            {completedOpen ? (
              <ChevronDown size={12} />
            ) : (
              <ChevronRight size={12} />
            )}
            Concluídas ({completed.length})
          </button>

          {completedOpen && (
            <div className="mt-1">
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
            </div>
          )}
        </div>
      )}
    </div>
  );
}
