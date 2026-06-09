"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import toast from "react-hot-toast";
import { useAreas, useDeleteArea } from "@/hooks/useAreas";
import { useAuthStore } from "@/store/auth.store";
import AreaGrid from "@/components/areas/AreaGrid";
import AreaModal from "@/components/areas/AreaModal";
import EmptyState from "@/components/ui/EmptyState";
import { SkeletonBubble } from "@/components/ui/Skeleton";
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
    deleteArea.mutate(id, {
      onSuccess: () => toast("Área removida", { icon: "🗑️", duration: 2000 }),
      onError: () => toast.error("Erro ao remover área. Tente novamente."),
    });
  }

  return (
    <div className="min-h-screen bg-[#0d0f14] relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
          backgroundSize: "128px 128px",
        }}
      />

      <div
        aria-hidden
        className="pointer-events-none fixed inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 50% -5%, rgba(168,138,61,0.08) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <header className="flex items-center justify-between mb-10">
          <span
            className="text-3xl font-bold tracking-tight text-[#e8d5a3]"
            style={{ fontFamily: "'DM Serif Display', 'Georgia', serif" }}
          >
            Orbita
          </span>
          <button
            onClick={logout}
            aria-label="Sair da conta"
            className="cursor-pointer text-sm text-[#4b5563] hover:text-[#9ca3af] transition-colors"
          >
            Sair
          </button>
        </header>

        <div className="flex items-center justify-between mb-8">
          <h1
            className="text-2xl font-semibold text-[#e5e7eb]"
            style={{ fontFamily: "'DM Serif Display', 'Georgia', serif" }}
          >
            Suas áreas
          </h1>
          <button
            onClick={() => setShowCreate(true)}
            aria-label="Criar nova área"
            className="cursor-pointer flex items-center gap-1.5 px-4 py-2 bg-[#a88a3d] hover:bg-[#c4a24a] text-[#0d0f14] text-sm font-semibold rounded-full transition-colors duration-200"
          >
            <span className="text-base leading-none">+</span>
            Nova área
          </button>
        </div>

        {isLoading && <SkeletonGridView />}

        {isError && (
          <div className="flex flex-col items-center gap-4 py-24 text-center">
            <p className="text-[#6b7280]">Falha ao carregar áreas.</p>
            <button
              onClick={() => refetch()}
              aria-label="Tentar carregar áreas novamente"
              className="cursor-pointer px-4 py-2 bg-[#1f2330] hover:bg-[#2a3040] text-[#9ca3af] text-sm rounded-lg transition-colors"
            >
              Tentar novamente
            </button>
          </div>
        )}

        {!isLoading && !isError && areas && areas.length === 0 && (
          <EmptyState
            icon={Sparkles}
            title="Crie sua primeira área"
            description="Organize sua vida em esferas de foco."
            action={{ label: "Criar primeira área", onClick: () => setShowCreate(true) }}
          />
        )}

        {!isLoading && !isError && areas && areas.length > 0 && (
          <AreaGrid areas={areas} onEdit={handleEdit} onDelete={handleDelete} />
        )}
      </div>

      {showCreate && (
        <AreaModal
          onClose={() => setShowCreate(false)}
          onSuccess={() => toast.success("Área criada")}
        />
      )}
      {editingArea && (
        <AreaModal
          area={editingArea}
          onClose={() => setEditingArea(null)}
          onSuccess={() => toast.success("Área atualizada")}
        />
      )}
    </div>
  );
}

function SkeletonGridView() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-8 pt-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex justify-center">
          <SkeletonBubble />
        </div>
      ))}
    </div>
  );
}
