"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNote, useUpdateNote } from "@/hooks/useNotes";
import RichTextEditor from "@/components/editor/RichTextEditor";
import { SkeletonText } from "@/components/ui/Skeleton";

interface NoteModalProps {
  areaId: string;
  noteId: string;
  onClose: () => void;
}

export default function NoteModal({ areaId, noteId, onClose }: NoteModalProps) {
  const { data: note, isLoading } = useNote(areaId, noteId);
  const updateNote = useUpdateNote(areaId);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const firstFocusRef = useRef<HTMLInputElement>(null);
  const initialized = useRef(false);

  useEffect(() => {
    if (note && !initialized.current) {
      setTitle(note.title);
      setContent(note.content);
      initialized.current = true;
    }
  }, [note]);

  useEffect(() => {
    setTimeout(() => firstFocusRef.current?.focus(), 50);
  }, []);

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

  function handleContentChange(html: string) {
    setContent(html);
    scheduleAutoSave(title, html);
  }

  return (
    <AnimatePresence>
      <motion.div
        ref={overlayRef}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4"
        onClick={(e) => {
          if (e.target === overlayRef.current) onClose();
        }}
        role="dialog"
        aria-modal="true"
        aria-label="Modal de nota"
      >
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.97 }}
          transition={{ type: "spring", stiffness: 350, damping: 28 }}
          className="relative w-full sm:max-w-2xl bg-[#13161d] border border-[#1f2330] rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[90vh] sm:max-h-[80vh]"
        >
          <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-[#1f2330] shrink-0">
            {isLoading ? (
              <SkeletonText className="flex-1 mr-4" />
            ) : (
              <input
                ref={firstFocusRef}
                value={title}
                onChange={handleTitleChange}
                placeholder="Título"
                aria-label="Título da nota"
                id="note-title"
                className="flex-1 bg-transparent text-xl font-semibold text-[#e8d5a3] outline-none placeholder-[#374151]"
                style={{ fontFamily: "'DM Serif Display', 'Georgia', serif" }}
              />
            )}
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
                aria-label="Fechar modal de nota"
                className="cursor-pointer text-[#4b5563] hover:text-[#9ca3af] transition-colors w-8 h-8 flex items-center justify-center rounded"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {isLoading ? (
            <div className="p-6 flex flex-col gap-3">
              <SkeletonText lines={3} />
              <SkeletonText lines={2} />
              <SkeletonText lines={4} />
            </div>
          ) : (
            <RichTextEditor
              content={content}
              onChange={handleContentChange}
              placeholder="Escreva aqui..."
            />
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
