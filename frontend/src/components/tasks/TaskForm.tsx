"use client";

import { useState } from "react";

interface TaskFormProps {
  onSubmit: (title: string) => void;
}

export default function TaskForm({ onSubmit }: TaskFormProps) {
  const [value, setValue] = useState("");

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      const trimmed = value.trim();
      if (trimmed) {
        onSubmit(trimmed);
        setValue("");
      }
    }
    if (e.key === "Escape") {
      setValue("");
    }
  }

  return (
    <div className="px-2 py-2 border-t border-[#1f2330]">
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Adicionar tarefa..."
        aria-label="Adicionar tarefa"
        className="w-full bg-transparent text-sm text-[#cbd5e1] placeholder-[#374151] outline-none"
      />
    </div>
  );
}
