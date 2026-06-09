"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";

interface ModalProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

export default function Modal({ title, onClose, children }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      <div className="relative w-full max-w-md mx-4 bg-[#13161d] border border-[#1f2330] rounded-2xl shadow-2xl p-6 animate-modal-in">
        <div className="flex items-center justify-between mb-5">
          <h2
            className="text-lg font-semibold text-[#e8d5a3]"
            style={{ fontFamily: "'DM Serif Display', 'Georgia', serif" }}
          >
            {title}
          </h2>
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="text-[#4b5563] hover:text-[#9ca3af] transition-colors"
          >
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
