"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { ICON_MAP } from "@/lib/icons";
import { Area } from "@/services/area.service";

interface AreaBubbleProps {
  area: Area;
  index: number;
  onEdit: (area: Area) => void;
  onDelete: (id: string) => void;
}

export default function AreaBubble({ area, index, onEdit, onDelete }: AreaBubbleProps) {
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
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.3 }}
      transition={{ delay: index * 0.05, type: "spring", stiffness: 300, damping: 20 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="flex flex-col items-center gap-2 cursor-pointer select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setConfirmDelete(false);
      }}
      data-testid="area-bubble"
    >
      <div className="relative">
        {isHovered && !confirmDelete && (
          <button
            onClick={handleEditClick}
            aria-label="Editar área"
            className="absolute -top-2 -right-2 z-10 w-7 h-7 rounded-full bg-[#1f2330] border border-[#2a3040] flex items-center justify-center cursor-pointer text-[#9ca3af] hover:text-[#e8d5a3] hover:border-[#a88a3d] transition-all duration-150"
          >
            <Pencil size={11} />
          </button>
        )}

        {isHovered && !confirmDelete && (
          <button
            onClick={handleDeleteClick}
            aria-label="Deletar área"
            className="absolute -top-2 -left-2 z-10 w-7 h-7 rounded-full bg-[#1f2330] border border-[#2a3040] flex items-center justify-center cursor-pointer text-[#9ca3af] hover:text-red-400 hover:border-red-500 transition-all duration-150"
          >
            <Trash2 size={11} />
          </button>
        )}

        <div
          onClick={handleBodyClick}
          role="button"
          aria-label={`Abrir área ${area.name}`}
          className="w-24 h-24 sm:w-28 sm:h-28 rounded-full flex items-center justify-center"
          style={{
            backgroundColor: area.color,
            boxShadow: isHovered
              ? `0 8px 32px ${area.color}60, 0 0 0 2px ${area.color}30`
              : `0 4px 16px ${area.color}40`,
            transition: "box-shadow 0.25s ease",
          }}
        >
          <Icon size={36} className="text-white drop-shadow-sm" />
        </div>

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
    </motion.div>
  );
}
