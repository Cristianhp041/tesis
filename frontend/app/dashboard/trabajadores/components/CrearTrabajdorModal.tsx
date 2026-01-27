"use client";

import { X } from "lucide-react";
import CrearTrabajadorForm from "./CrearTrabajadorForm";

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CrearTrabajadorModal({
  open,
  onClose,
  onSuccess,
}: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl p-6">

        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">
            Crear trabajador
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <CrearTrabajadorForm onSuccess={onSuccess} onCancel={onClose} />
      </div>
    </div>
  );
}