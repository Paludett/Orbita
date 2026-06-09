"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { X } from "lucide-react";
import { useNote, useUpdateNote } from "@/hooks/useNotes";

interface NoteModalProps {
  areaId: string;
  noteId: string;
  onClose: () => void;
}

export default function NoteModal({ areaId, noteId, onClose }: NoteModalProps) {
  const { data: note } = useNote(areaId, noteId);
  const updateNote = useUpdateNote(areaId);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);

  useEffect(() => {
    if (note && !initialized.current) {
      setTitle(note.title);
      setContent(note.content);
      initialized.current = true;
    }
  }, [note]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const scheduleAutoSave = useCallback(
    (newTitle: string, newContent: string) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      setSaveStatus("saving");
      debounceRef.current = setTimeout(async () => {
        await updateNote.mutateAsync({
          noteId,
          data: { title: newTitle, content: newContent },
        });
        setSaveStatus("saved");
        setTimeout(() => setSaveStatus("idle"), 2000);
      }, 1000);
    },
    [noteId, updateNote]
  );

  function handleTitleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setTitle(e.target.value);
    scheduleAutoSave(e.target.value, content);
  }

  function handleContentChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setContent(e.target.value);
    scheduleAutoSave(title, e.target.value);
  }

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      <div className="relative w-full max-w-2xl mx-4 bg-[#13161d] border border-[#1f2330] rounded-2xl shadow-2xl flex flex-col animate-modal-in max-h-[80vh]">
        <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-[#1f2330] shrink-0">
          <input
            value={title}
            onChange={handleTitleChange}
            placeholder="Título"
            aria-label="Título da nota"
            className="flex-1 bg-transparent text-xl font-semibold text-[#e8d5a3] outline-none placeholder-[#374151]"
            style={{ fontFamily: "'DM Serif Display', 'Georgia', serif" }}
          />
          <div className="flex items-center gap-3 ml-4 shrink-0">
            {saveStatus === "saving" && (
              <span className="text-xs text-[#4b5563]" aria-live="polite">
                Salvando...
              </span>
            )}
            {saveStatus === "saved" && (
              <span className="text-xs text-[#4b5563]" aria-live="polite">
                Salvo
              </span>
            )}
            <button
              onClick={onClose}
              aria-label="Fechar"
              className="cursor-pointer text-[#4b5563] hover:text-[#9ca3af] transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <textarea
          value={content}
          onChange={handleContentChange}
          placeholder="Escreva aqui..."
          aria-label="Conteúdo da nota"
          className="flex-1 bg-transparent px-6 py-4 text-sm text-[#cbd5e1] placeholder-[#374151] outline-none resize-none min-h-[300px]"
        />
      </div>
    </div>
  );
}
