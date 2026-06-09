"use client";

function SkeletonBase({ className = "", style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div
      className={`relative overflow-hidden bg-[#1f2330] rounded ${className}`}
      style={style}
      aria-hidden="true"
    >
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-[#ffffff08] to-transparent" />
    </div>
  );
}

export function SkeletonCircle({ size = 96 }: { size?: number }) {
  return (
    <SkeletonBase
      className="rounded-full shrink-0"
      style={{ width: size, height: size }}
    />
  );
}

export function SkeletonText({
  lines = 1,
  className = "",
}: {
  lines?: number;
  className?: string;
}) {
  return (
    <div className={`flex flex-col gap-2 ${className}`} aria-hidden="true">
      {Array.from({ length: lines }).map((_, i) => (
        <SkeletonBase
          key={i}
          className="h-3 rounded"
          style={i === lines - 1 && lines > 1 ? { width: "60%" } : { width: "100%" }}
        />
      ))}
    </div>
  );
}

export function SkeletonCard({ className = "" }: { className?: string }) {
  return (
    <div
      className={`bg-[#1a1e28] border border-[#1f2330] rounded-xl p-4 flex flex-col gap-3 ${className}`}
      aria-hidden="true"
    >
      <SkeletonBase className="h-4 w-3/4 rounded" />
      <SkeletonBase className="h-3 w-1/3 rounded" />
    </div>
  );
}

export function SkeletonBubble() {
  return (
    <div className="flex flex-col items-center gap-2" aria-hidden="true">
      <SkeletonCircle size={96} />
      <SkeletonBase className="h-2.5 w-16 rounded" />
    </div>
  );
}

export function SkeletonTaskLine() {
  return (
    <div className="flex items-center gap-2 py-2 px-2" aria-hidden="true">
      <SkeletonBase className="w-4 h-4 rounded" />
      <SkeletonBase className="h-3 flex-1 rounded" />
    </div>
  );
}
