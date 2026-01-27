"use client";

import { X } from "lucide-react";
import EditarMunicipioForm from "./EditarMunicipioForm";

interface Municipio {
  id: number;
  nombre: string;
  provinciaId: number;
}

interface Props {
  open: boolean;
  municipio: Municipio;
  onClose: () => void;
}

export default function EditarMunicipioModal({
  open,
  municipio,
  onClose,
}: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">

        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">
            Editar municipio
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <EditarMunicipioForm
          municipio={municipio}
          onSuccess={onClose}
          onCancel={onClose}
        />
      </div>
    </div>
  );
}