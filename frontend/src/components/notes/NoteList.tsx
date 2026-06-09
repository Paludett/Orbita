"use client";

import { FileText } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { NoteSummary } from "@/services/note.service";
import NoteCard from "./NoteCard";
import EmptyState from "@/components/ui/EmptyState";

interface NoteListProps {
  notes: NoteSummary[];
  onOpen: (noteId: string) => void;
  onDelete: (noteId: string) => void;
}

export default function NoteList({ notes, onOpen, onDelete }: NoteListProps) {
  if (notes.length === 0) {
    return (
      <EmptyState
        icon={FileText}
        title="Nenhuma nota ainda"
        description='Clique em "+ Nova nota" para começar.'
      />
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      <AnimatePresence>
        {notes.map((note, index) => (
          <NoteCard
            key={note.id}
            note={note}
            index={index}
            onClick={onOpen}
            onDelete={onDelete}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
