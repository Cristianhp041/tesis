// app/dashboard/sistema/provincias/page.tsx
"use client";

import { useState } from "react";
import ProvinciaTable from "./components/ProvinciaTable";
import MunicipioTable from "./components/MunicipioTable";
import ProvinciaSelect from "./components/ProvinciaSelect";
import { Plus } from "lucide-react";
import CrearProvinciaModal from "./components/CrearProvinciaModal";
import CrearMunicipioModal from "./components/CrearMunicipioModal";

export default function ProvinciasPage() {
  const [openProvincia, setOpenProvincia] = useState(false);
  const [openMunicipio, setOpenMunicipio] = useState(false);
  const [provinciaId, setProvinciaId] = useState<number | null>(null);

  return (
    <div className="max-w-7xl mx-auto">
      {/* HEADER PRINCIPAL */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">
            Provincias y Municipios
          </h1>
          <p className="text-slate-500">
            Gestión geográfica del sistema
          </p>
        </div>

        <button
          onClick={() => setOpenProvincia(true)}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 shadow-lg transition"
        >
          <Plus size={20} />
          Crear Provincia
        </button>
      </div>

      {/* SECCIÓN PROVINCIAS */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-slate-700 mb-4">
          Provincias
        </h2>
        <ProvinciaTable />
      </div>

      {/* SECCIÓN MUNICIPIOS */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-700">
            Municipios
          </h2>

          <button
            onClick={() => setOpenMunicipio(true)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 shadow-lg transition"
          >
            <Plus size={20} />
            Crear Municipio
          </button>
        </div>

        {/* Selector de Provincia */}
        <div className="mb-4">
          <ProvinciaSelect
            value={provinciaId ?? undefined}
            onChange={setProvinciaId}
          />
        </div>

        {/* Tabla de Municipios */}
        <MunicipioTable provinciaId={provinciaId} />
      </div>

      {/* MODALES */}
      <CrearProvinciaModal
        open={openProvincia}
        onClose={() => setOpenProvincia(false)}
      />

      <CrearMunicipioModal
        open={openMunicipio}
        onClose={() => setOpenMunicipio(false)}
      />
    </div>
  );
}