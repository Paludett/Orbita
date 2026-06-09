"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import CharacterCount from "@tiptap/extension-character-count";
import { useEffect, useRef } from "react";
import EditorToolbar from "./EditorToolbar";
import "./editor.css";

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
  editable?: boolean;
  showToolbar?: boolean;
  characterLimit?: number;
}

export default function RichTextEditor({
  content,
  onChange,
  placeholder = "Escreva algo...",
  editable = true,
  showToolbar = true,
  characterLimit = 10000,
}: RichTextEditorProps) {
  const lastHtmlRef = useRef(content);

  const editor = useEditor(
    {
      immediatelyRender: false,
      extensions: [
        StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
        Underline,
        Placeholder.configure({ placeholder }),
        TaskList,
        TaskItem.configure({ nested: true }),
        CharacterCount.configure({ limit: characterLimit }),
      ],
      content,
      editable,
      onUpdate: ({ editor: e }) => {
        const html = e.getHTML();
        if (html !== lastHtmlRef.current) {
          lastHtmlRef.current = html;
          onChange(html);
        }
      },
    },
    []
  );

  useEffect(() => {
    if (editor && content !== lastHtmlRef.current) {
      lastHtmlRef.current = content;
      editor.commands.setContent(content, { emitUpdate: false });
    }
  }, [content, editor]);

  useEffect(() => {
    if (editor) {
      editor.setEditable(editable);
    }
  }, [editable, editor]);

  const charCount = editor?.storage.characterCount?.characters() ?? 0;
  const isNearLimit = charCount / characterLimit > 0.9;

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {showToolbar && editable && <EditorToolbar editor={editor ?? null} />}
      <EditorContent
        editor={editor}
        className="flex-1 overflow-y-auto px-6 py-4"
      />
      <div
        className={`px-6 pb-3 text-xs text-right select-none ${
          isNearLimit ? "text-red-400" : "text-[#4b5563]"
        }`}
      >
        {charCount}/{characterLimit}
      </div>
    </div>
  );
}
