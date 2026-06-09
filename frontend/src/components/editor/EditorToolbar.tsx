"use client";

import type { Editor } from "@tiptap/react";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  CheckSquare,
  Quote,
  Code,
} from "lucide-react";

interface EditorToolbarProps {
  editor: Editor | null;
}

function Sep() {
  return <div className="w-px h-4 bg-[#1f2330] mx-1" />;
}

export default function EditorToolbar({ editor }: EditorToolbarProps) {
  function btn(
    title: string,
    icon: React.ReactNode,
    action: () => void,
    active: boolean
  ) {
    return (
      <button
        key={title}
        title={title}
        aria-label={title}
        onClick={action}
        disabled={!editor}
        className={`p-1.5 rounded transition-colors cursor-pointer ${
          active
            ? "bg-[#2a3040] text-[#e8d5a3]"
            : "text-[#9ca3af] hover:bg-[#1f2330] hover:text-[#e2e8f0]"
        } disabled:opacity-40 disabled:cursor-not-allowed`}
      >
        {icon}
      </button>
    );
  }

  return (
    <div className="flex items-center gap-0.5 px-4 py-2 border-b border-[#1f2330] flex-wrap shrink-0">
      {btn(
        "Negrito",
        <Bold size={14} />,
        () => editor?.chain().focus().toggleBold().run(),
        editor?.isActive("bold") ?? false
      )}
      {btn(
        "Itálico",
        <Italic size={14} />,
        () => editor?.chain().focus().toggleItalic().run(),
        editor?.isActive("italic") ?? false
      )}
      {btn(
        "Sublinhado",
        <Underline size={14} />,
        () => editor?.chain().focus().toggleUnderline().run(),
        editor?.isActive("underline") ?? false
      )}
      {btn(
        "Tachado",
        <Strikethrough size={14} />,
        () => editor?.chain().focus().toggleStrike().run(),
        editor?.isActive("strike") ?? false
      )}
      <Sep />
      {btn(
        "Título 1",
        <Heading1 size={14} />,
        () => editor?.chain().focus().toggleHeading({ level: 1 }).run(),
        editor?.isActive("heading", { level: 1 }) ?? false
      )}
      {btn(
        "Título 2",
        <Heading2 size={14} />,
        () => editor?.chain().focus().toggleHeading({ level: 2 }).run(),
        editor?.isActive("heading", { level: 2 }) ?? false
      )}
      {btn(
        "Título 3",
        <Heading3 size={14} />,
        () => editor?.chain().focus().toggleHeading({ level: 3 }).run(),
        editor?.isActive("heading", { level: 3 }) ?? false
      )}
      <Sep />
      {btn(
        "Lista com marcadores",
        <List size={14} />,
        () => editor?.chain().focus().toggleBulletList().run(),
        editor?.isActive("bulletList") ?? false
      )}
      {btn(
        "Lista numerada",
        <ListOrdered size={14} />,
        () => editor?.chain().focus().toggleOrderedList().run(),
        editor?.isActive("orderedList") ?? false
      )}
      {btn(
        "Lista de tarefas",
        <CheckSquare size={14} />,
        () => editor?.chain().focus().toggleTaskList().run(),
        editor?.isActive("taskList") ?? false
      )}
      <Sep />
      {btn(
        "Citação",
        <Quote size={14} />,
        () => editor?.chain().focus().toggleBlockquote().run(),
        editor?.isActive("blockquote") ?? false
      )}
      {btn(
        "Código",
        <Code size={14} />,
        () => editor?.chain().focus().toggleCode().run(),
        editor?.isActive("code") ?? false
      )}
    </div>
  );
}
