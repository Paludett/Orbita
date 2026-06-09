"use client";

import { AnimatePresence } from "framer-motion";
import { Area } from "@/services/area.service";
import AreaBubble from "./AreaBubble";

interface AreaGridProps {
  areas: Area[];
  onEdit: (area: Area) => void;
  onDelete: (id: string) => void;
}

export default function AreaGrid({ areas, onEdit, onDelete }: AreaGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-8 pt-4">
      <AnimatePresence>
        {areas.map((area, index) => (
          <div key={area.id} className="flex justify-center">
            <AreaBubble area={area} index={index} onEdit={onEdit} onDelete={onDelete} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
}
