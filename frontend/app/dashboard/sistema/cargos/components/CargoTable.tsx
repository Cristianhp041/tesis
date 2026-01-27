"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@apollo/client/react";
import { Edit } from "lucide-react";

import { GET_CARGOS } from "../graphql/getCargos";
import { Cargo } from "../types/cargo";
import CargoFilters from "./CargoFilters";
import EditarCargoModal from "./EditarCargoModal";

export default function CargoTable() {
  const { data, loading, error } = useQuery<{ cargos: Cargo[] }>(GET_CARGOS);

  const [editCargo, setEditCargo] = useState<Cargo | null>(null);
  const [filters, setFilters] = useState({
    search: "",
    activo: undefined as boolean | undefined,
  });

  const cargosFiltrados = useMemo(() => {
    const cargos = data?.cargos ?? [];

    return cargos.filter((cargo) => {
      if (
        filters.search &&
        !cargo.nombre.toLowerCase().includes(filters.search.toLowerCase())
      ) {
        return false;
      }

      if (filters.activo !== undefined && cargo.activo !== filters.activo) {
        return false;
      }

      return true;
    });
  }, [data?.cargos, filters]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6 text-sm text-red-500 text-center">
        Error al cargar cargos: {error.message}
      </div>
    );
  }

  return (
    <>
      <div className="mb-4">
        <CargoFilters
          value={filters}
          onChange={(partial) =>
            setFilters((prev) => ({ ...prev, ...partial }))
          }
        />
      </div>

      {cargosFiltrados.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-6 text-sm text-gray-500 text-center">
          No se encontraron cargos con los filtros aplicados
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Nombre
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200">
                {cargosFiltrados.map((cargo) => (
                  <tr key={cargo.id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {cargo.nombre}
                    </td>

                    <td className="px-4 py-3 text-center">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                          cargo.activo
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {cargo.activo ? "Activo" : "Inactivo"}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => setEditCargo(cargo)}
                        className="flex items-center justify-center space-x-1 text-blue-600 hover:text-blue-800 font-medium transition mx-auto"
                      >
                        <Edit className="w-4 h-4" />
                        <span>Editar</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {editCargo && (
        <EditarCargoModal
          open
          cargo={editCargo}
          onClose={() => setEditCargo(null)}
        />
      )}
    </>
  );
}