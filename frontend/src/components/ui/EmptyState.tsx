"use client";

import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: { label: string; onClick: () => void };
}

export default function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-4 py-16 text-center px-4">
      <div className="w-12 h-12 rounded-full bg-[#1f2330] flex items-center justify-center">
        <Icon size={22} className="text-[#4b5563]" />
      </div>
      <div>
        <p className="text-sm font-medium text-[#6b7280] mb-1">{title}</p>
        <p className="text-xs text-[#374151]">{description}</p>
      </div>
      {action && (
        <button
          onClick={action.onClick}
          className="cursor-pointer mt-1 px-4 py-2 bg-[#1f2330] hover:bg-[#2a3040] text-[#9ca3af] text-sm rounded-lg transition-colors border border-[#2a3040]"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
