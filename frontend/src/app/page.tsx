"use client";

import { useState } from "react";
import { useAreas, useDeleteArea } from "@/hooks/useAreas";
import { useAuthStore } from "@/store/auth.store";
import AreaGrid from "@/components/areas/AreaGrid";
import AreaModal from "@/components/areas/AreaModal";
import { Area } from "@/services/area.service";

export default function HomePage() {
  const { data: areas, isLoading, isError, refetch } = useAreas();
  const deleteArea = useDeleteArea();
  const logout = useAuthStore((s) => s.logout);

  const [showCreate, setShowCreate] = useState(false);
  const [editingArea, setEditingArea] = useState<Area | null>(null);

  function handleEdit(area: Area) {
    setEditingArea(area);
  }

  function handleDelete(id: string) {
    deleteArea.mutate(id);
  }

  return (
    <div className="min-h-screen bg-[#0d0f14] relative overflow-hidden">
      {/* Noise texture overlay */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
          backgroundSize: "128px 128px",
        }}
      />

      {/* Radial glow */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 50% -5%, rgba(168,138,61,0.08) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-8">
        {/* Header */}
        <header className="flex items-center justify-between mb-10">
          <span
            className="text-3xl font-bold tracking-tight text-[#e8d5a3]"
            style={{ fontFamily: "'DM Serif Display', 'Georgia', serif" }}
          >
            Orbita
          </span>
          <button
            onClick={logout}
            className="cursor-pointer text-sm text-[#4b5563] hover:text-[#9ca3af] transition-colors"
          >
            Sair
          </button>
        </header>

        {/* Title row */}
        <div className="flex items-center justify-between mb-8">
          <h1
            className="text-2xl font-semibold text-[#e5e7eb]"
            style={{ fontFamily: "'DM Serif Display', 'Georgia', serif" }}
          >
            Suas áreas
          </h1>
          <button
            onClick={() => setShowCreate(true)}
            className="cursor-pointer flex items-center gap-1.5 px-4 py-2 bg-[#a88a3d] hover:bg-[#c4a24a] text-[#0d0f14] text-sm font-semibold rounded-full transition-colors duration-200"
          >
            <span className="text-base leading-none">+</span>
            Nova área
          </button>
        </div>

        {/* Content */}
        {isLoading && <SkeletonGrid />}

        {isError && (
          <div className="flex flex-col items-center gap-4 py-24 text-center">
            <p className="text-[#6b7280]">Falha ao carregar áreas.</p>
            <button
              onClick={() => refetch()}
              className="cursor-pointer px-4 py-2 bg-[#1f2330] hover:bg-[#2a3040] text-[#9ca3af] text-sm rounded-lg transition-colors"
            >
              Tentar novamente
            </button>
          </div>
        )}

        {!isLoading && !isError && areas && areas.length === 0 && (
          <EmptyState onCreateClick={() => setShowCreate(true)} />
        )}

        {!isLoading && !isError && areas && areas.length > 0 && (
          <AreaGrid areas={areas} onEdit={handleEdit} onDelete={handleDelete} />
        )}
      </div>

      {/* Modals */}
      {showCreate && (
        <AreaModal onClose={() => setShowCreate(false)} />
      )}
      {editingArea && (
        <AreaModal area={editingArea} onClose={() => setEditingArea(null)} />
      )}
    </div>
  );
}

function EmptyState({ onCreateClick }: { onCreateClick: () => void }) {
  return (
    <div className="flex flex-col items-center gap-6 py-24 text-center">
      <div className="relative w-32 h-32">
        {[80, 110, 128].map((size, i) => (
          <div
            key={size}
            className="absolute inset-0 m-auto rounded-full border border-[#1a1e2a]"
            style={{ width: size, height: size, opacity: 0.8 - i * 0.2 }}
          />
        ))}
        <div className="absolute inset-0 m-auto w-10 h-10 rounded-full bg-[#1f2330] flex items-center justify-center">
          <span className="text-[#a88a3d] text-xl">✦</span>
        </div>
        <div
          className="absolute w-3 h-3 rounded-full bg-[#a88a3d]"
          style={{ top: "8px", left: "50%", transform: "translateX(-50%)" }}
        />
      </div>
      <div>
        <p className="text-[#9ca3af] text-base mb-1">Nenhuma área ainda.</p>
        <p className="text-[#4b5563] text-sm">
          Crie sua primeira área e organize sua vida em órbita.
        </p>
      </div>
      <button
        onClick={onCreateClick}
        className="cursor-pointer flex items-center gap-1.5 px-5 py-2.5 bg-[#a88a3d] hover:bg-[#c4a24a] text-[#0d0f14] font-semibold text-sm rounded-full transition-colors duration-200"
      >
        <span className="text-base leading-none">+</span>
        Criar primeira área
      </button>
    </div>
  );
}

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-8 pt-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex flex-col items-center gap-2">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-[#1f2330] animate-pulse" />
          <div className="w-16 h-2.5 rounded bg-[#1f2330] animate-pulse" />
        </div>
      ))}
    </div>
  );
}
