"use client";

import { Check } from "lucide-react";

const PRESET_COLORS = [
  "#ef4444",
  "#f97316",
  "#eab308",
  "#a88a3d",
  "#22c55e",
  "#10b981",
  "#06b6d4",
  "#3b82f6",
  "#6366f1",
  "#8b5cf6",
  "#ec4899",
  "#f43f5e",
  "#64748b",
  "#78716c",
  "#e8d5a3",
  "#ffffff",
];

const HEX_RE = /^#[0-9A-Fa-f]{6}$/;

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
}

export default function ColorPicker({ value, onChange }: ColorPickerProps) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-8 gap-2">
        {PRESET_COLORS.map((c) => (
          <button
            key={c}
            type="button"
            aria-label={c}
            onClick={() => onChange(c)}
            className="w-7 h-7 rounded-full relative border-2 transition-transform hover:scale-110"
            style={{
              backgroundColor: c,
              borderColor: value === c ? "#e8d5a3" : "transparent",
            }}
          >
            {value === c && (
              <Check
                size={12}
                className="absolute inset-0 m-auto text-black"
                strokeWidth={3}
              />
            )}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <div
          className="w-7 h-7 rounded-full border border-[#1f2330] shrink-0"
          style={{ backgroundColor: HEX_RE.test(value) ? value : "#13161d" }}
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#RRGGBB"
          maxLength={7}
          className="flex-1 bg-[#0d0f14] border border-[#1f2330] rounded-lg px-3 py-1.5 text-xs text-[#e5e7eb] placeholder-[#374151] focus:outline-none focus:border-[#a88a3d] focus:ring-1 focus:ring-[#a88a3d] transition-colors font-mono"
        />
      </div>
    </div>
  );
}
