"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { NoteSummary } from "@/services/note.service";
import { relativeTime } from "@/lib/relativeTime";

interface NoteCardProps {
  note: NoteSummary;
  onClick: (noteId: string) => void;
  onDelete: (noteId: string) => void;
}

export default function NoteCard({ note, onClick, onDelete }: NoteCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  function handleDeleteClick(e: React.MouseEvent) {
    e.stopPropagation();
    setConfirmDelete(true);
  }

  function handleConfirmDelete(e: React.MouseEvent) {
    e.stopPropagation();
    onDelete(note.id);
  }

  function handleCancelDelete(e: React.MouseEvent) {
    e.stopPropagation();
    setConfirmDelete(false);
  }

  return (
    <div
      role="button"
      aria-label={`Abrir nota ${note.title}`}
      onClick={() => !confirmDelete && onClick(note.id)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setConfirmDelete(false);
      }}
      className="relative bg-[#1a1e28] border border-[#1f2330] rounded-xl p-4 cursor-pointer transition-all duration-200"
      style={{
        transform: isHovered ? "translateY(-2px)" : "translateY(0)",
        boxShadow: isHovered
          ? "0 8px 24px rgba(0,0,0,0.4)"
          : "0 2px 8px rgba(0,0,0,0.2)",
      }}
      data-testid="note-card"
    >
      <h3 className="text-sm font-semibold text-[#e2e8f0] truncate pr-6">
        {note.title}
      </h3>
      <p className="text-xs text-[#4b5563] mt-1">
        {relativeTime(note.updated_at)}
      </p>

      {isHovered && !confirmDelete && (
        <button
          onClick={handleDeleteClick}
          aria-label="Deletar nota"
          className="absolute top-3 right-3 w-6 h-6 rounded flex items-center justify-center cursor-pointer text-[#4b5563] hover:text-red-400 transition-colors"
        >
          <Trash2 size={13} />
        </button>
      )}

      {confirmDelete && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute inset-0 rounded-xl flex flex-col items-center justify-center bg-[#13161d]/90 backdrop-blur-sm gap-2"
        >
          <span className="text-xs text-red-400 font-medium">Deletar?</span>
          <div className="flex gap-2">
            <button
              onClick={handleConfirmDelete}
              aria-label="Confirmar deleção"
              className="px-3 py-1 bg-red-500 hover:bg-red-400 text-white text-xs font-medium rounded-full transition-colors cursor-pointer"
            >
              Sim
            </button>
            <button
              onClick={handleCancelDelete}
              aria-label="Cancelar deleção"
              className="px-3 py-1 bg-[#1f2330] hover:bg-[#2a3040] text-[#9ca3af] text-xs font-medium rounded-full transition-colors cursor-pointer"
            >
              Não
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
