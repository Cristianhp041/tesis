"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@apollo/client/react";
import { Plus, Upload } from "lucide-react";
import { toast } from "sonner";

import CrearTrabajadorModal from "./components/CrearTrabajdorModal";
import EditarTrabajadorModal from "./components/EditarTrabajadorModal";
import ImportarTrabajadorModal from "./components/ImportarTrabajadorModal";
import TrabajadorTable from "./components/TrabajadorTable";
import TrabajadorFilters from "./components/TrabajadorFilter";
import TrabajadorBulkActions from "./components/TrabajadorBulkActions";

import { FILTER_TRABAJADORES } from "./graphql/filterTrabajadores";
import { DESACTIVAR_TRABAJADORES_MASIVO } from "./graphql/desactivarTrabajadoresMasivo";
import {
  FilterTrabajadoresResponse,
  Trabajador,
} from "./types/trabajador";

export default function TrabajadoresPage() {
  const [openModal, setOpenModal] = useState(false);
  const [openImportModal, setOpenImportModal] = useState(false);
  const [editando, setEditando] = useState<Trabajador | null>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [filters, setFilters] = useState({
    search: "",
    activo: undefined as boolean | undefined,
    cargoId: undefined as number | undefined,
    provinciaId: undefined as number | undefined,
  });

  const { data, loading, refetch } = useQuery<FilterTrabajadoresResponse>(
    FILTER_TRABAJADORES,
    {
      variables: {
        filters: {
          search: filters.search || undefined,
          activo: filters.activo,
          cargoId: filters.cargoId,
          provinciaId: filters.provinciaId,
        },
      },
      fetchPolicy: "cache-and-network",
    }
  );

  const [desactivarMasivo, { loading: desactivandoMasivo }] = useMutation(
    DESACTIVAR_TRABAJADORES_MASIVO,
    {
      refetchQueries: ["FilterTrabajadores"],
    }
  );

  const allTrabajadores = useMemo(() => {
    return data?.filterTrabajadores.data ?? [];
  }, [data?.filterTrabajadores.data]);

  const paginatedTrabajadores = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return allTrabajadores.slice(startIndex, endIndex);
  }, [allTrabajadores, currentPage, itemsPerPage]);

  const handleToggle = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleToggleAll = () => {
    if (selectedIds.length === paginatedTrabajadores.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(paginatedTrabajadores.map((t) => t.id));
    }
  };

  const handleDesactivarMasivo = async () => {
    if (selectedIds.length === 0) {
      toast.error("Seleccione al menos un trabajador");
      return;
    }

    try {
      await desactivarMasivo({
        variables: {
          data: {
            trabajadorIds: selectedIds,
          },
        },
      });

      toast.success(`✓ ${selectedIds.length} trabajador(es) desactivado(s)`);
      setSelectedIds([]);
      refetch();
    } catch (error) {
      toast.error("✗ Error al desactivar trabajadores");
      console.error(error);
    }
  };

  const handleFilterChange = (partial: Partial<typeof filters>) => {
    setFilters((prev) => ({ ...prev, ...partial }));
    setCurrentPage(1);
    setSelectedIds([]);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">

      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">
            Trabajadores
          </h1>
          <p className="text-slate-500">
            Gestión del personal
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setOpenImportModal(true)}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 shadow-lg transition"
          >
            <Upload size={20} />
            Importar
          </button>

          <button
            onClick={() => setOpenModal(true)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 shadow-lg transition"
          >
            <Plus size={20} />
            Crear Trabajador
          </button>
        </div>
      </div>

      <div className="mb-4">
        <TrabajadorFilters
          value={filters}
          onChange={handleFilterChange}
        />
      </div>

      <div className="mb-4">
        <TrabajadorBulkActions
          selectedIds={selectedIds}
          onDesactivar={handleDesactivarMasivo}
          desactivando={desactivandoMasivo}
        />
      </div>

      <TrabajadorTable
        trabajadores={paginatedTrabajadores}
        selectedIds={selectedIds}
        onToggle={handleToggle}
        onToggleAll={handleToggleAll}
        onEdit={(t) => setEditando(t)}
        currentPage={currentPage}
        itemsPerPage={itemsPerPage}
        totalItems={allTrabajadores.length}
        onPageChange={setCurrentPage}
        onItemsPerPageChange={setItemsPerPage}
      />

      <CrearTrabajadorModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        onSuccess={() => {
          setOpenModal(false);
          refetch();
        }}
      />

      <ImportarTrabajadorModal
        open={openImportModal}
        onClose={() => setOpenImportModal(false)}
        onSuccess={() => {
          setOpenImportModal(false);
          refetch();
        }}
      />

      {editando && (
        <EditarTrabajadorModal
          open
          trabajador={editando}
          onClose={() => {
            setEditando(null);
            refetch();
          }}
        />
      )}
    </div>
  );
}