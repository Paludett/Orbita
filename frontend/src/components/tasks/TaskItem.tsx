"use client";

import { useState, useRef, useEffect } from "react";
import { GripVertical, Pencil, Trash2, Check, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
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
  const [justChecked, setJustChecked] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const editValueRef = useRef(task.title);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  function handleToggle() {
    if (!task.completed) {
      setJustChecked(true);
      setTimeout(() => setJustChecked(false), 400);
    }
    onToggle(task.id);
  }

  function handleEditSave() {
    const trimmed = editValueRef.current.trim();
    if (trimmed && trimmed !== task.title) {
      onUpdate(task.id, trimmed);
    }
    setEditing(false);
  }

  function handleEditKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") handleEditSave();
    if (e.key === "Escape") {
      editValueRef.current = task.title;
      setEditValue(task.title);
      setEditing(false);
    }
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: 40 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className="group flex items-center gap-2 py-2 px-2 rounded-lg hover:bg-[#1a1e28] transition-colors"
      data-testid="task-item"
    >
      <GripVertical
        size={14}
        className="text-[#2a3040] group-hover:text-[#4b5563] transition-colors cursor-grab shrink-0"
        aria-hidden="true"
      />

      <motion.button
        onClick={handleToggle}
        aria-label={task.completed ? "Marcar como pendente" : "Marcar como concluída"}
        animate={justChecked ? { scale: [1, 1.35, 1] } : { scale: 1 }}
        transition={{ duration: 0.3 }}
        className="shrink-0 w-5 h-5 min-w-[44px] min-h-0 rounded border flex items-center justify-center transition-colors cursor-pointer"
        style={{
          borderColor: task.completed ? areaColor : "#374151",
          backgroundColor: task.completed ? areaColor : "transparent",
          minWidth: undefined,
          width: 20,
          height: 20,
        }}
      >
        <AnimatePresence>
          {task.completed && (
            <motion.span
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 20 }}
            >
              <Check size={10} className="text-white" />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      {editing ? (
        <input
          ref={inputRef}
          value={editValue}
          onChange={(e) => { setEditValue(e.target.value); editValueRef.current = e.target.value; }}
          onKeyDown={handleEditKeyDown}
          onBlur={handleEditSave}
          id={`task-edit-${task.id}`}
          className="flex-1 bg-[#1f2330] border border-[#2a3040] rounded px-2 py-0.5 text-sm text-[#e2e8f0] outline-none focus:border-[#a88a3d]"
          aria-label="Editar título da tarefa"
        />
      ) : (
        <span
          className="flex-1 text-sm transition-colors duration-200 relative"
          style={{
            color: task.completed ? "#4b5563" : "#cbd5e1",
            opacity: task.completed ? 0.6 : 1,
            textDecoration: task.completed ? "line-through" : "none",
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
            className="w-7 h-7 rounded flex items-center justify-center cursor-pointer text-[#4b5563] hover:text-[#9ca3af] transition-colors"
          >
            <Pencil size={12} />
          </button>
          <button
            onClick={() => setConfirmDelete(true)}
            aria-label="Deletar tarefa"
            className="w-7 h-7 rounded flex items-center justify-center cursor-pointer text-[#4b5563] hover:text-red-400 transition-colors"
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
    </motion.div>
  );
}
