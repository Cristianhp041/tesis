"use client";

import { X } from "lucide-react";
import EditarSubclasificacionForm from "./EditarSubclasificacionForm";
import { Subclasificacion } from "../types/subclasificacion";

interface Props {
  open: boolean;
  sub: Subclasificacion;
  onClose: () => void;
}

export default function EditarSubclasificacionModal({
  open,
  sub,
  onClose,
}: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">

        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">
            Editar subclasificación
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <EditarSubclasificacionForm
          key={sub.id}
          sub={sub}
          onSuccess={onClose}
          onCancel={onClose}
        />
      </div>
    </div>
  );
}