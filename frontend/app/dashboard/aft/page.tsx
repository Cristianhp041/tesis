"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@apollo/client/react";
import { Plus, Upload } from "lucide-react";

import { GET_AFTS } from "./graphql/getAfts";
import { Aft } from "./types/aft";
import { AftFilterState } from "./types/aftFilters";
import AftFilters from "./components/AftFilters";
import AftTable from "./components/AftTable";
import AftBulkActions from "./components/AftBulkActions";
import EditarAftModal from "./components/EditarAftModal";
import AftHistorialModal from "./components/AftHistorialModal";
import CrearAftModal from "./components/CrearAftModal";
import ImportarAftModal from "./components/ImportarAftModal";

export default function AftPage() {
  const { data, loading, error, refetch } = useQuery<{ afts: Aft[] }>(GET_AFTS);
  const [openCrear, setOpenCrear] = useState(false);
  const [openImportar, setOpenImportar] = useState(false);

  const [filters, setFilters] = useState<AftFilterState>({});
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [aftSeleccionado, setAftSeleccionado] = useState<Aft | null>(null);
  const [openEditar, setOpenEditar] = useState(false);
  const [openHistorial, setOpenHistorial] = useState(false);

  const allFilteredAfts = useMemo(() => {
    const afts = data?.afts ?? [];

    return afts.filter((aft) => {
      if (
        filters.search &&
        !`${aft.rotulo} ${aft.nombre}`
          .toLowerCase()
          .includes(filters.search.toLowerCase())
      )
        return false;

      if (filters.areaId && aft.area?.id !== filters.areaId) return false;
      if (
        filters.subclasificacionId &&
        aft.subclasificacion?.id !== filters.subclasificacionId
      )
        return false;
      if (filters.activo !== undefined && aft.activo !== filters.activo)
        return false;

      return true;
    });
  }, [data?.afts, filters]);

  const paginatedAfts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return allFilteredAfts.slice(startIndex, endIndex);
  }, [allFilteredAfts, currentPage, itemsPerPage]);

  const toggle = (id: number) =>
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );

  const toggleAll = () => {
    if (selectedIds.length === paginatedAfts.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(paginatedAfts.map((a) => a.id));
    }
  };

  const handleFilterChange = (partial: Partial<AftFilterState>) => {
    setFilters((prev) => ({ ...prev, ...partial }));
    setCurrentPage(1);
    setSelectedIds([]);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-red-800">Error al cargar AFT</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">
            Activos Fijos Tangibles
          </h1>
          <p className="text-slate-500">
            Control e inventario institucional
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setOpenImportar(true)}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 shadow-lg transition"
          >
            <Upload size={20} />
            Importar AFT
          </button>

          <button
            onClick={() => setOpenCrear(true)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 shadow-lg transition"
          >
            <Plus size={20} />
            Crear AFT
          </button>
        </div>
      </div>

      <div className="mb-4">
        <AftFilters
          {...filters}
          onChange={handleFilterChange}
        />
      </div>

      <div className="mb-4">
        <AftBulkActions
          selectedIds={selectedIds}
          clearSelection={() => setSelectedIds([])}
        />
      </div>

      <AftTable
        afts={paginatedAfts}
        selectedIds={selectedIds}
        onToggle={toggle}
        onToggleAll={toggleAll}
        onEdit={(aft) => {
          setAftSeleccionado(aft);
          setOpenEditar(true);
        }}
        onViewHistory={(aft) => {
          setAftSeleccionado(aft);
          setOpenHistorial(true);
        }}
        currentPage={currentPage}
        itemsPerPage={itemsPerPage}
        totalItems={allFilteredAfts.length}
        onPageChange={setCurrentPage}
        onItemsPerPageChange={setItemsPerPage}
      />

      {openEditar && aftSeleccionado && (
        <EditarAftModal
          open
          aft={aftSeleccionado}
          onClose={() => setOpenEditar(false)}
        />
      )}

      {openHistorial && aftSeleccionado && (
        <AftHistorialModal
          open
          aftId={aftSeleccionado.id}
          onClose={() => setOpenHistorial(false)}
        />
      )}

      <CrearAftModal
        open={openCrear}
        onClose={() => setOpenCrear(false)}
      />

      <ImportarAftModal
        open={openImportar}
        onClose={() => setOpenImportar(false)}
        onSuccess={() => {
          refetch();
          setOpenImportar(false);
        }}
      />
    </div>
  );
}