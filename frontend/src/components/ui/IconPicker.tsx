"use client";

import { ICON_MAP, ICON_NAMES } from "@/lib/icons";

interface IconPickerProps {
  value: string;
  onChange: (icon: string) => void;
}

export default function IconPicker({ value, onChange }: IconPickerProps) {
  return (
    <div className="grid grid-cols-5 gap-2">
      {ICON_NAMES.map((name) => {
        const Icon = ICON_MAP[name];
        const selected = value === name;
        return (
          <button
            key={name}
            type="button"
            aria-label={name}
            onClick={() => onChange(name)}
            className="flex flex-col items-center gap-1 p-2 rounded-lg transition-all duration-150 hover:bg-[#1f2330]"
            style={{
              backgroundColor: selected ? "#1f2330" : undefined,
              outline: selected ? "1.5px solid #a88a3d" : "none",
            }}
          >
            <Icon
              size={20}
              className={selected ? "text-[#e8d5a3]" : "text-[#6b7280]"}
            />
            <span className="text-[9px] text-[#6b7280] truncate w-full text-center leading-none">
              {name}
            </span>
          </button>
        );
      })}
    </div>
  );
}
