"use client";

import { useState } from "react";
import SubclasificacionTable from "./components/Subclasificaciontable";
import CrearSubclasificacionModal from "./components/CrearSubclasificacionModal";
import { Plus } from "lucide-react";

export default function SubclasificacionesPage() {
  const [openModal, setOpenModal] = useState(false);

  return (
    <div className="max-w-7xl mx-auto">

      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">
            Subclasificaciones
          </h1>
          <p className="text-slate-500">
            Clasificación y tipologías del sistema
          </p>
        </div>

        <button
          onClick={() => setOpenModal(true)}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 shadow-lg transition"
        >
          <Plus size={20} />
          Crear Subclasificación
        </button>
      </div>

      <SubclasificacionTable />

      <CrearSubclasificacionModal
        open={openModal}
        onClose={() => setOpenModal(false)}
      />
    </div>
  );
}