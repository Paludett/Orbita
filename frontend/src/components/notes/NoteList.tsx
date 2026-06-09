"use client";

import { NoteSummary } from "@/services/note.service";
import NoteCard from "./NoteCard";

interface NoteListProps {
  notes: NoteSummary[];
  onOpen: (noteId: string) => void;
  onDelete: (noteId: string) => void;
}

export default function NoteList({ notes, onOpen, onDelete }: NoteListProps) {
  if (notes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-[#374151] text-sm">Nenhuma nota ainda.</p>
        <p className="text-[#2a3040] text-xs mt-1">
          Clique em &quot;+ Nova nota&quot; para começar.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      {notes.map((note) => (
        <NoteCard
          key={note.id}
          note={note}
          onClick={onOpen}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
