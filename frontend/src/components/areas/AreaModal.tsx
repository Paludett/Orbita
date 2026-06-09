"use client";

import { useState } from "react";
import Modal from "@/components/ui/Modal";
import ColorPicker from "@/components/ui/ColorPicker";
import IconPicker from "@/components/ui/IconPicker";
import { useCreateArea, useUpdateArea } from "@/hooks/useAreas";
import { Area } from "@/services/area.service";

const HEX_RE = /^#[0-9A-Fa-f]{6}$/;

interface AreaModalProps {
  area?: Area;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function AreaModal({ area, onClose, onSuccess }: AreaModalProps) {
  const isEdit = !!area;

  const [name, setName] = useState(area?.name ?? "");
  const [color, setColor] = useState(area?.color ?? "#a88a3d");
  const [icon, setIcon] = useState(area?.icon ?? "Star");
  const [nameError, setNameError] = useState("");

  const createArea = useCreateArea();
  const updateArea = useUpdateArea();

  const isPending = createArea.isPending || updateArea.isPending;

  function validate(): boolean {
    if (!name.trim()) {
      setNameError("Nome é obrigatório.");
      return false;
    }
    if (!HEX_RE.test(color)) {
      setNameError("Cor deve ser um hex válido (#RRGGBB).");
      return false;
    }
    setNameError("");
    return true;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    try {
      if (isEdit && area) {
        await updateArea.mutateAsync({
          id: area.id,
          data: { name: name.trim(), color, icon },
        });
      } else {
        await createArea.mutateAsync({ name: name.trim(), color, icon });
      }
      onSuccess?.();
      onClose();
    } catch {
      setNameError("Erro ao salvar. Tente novamente.");
    }
  }

  return (
    <Modal title={isEdit ? "Editar área" : "Nova área"} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        {/* Name */}
        <div>
          <label className="block text-xs font-medium text-[#9ca3af] mb-1.5">
            Nome
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Trabalho, Saúde, Finanças…"
            maxLength={100}
            className="w-full bg-[#0d0f14] border border-[#1f2330] rounded-lg px-3.5 py-2.5 text-sm text-[#e5e7eb] placeholder-[#374151] focus:outline-none focus:border-[#a88a3d] focus:ring-1 focus:ring-[#a88a3d] transition-colors"
          />
        </div>

        {/* Color */}
        <div>
          <label className="block text-xs font-medium text-[#9ca3af] mb-2">
            Cor
          </label>
          <ColorPicker value={color} onChange={setColor} />
        </div>

        {/* Icon */}
        <div>
          <label className="block text-xs font-medium text-[#9ca3af] mb-2">
            Ícone
          </label>
          <IconPicker value={icon} onChange={setIcon} />
        </div>

        {/* Error */}
        {nameError && (
          <p role="alert" className="text-xs text-red-400">
            {nameError}
          </p>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer flex-1 py-2.5 rounded-lg border border-[#1f2330] text-sm text-[#6b7280] hover:text-[#9ca3af] hover:border-[#2a3040] transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="cursor-pointer flex-1 py-2.5 rounded-lg bg-[#a88a3d] hover:bg-[#c4a24a] disabled:opacity-60 disabled:cursor-not-allowed text-[#0d0f14] font-semibold text-sm transition-colors flex items-center justify-center gap-2"
          >
            {isPending && <Spinner />}
            {isEdit ? "Salvar" : "Criar"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function Spinner() {
  return (
    <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
    </svg>
  );
}
