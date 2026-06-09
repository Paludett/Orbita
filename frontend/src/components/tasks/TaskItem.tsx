"use client";

import { useState, useRef, useEffect } from "react";
import { GripVertical, Pencil, Trash2, Check, X } from "lucide-react";
import { Task } from "@/services/task.service";

interface TaskItemProps {
  task: Task;
  areaColor: string;
  onToggle: (taskId: string) => void;
  onUpdate: (taskId: string, title: string) => void;
  onDelete: (taskId: string) => void;
}

export default function TaskItem({
  task,
  areaColor,
  onToggle,
  onUpdate,
  onDelete,
}: TaskItemProps) {
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(task.title);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  function handleEditSave() {
    const trimmed = editValue.trim();
    if (trimmed && trimmed !== task.title) {
      onUpdate(task.id, trimmed);
    }
    setEditing(false);
  }

  function handleEditKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") handleEditSave();
    if (e.key === "Escape") {
      setEditValue(task.title);
      setEditing(false);
    }
  }

  return (
    <div
      className="group flex items-center gap-2 py-2 px-2 rounded-lg hover:bg-[#1a1e28] transition-colors"
      data-testid="task-item"
    >
      <GripVertical
        size={14}
        className="text-[#2a3040] group-hover:text-[#4b5563] transition-colors cursor-grab shrink-0"
        aria-hidden="true"
      />

      <button
        onClick={() => onToggle(task.id)}
        aria-label={task.completed ? "Marcar como pendente" : "Marcar como concluída"}
        className="shrink-0 w-4 h-4 rounded border flex items-center justify-center transition-all cursor-pointer"
        style={{
          borderColor: task.completed ? areaColor : "#374151",
          backgroundColor: task.completed ? areaColor : "transparent",
        }}
      >
        {task.completed && <Check size={10} className="text-white" />}
      </button>

      {editing ? (
        <input
          ref={inputRef}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleEditKeyDown}
          onBlur={handleEditSave}
          className="flex-1 bg-[#1f2330] border border-[#2a3040] rounded px-2 py-0.5 text-sm text-[#e2e8f0] outline-none focus:border-[#a88a3d]"
          aria-label="Editar título da tarefa"
        />
      ) : (
        <span
          className="flex-1 text-sm transition-all duration-200"
          style={{
            color: task.completed ? "#4b5563" : "#cbd5e1",
            textDecoration: task.completed ? "line-through" : "none",
            opacity: task.completed ? 0.6 : 1,
          }}
        >
          {task.title}
        </span>
      )}

      {!editing && !confirmDelete && (
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => {
              setEditValue(task.title);
              setEditing(true);
            }}
            aria-label="Editar tarefa"
            className="w-6 h-6 rounded flex items-center justify-center cursor-pointer text-[#4b5563] hover:text-[#9ca3af] transition-colors"
          >
            <Pencil size={12} />
          </button>
          <button
            onClick={() => setConfirmDelete(true)}
            aria-label="Deletar tarefa"
            className="w-6 h-6 rounded flex items-center justify-center cursor-pointer text-[#4b5563] hover:text-red-400 transition-colors"
          >
            <Trash2 size={12} />
          </button>
        </div>
      )}

      {confirmDelete && (
        <div className="flex items-center gap-1">
          <span className="text-xs text-red-400">Deletar?</span>
          <button
            onClick={() => onDelete(task.id)}
            aria-label="Confirmar deleção"
            className="px-2 py-0.5 bg-red-500 hover:bg-red-400 text-white text-xs rounded transition-colors cursor-pointer"
          >
            Sim
          </button>
          <button
            onClick={() => setConfirmDelete(false)}
            aria-label="Cancelar deleção"
            className="w-5 h-5 flex items-center justify-center cursor-pointer text-[#4b5563] hover:text-[#9ca3af] transition-colors"
          >
            <X size={12} />
          </button>
        </div>
      )}

      {!task.completed && !editing && !confirmDelete && (
        <div
          className="shrink-0 w-1.5 h-1.5 rounded-full"
          style={{ backgroundColor: areaColor }}
          aria-hidden="true"
        />
      )}
    </div>
  );
}
