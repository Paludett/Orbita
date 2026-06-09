"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
import { ICON_MAP } from "@/lib/icons";
import { Area } from "@/services/area.service";

interface AreaBubbleProps {
  area: Area;
  onEdit: (area: Area) => void;
  onDelete: (id: string) => void;
}

export default function AreaBubble({ area, onEdit, onDelete }: AreaBubbleProps) {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const Icon = ICON_MAP[area.icon] ?? ICON_MAP["Star"];

  function handleBodyClick() {
    if (!confirmDelete) {
      router.push(`/areas/${area.id}`);
    }
  }

  function handleDeleteClick(e: React.MouseEvent) {
    e.stopPropagation();
    setConfirmDelete(true);
  }

  function handleConfirmDelete(e: React.MouseEvent) {
    e.stopPropagation();
    onDelete(area.id);
    setConfirmDelete(false);
  }

  function handleCancelDelete(e: React.MouseEvent) {
    e.stopPropagation();
    setConfirmDelete(false);
  }

  function handleEditClick(e: React.MouseEvent) {
    e.stopPropagation();
    onEdit(area);
  }

  return (
    <div
      className="flex flex-col items-center gap-2 cursor-pointer select-none area-bubble-enter"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setConfirmDelete(false);
      }}
      data-testid="area-bubble"
    >
      <div className="relative">
        {/* Edit button */}
        {isHovered && !confirmDelete && (
          <button
            onClick={handleEditClick}
            aria-label="Editar área"
            className="absolute -top-2 -right-2 z-10 w-6 h-6 rounded-full bg-[#1f2330] border border-[#2a3040] flex items-center justify-center cursor-pointer text-[#9ca3af] hover:text-[#e8d5a3] hover:border-[#a88a3d] transition-all duration-150"
          >
            <Pencil size={11} />
          </button>
        )}

        {/* Delete button */}
        {isHovered && !confirmDelete && (
          <button
            onClick={handleDeleteClick}
            aria-label="Deletar área"
            className="absolute -top-2 -left-2 z-10 w-6 h-6 rounded-full bg-[#1f2330] border border-[#2a3040] flex items-center justify-center cursor-pointer text-[#9ca3af] hover:text-red-400 hover:border-red-500 transition-all duration-150"
          >
            <Trash2 size={11} />
          </button>
        )}

        {/* Bubble */}
        <div
          onClick={handleBodyClick}
          role="button"
          aria-label={`Abrir área ${area.name}`}
          className="w-24 h-24 sm:w-28 sm:h-28 rounded-full flex items-center justify-center transition-all duration-250"
          style={{
            backgroundColor: area.color,
            boxShadow: isHovered
              ? `0 8px 32px ${area.color}60, 0 0 0 2px ${area.color}30`
              : `0 4px 16px ${area.color}40`,
            transform: isHovered ? "scale(1.07)" : "scale(1)",
          }}
        >
          <Icon size={36} className="text-white drop-shadow-sm" />
        </div>

        {/* Inline delete confirm */}
        {confirmDelete && (
          <div
            onClick={(e) => e.stopPropagation()}
            className="absolute inset-0 rounded-full flex flex-col items-center justify-center bg-[#13161d]/90 backdrop-blur-sm border border-red-500/30 gap-1.5"
          >
            <span className="text-[10px] text-red-400 font-medium text-center leading-tight px-1">
              Deletar?
            </span>
            <div className="flex gap-1">
              <button
                onClick={handleConfirmDelete}
                aria-label="Confirmar deleção"
                className="px-2 py-0.5 bg-red-500 hover:bg-red-400 text-white text-[10px] font-medium rounded-full transition-colors cursor-pointer"
              >
                Sim
              </button>
              <button
                onClick={handleCancelDelete}
                aria-label="Cancelar deleção"
                className="px-2 py-0.5 bg-[#1f2330] hover:bg-[#2a3040] text-[#9ca3af] text-[10px] font-medium rounded-full transition-colors cursor-pointer"
              >
                Não
              </button>
            </div>
          </div>
        )}
      </div>

      <span className="text-xs text-[#9ca3af] font-medium text-center max-w-28 truncate">
        {area.name}
      </span>
    </div>
  );
}
